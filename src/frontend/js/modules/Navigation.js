// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

// Multi-threaded SPA navigation handler
globalThis.vv.Navigation = class Navigation {
	static WORKER_PATHNAME = "/_vv/Navigate.js";

	// Enum of available Event names that can be dispatched
	static events = {
		STARTED: "NavigateStartedEvent",
		LOADED: "NavigateLoadedEvent",
		LOADING: "NavigateLoadingEvent",
		ABORTED: "NavigateAbortedEvent"
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
		this.worker = new Worker(Navigation.WORKER_PATHNAME);

		// Merge default options with overrides
		this.options = {};
		this.options = Object.assign(this.options, Navigation.options, options);

		// $this.navigate() will abort from the signal of this object.
		this.abortController = new AbortController();

		// The root element used for top navigations (and the default target)
		this.main = document.querySelector(globalThis.vv._env.MAIN);

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

		this.dispatchEvent(Navigation.events.STARTED);
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
		if (url.pathname.substring(url.pathname.length - globalThis.vv._env.INDEX.length) === globalThis.vv._env.INDEX) {
			url.pathname = url.pathname.substring(0, url.pathname.length - globalThis.vv._env.INDEX.length);
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

		// Rebuild script tags as they don't execute with innerHTML per the HTML spec
		[...target.getElementsByTagName("script")].forEach(script => {
			const tag = document.createElement("script");

			// Assign element attributes
			for (const attribute of script.getAttributeNames()) {
				tag.setAttribute(attribute, script.getAttribute(attribute));
			}
			
			// Scope imported JS by default unless it's an ESM
			tag.innerHTML = script.getAttribute("type") !== "module" ? `{${script.innerText}}` : script.innerHTML;

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
			url = new URL(window.location.origin + (string !== globalThis.vv._env.INDEX ? string : ""));
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
				// Link href has been explicitly defined and that includes search parameters
				this.options.carrySearchParams = true;
				break;
		}

		this.navigate(target);
	}

	// Emit a loading/loaded event on window and target
	dispatchEvent(name, target = null) {
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

		this.dispatchEvent(Navigation.events.LOADING, target);

		// Get element by CSS selector string
		if (typeof target === "string") {
			target = document.querySelector(target);
		}

		// Fetch page and pass options and exposed environment variables
		this.worker.postMessage({
			options: this.options,
			vars: globalThis.vv._env,
			url: this.url.toString()
		});

		// Wait for Worker to fetch page or abort if abort flag is set
		return await new Promise((resolve) => {
			this.worker.addEventListener("message", (event) => {
				// Get navigation details from Worker
				const [body, status, finalUrl] = event.data;

				// Update DOM and resolve this and outer Promise
				this.setTargetHtml(target, body);
				this.dispatchEvent(Navigation.events.LOADED, target);

				// Set loaded page pathname on target element
				target.setAttribute("vv-page", url.pathname);

				// Navigation target is the main element
				if (target === this.main) {
					// Set loaded page pathanme on document body if main was navigated
					document.body.setAttribute("vv-page", url.pathname);

					// Add final URL to history and carry anchor from requested URL if provided
					this.historyPush(finalUrl + url.hash);
				}
				
				resolve(event.data);
			}, { once: true });
		}, { singal: this.abortController.signal });
	}
}

// @license-end