// Pragma frontend initializer.
// This script depends on "./Interactions.js" and "./Navigation.js" being
// present in the same scope duing initialization.

// Functions and classes accessible by all scripts
globalThis.pragma = {
	// Bind core features to global scope
	Interactions: (...args) => new Interactions(...args),
	Navigation: (...args) => new Navigation(...args)
};

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	if ("url" in event.state) {
		globalThis.pragma.Navigation(event.state.url).navigate();
	}
});