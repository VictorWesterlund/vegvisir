class Navigation {
	constructor(source) {
		this.worker = new Worker("/workers/NavigationWorker.js");
		this.worker.addEventListener("message", event => this.messageHandler(event));

		// The root element used for top navigations (and the default target)
		this.main = document.getElementsByTagName("main")[0];

		// Create URL object from string or event
		if (!(source instanceof URL)) {
			if (typeof source === "string") {
				this.url = this.urlFromString(source);
			}

			// Handle events
			if (source instanceof Event) {
				this.eventHandler(source);
			}
		} else {
			// Source is a URL object, use it directly
			this.url = source;
		}
	}

	// Push new entry with History API
	historyPush(url) {
		// Create URL object from string
		url = url instanceof URL ? url : new URL(url);

		if (url.pathname.substring(0, 6) === "/error") {
			return false;
		}

		if (url.pathname === "/index") {
			url.pathname = "/";
		}

		const state = {
			url: url.toString()
		}

		history.pushState(state, "", url);
	}

	// Replace inner DOM of target with an SVG spinner
	waiting(target) {
		this.setTargetHtml(target, globalThis.spinnerSvg);
	}

	// Scroll to anchor element in DOM
	scrollToAnchor() {
		const hash = window.location.hash.substring(1);
		const anchor = document.getElementById(hash) ?? null;

		// Scroll top to anchor element if it exists in the DOM
		if (anchor !== null) {
			const top = document.getElementById("top");
			top.scrollTo(0, anchor.offsetTop);
		}
	}

	// Replace inner DOM of target element with stringified HTML
	setTargetHtml(target, html) {
		target = target instanceof HTMLElement ? target : document.querySelector(target);
		target.innerHTML = html;

		target.scrollTo(0, 0); // Reset scroll position of wrapper
		target.parentElement.parentElement.scrollTo(0, 0); // Also reset scroll position for root element (Safari)

		// Rebuild script tags as they don't execute with innerHTML per the HTML spec
		const scripts = [...target.getElementsByTagName("script")];
		scripts.forEach(script => {
			const tag = document.createElement("script");

			// Assign element attributes
			for (const attribute of script.getAttributeNames()) {
				tag.setAttribute(attribute, script.getAttribute(attribute));
			}
			
			tag.innerHTML = `{${script.innerText}}`;

			script.remove();
			target.appendChild(tag);
		});

		// URL is a top navigation and contains a hash
		if (target.id == "top" && window.location.hash.length > 0) {
			this.scrollToAnchor();
		}
	}

	// Turn URL string or pathname into a URL object
	urlFromString(string) {
		let url = undefined;

		try {
			url = new URL(string);
		} catch {
			// Treat invalid URL as a pathname
			url = new URL(window.location.href);
			url.pathname = string;
		}

		// Carry existing top searchParams to new location
		url.search = new URLSearchParams({
			...Object.fromEntries(new URLSearchParams(window.location.search)),
			...Object.fromEntries(new URLSearchParams(url.search))
		}).toString();

		return url;
	}

	// Extract URL and target from received event
	eventHandler(event) {
		event.preventDefault();

		// Is activation type event
		if (event.constructor === PointerEvent || event.constructor === MouseEvent) {
			const element = event.target.closest("a");
			let target = element.getAttribute("target");

			this.url = this.urlFromString(element.href);
			
			// Use the target attribute of the element to determine where to inject loaded content
			switch (target) {
				// Replace inner DOM of the the clicked element
				case "_self":
					target = event.target;
					break;

				// Replace inner DOM of target's closest parent element (will remove clicked element from DOM)
				case "_parent":
					target = element.parentElement;
					break;

				// Replace element inner DOM by id, or default to #top (#top will update URL and History API)
				case "_top":
				default:
					target = document.getElementById(target) ?? document.getElementById("top");
					break;
			}

			this.navigate(target);
		}
	}

	// Get CSS Selector from DOM node
	getCssSelector(element) {
		// Traverse the node tree backwards from target element
		const path = [];
		while (element.parentNode) {
			// We found an id, stop here and use it as the entry point
			if (element.id) {
				path.unshift("#" + element.id);
				break;
			}

			const parent = element.parentElement;
			const index = [...parent.children]?.indexOf(element) + 1;

			if (parent === document.documentElement) {
				path.unshift(element.tagName);
				break;
			}

			path.unshift(`${element.tagName}:nth-child(${index})`);
			element = parent;
		}

		return path.join(" > ");
	}

	// Handle generic messages from Worker
	messageHandler(event) {
		switch (event.data[0]) {
			case "META":
				console.log("Metadata received");
				break;
		}
	}

	// Perform SPA navigation by fetching new page and modifing DOM
	async navigate(target = null, rejectOnFail = false) {
		target = target ?? this.main;
		
		// Tell Worker to fetch page
		const selector = this.getCssSelector(target);
		this.worker.postMessage([selector, this.url.toString()]);

		const respTimeout = setTimeout(() => this.waiting(target), 300);

		// Wait for Worker to fetch page
		const nav = await new Promise((resolve) => {
			this.worker.addEventListener("message", (event) => {
				clearTimeout(respTimeout);
				let [target, body, status, url] = event.data;
				url = new URL(url);

				// Target is a valid top navigation, do some stuff
				if (status === 200 && (target === "main")) {
					// Add loaded URL to history
					this.historyPush(url);
				}

				// Update DOM and resolve this and outer Promise
				this.setTargetHtml(target, body);
				resolve(event.data);
			}, { once: true });
		});

		// Create new Respone and pass HTTP status code
		const resp =  new Response(nav[1], { status: nav[2]});

		// Resolve Promise with Response
		if (!rejectOnFail) {
			return Promise.resolve(resp);
		}

		// Align Promise completion with Response status
		return resp.ok ? Promise.resolve(resp) : Promise.reject(resp);
	}
}