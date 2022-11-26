// Event handler for interactive components page
class Interactions {
	constructor(scope, methods = {}, autoBind = true) {
		// Default "built-in" interactions
		this.methods = {
			nav: (event) => {
				new Navigation(event);
			},
			void: () => {}
		}
		
		// Merge incoming- and default interactions
		Object.assign(this.methods, methods);

		this.scope = scope;
		this.elements = new Set();
		
		// Bind elements on startup
		if (autoBind) {
			this.bindAll();
		}
	}

	// Return default method name by element type
	defaultActionFromType(element) {
		switch (typeof element) {
			case HTMLAnchorElement:
				return "nav";

			default:
				console.warn("Undefined interaction", element);
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
			element.addEventListener("click", event => {
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