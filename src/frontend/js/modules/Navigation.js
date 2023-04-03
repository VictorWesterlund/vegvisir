// Multi-threaded SPA navigation handler
class Navigation {

	// Default options object used when constructing this class
	static options = {
		carrySearchParams: false
	}

	constructor(source, options = {}) {
		// Spin up dedicated worker
		this.worker = new Worker("/_pragma_wrkr/NavigationWorker.js");
		// Listen for status messages from worker
		this.worker.addEventListener("message", event => this.messageHandler(event));

		// Merge default options with overrides
		this.options = {};
		this.options = Object.assign(this.options, Navigation.options, options);

		// The root element used for top navigations (and the default target)
		this.main = document.querySelector(globalThis._pragma.selector_main_element);

		// Build URL from various sources
		switch (source.constructor) {
			case URL:
				this.url = source;
				break;

			case PointerEvent:
			case MouseEvent:
				this.url = this.eventHandler(source);
				break;

			case String:
			default:
				this.url = this.urlFromString(source);
		}
	}

	// Push new entry with History API
	historyPush(url) {
		// Create URL instance from string
		url = url instanceof URL ? url : new URL(url);

		// Navigations to the env env page_index should be treated as root "/"
		if (url.pathname.substring(url.pathname.length - globalThis._pragma.page_index.length) === globalThis._pragma.page_index) {
			url.pathname = url.pathname.substring(0, url.pathname.length - globalThis._pragma.page_index.length);
		}

		// Push entry to browser's session history stack
		history.pushState({
			url: url.toString(),
			options: this.options
		}, "", url.toString());
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
		if (this.options.carrySearchParams) {
			url.search = new URLSearchParams({
				...Object.fromEntries(new URLSearchParams(window.location.search)),
				...Object.fromEntries(new URLSearchParams(url.search))
			});
		}

		return url.toString();
	}

	// Extract URL and target from received event
	eventHandler(event) {
		// Is activation type event
		const element = event.target.closest("a");

		if (!element) {
			console.error("Pragma:Navigation: No anchor tag found between target and root", event.target);
			return;
		}

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

			// Page is to be opened in a new tab. Do normal browser behaviour
			case "_blank":
				console.warn("Pragma:Navigation: target='_blank' from Navigation is not supported");
				return window.open(this.url);

			// Perform a normal navigation of the main element
			case "_top":
			default:
				target = this.main;
				break;
		}

		this.navigate(target);
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
		// Nothing here yet
		return;
	}

	// Emit a loading/loaded event on window and target
	dispatchEvents(name, target = null) {
		// Emit "loading" or "loaded" event depending on truthiness of loading variable
		const event = new Event(name, {
			detail: {
				target: target,
				page: this.url
			}
		});

		// Always dispatch on document
		document.dispatchEvent(event);

		// Also dispatch directly on target if set
		if (target instanceof HTMLElement) {
			target.dispatchEvent(event);
		}
	}

	// Perform SPA navigation by fetching new page and modifing DOM
	async navigate(target = null, rejectOnFail = false) {
		target = target ?? this.main;
		this.dispatchEvents("pragmaloading", target);
		
		// Tell Worker to fetch page
		const selector = this.getCssSelector(target);
		this.worker.postMessage([selector, this.url.toString()]);

		const respTimeout = setTimeout(() => this.dispatchEvents("pragmawaiting", target), 300);

		// Wait for Worker to fetch page
		const nav = await new Promise((resolve) => {
			this.worker.addEventListener("message", (event) => {
				clearTimeout(respTimeout);
				let [targetSelector, body, status, url] = event.data;

				// Update DOM and resolve this and outer Promise
				this.setTargetHtml(targetSelector, body);
				this.dispatchEvents("pragmaloaded", document.querySelector(targetSelector));

				// Target is a valid top navigation, do some stuff
				if (target.tagName === this.main.tagName) {
					// Add loaded URL to history
					this.historyPush(url);
				}

				
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