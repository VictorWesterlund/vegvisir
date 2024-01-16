// Event binder and handler for interactive elements
class Interactions {
	// Default options object used when constructing this class
	static options = {
		autoBind: true,
		// The event type to bind
		eventType: "click"
	}

	constructor(scope, methods = {}, options = {}) {
		// Default "built-in" interactions
		this.methods = {
			nav: (event) => {
				event.preventDefault();
				new Navigation(event);
			},
			void: () => {}
		}
		
		// Merge incoming- and default interactions
		Object.assign(this.methods, methods);

		// Merge default options with overrides
		this.options = {};
		this.options = Object.assign(this.options, Interactions.options, options);

		this.scope = scope;
		this.elements = new Set();
		
		// Bind elements on startup
		if (this.options.autoBind) {
			this.bindAll();
		}
	}

	// Bind interactive components to an element
	bind(element) {
		let action = element.getAttribute("vv-do");

		// Call method with value of "vv-do" attribute if defiend
		if (action !== null) {
			// Action requested but method name not provided, attempt to resolve from element type
			if (action.length < 1 && typeof element === HTMLAnchorElement) {
				action = "nav";
			}

			// Call method when element is interacted with
			element.addEventListener(this.options.eventType, (event) => {
				event.stopPropagation();
				this.methods[action](event);
			});
		}

		this.elements.add(element);
	}

	// Find and bind all Vegvisir interactive elements in scope
	bindAll() {
		const elements = [...document.querySelectorAll(`[vv-ns="${this.scope}"]`)];
		elements.forEach(element => this.bind(element));
	}
}