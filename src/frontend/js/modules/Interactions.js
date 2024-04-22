// Event binder and handler for interactive elements
globalThis.vv.Interactions = class Interactions {
	// Default options object used when constructing this class
	static options = {
		autoBind: true,
		// The event type to bind
		eventType: "click"
	}

	constructor(namespace, methods = {}, options = {}) {
		// Default "built-in" interactions
		this.methods = {
			void: ()     => {},
			navigate: (event) => new vv.Navigation(event)
		}
		
		// Merge incoming- and default interactions
		Object.assign(this.methods, methods);

		// Merge default options with overrides
		this.options = {};
		this.options = Object.assign(this.options, Interactions.options, options);

		// Bind elements in this namespace
		this.namespace = namespace;
		// Set of all bound elements
		this.elements = new Set();
		
		// Bind elements on initialization
		if (this.options.autoBind) {
			this.bindAll();
		}
	}

	// Bind a Vegvisir interactive HTMLElement
	bind(element) {
		const methodName = element.getAttribute("vv-call") ?? "void";

		// Call method when element is interacted with
		element.addEventListener(this.options.eventType, (event) => {
			event.preventDefault();
			event.stopPropagation();
			
			this.methods[methodName](event);
		});

		this.elements.add(element);
	}

	// Find and bind all Vegvisir interactive elements by namespace
	bindAll() {
		const elements = [...document.querySelectorAll(`[vv="${this.namespace}"]`)];
		elements.forEach(element => this.bind(element));
	}
}
