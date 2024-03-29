// Multi-threaded SPA navigation handler
class Navigation {
	// Enum of available Event names that can be dispatched
	static events = {
		LOADED: "vegvisirloaded",
		LOADING: "vegvisirloading",
		WAITING: "vegvisirwaiting"
	}

	// Default options object used when constructing this class
	static options = {
		// Push navigation of this.main onto the history session stack
		pushHistory: true,
		// Merge search parameters from current page with new ones from navigation
		carrySearchParams: false,
		// Fetch page with initial HTTP request method, and also carry POST data
		carryRequestMethod: false
	}

	constructor(source, options = {}) {
		// Spin up dedicated worker
		this.worker = new Worker("/_vegvisir_wrkr/NavigationWorker.js");

		// Merge default options with overrides
		this.options = {};
		this.options = Object.assign(this.options, Navigation.options, options);

		// $this.navigate() will abort from the signal of this object.
		this.abortController = new AbortController();

		// The root element used for top navigations (and the default target)
		this.main = document.querySelector(globalThis._vegvisir.selector_main_element);

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

	// Push new history session entry onto the stack
	historyPush(url) {
		// The pushHistory option is disabled. Abort
		if (!this.options.pushHistory) {
			return false;
		}

		// Create URL instance from string
		url = url instanceof URL ? url : new URL(url);

		// Navigations to page_index should be treated as root "/"
		if (url.pathname.substring(url.pathname.length - globalThis._vegvisir.page_index.length) === globalThis._vegvisir.page_index) {
			url.pathname = url.pathname.substring(0, url.pathname.length - globalThis._vegvisir.page_index.length);
		}

		// Set hash from url as current anchor
		window.location.hash = url.hash;
		// But don't include it in the history stack
		url.hash = "";

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
		[...target.getElementsByTagName("script")].forEach(script => {
			const tag = document.createElement("script");

			// Assign element attributes
			for (const attribute of script.getAttributeNames()) {
				tag.setAttribute(attribute, script.getAttribute(attribute));
			}
			
			// Scope imported JS by default unless the data-noscope is explicitly defined
			tag.innerHTML = !("noscope" in script.dataset) ? `{${script.innerText}}` : script.innerHTML;

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
			// Treat invalid URL as a relative path
			url = new URL(window.location.origin + (string !== globalThis._vegvisir.page_index ? string : ""));
		}

		// Carry existing top searchParams to new location
		if (this.options.carrySearchParams) {
			url.search = new URLSearchParams({
				...Object.fromEntries(new URLSearchParams(window.location.search)),
				...Object.fromEntries(new URLSearchParams(url.search))
			});
		}

		return url;
	}

	// Extract URL and target from received event
	eventHandler(event) {
		// Is activation type event
		const element = event.target.closest("a");

		if (!element) {
			console.error("Vegvisir:Navigation: No anchor tag found between target and root", event.target);
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
				console.warn("Vegvisir:Navigation: target='_blank' from Vegvisir is not supported");
				return window.open(this.url);

			// Perform a normal navigation of the main element
			case "_top":
			default:
				target = this.main;
				break;
		}

		this.navigate(target);
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

	// Abort navigation in progress
	abort() {
		this.abortController.abort();
		this.worker.terminate();
	}

	// Perform SPA navigation by fetching new page and modifing DOM
	async navigate(target = null) {
		target = target ?? this.main;
		// We need a local reference to the url object so the response listener can access it later
		const url = this.url;

		this.dispatchEvents(Navigation.events.LOADING, target);

		// Get element by CSS selector string
		if (typeof target === "string") {
			target = document.querySelector(target);
		}

		// Fetch page and pass options and exposed environment variables
		this.worker.postMessage({
			options: this.options,
			vars: globalThis._vegvisir,
			url: this.url.toString()
		});

		const waitingDelay = 5000;
		// Dispatch Navigation.events.WAITING after waitingDelay timeout reached
		const waiting = setTimeout(() => this.dispatchEvents(Navigation.events.WAITING, target), waitingDelay);

		// Wait for Worker to fetch page or abort if abort flag is set
		return await new Promise((resolve) => {
			this.worker.addEventListener("message", (event) => {
				clearTimeout(waiting);
				// Get navigation details from Worker
				const [body, status, finalUrl] = event.data;

				// Update DOM and resolve this and outer Promise
				this.setTargetHtml(target, body);
				this.dispatchEvents(Navigation.events.LOADED, target);

				// Navigation target is the main element
				if (target === this.main) {
					// Add final URL to history and carry anchor from requested URL if provided
					this.historyPush(finalUrl + url.hash);
				}
				
				resolve(event.data);
			}, { once: true });
		}, { singal: this.abortController.signal });
	}
}