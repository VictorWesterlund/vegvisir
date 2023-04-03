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

	// Return default method name by element type
	defaultActionFromType(element) {
		switch (typeof element) {
			case HTMLAnchorElement:
				return "nav";

			default:
				console.warn("Pragma:Interactions: Undefined interaction", element);
				return "void";
		}
	}

	// Bind interactive components to an element
	bind(element) {
		// Call method when element is interacted with
		if ("action" in element.dataset) {
			// Action requested but method name not provided, attempt to resolve from element type
			if (element.dataset.action.length < 1) {
				element.dataset.action = this.defaultActionFromType(element);
			}

			// Call method when element is interacted with
			element.addEventListener(this.options.eventType, event => {
				event.stopPropagation(); // Don't bubble interaction to parent elements
				this.methods[element.dataset.action](event);
			});
		}

		this.elements.add(element);
	}

	// Find and bind all interactive elements on page
	bindAll() {
		const elements = [...document.querySelectorAll(`[data-trigger="${this.scope}"]`)];
		elements.forEach(element => this.bind(element));
	}
}