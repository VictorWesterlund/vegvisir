// Pragma frontend initializer.
// This script depends on "./Interactions.js" and "./Navigation.js" being
// present in the same scope duing initialization.

// Functions and classes accessible by all scripts
globalThis.pragma = {
	// Bind core features to global scope
	Interactions: (...args) => new Interactions(...args),
	Navigation: (...args) => new Navigation(...args)
};

// Fetch requested page on initial load
globalThis.pragma.Navigation(window.location.pathname.length > 1 ? window.location.pathname : globalThis._pragma.page_index, {
	// We want search parameters on initial load to be passed to requested page
	carrySearchParams: true
})
// Navigate the root element defined in Pragma env file
.navigate(document.querySelector(globalThis._pragma.selector_main_element));

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	event.preventDefault();

	// Force pushHistory to false as we don't want this navigation on the stack
	event.state.options.pushHistory = false;
	
	if ("url" in event.state) {
		globalThis.pragma.Navigation(event.state.url, event.state.options).navigate();
	}
});