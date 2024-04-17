// Vegvisir frontend initializer.
// This script depends on "./Interactions.js" and "./Navigation.js" being present in the same scope duing initialization.

// Fetch requested page on initial load
new globalThis.vv.Navigation(window.location.pathname.length > 1 ? window.location.pathname : globalThis.vv._env.INDEX, {
	// We want search parameters on initial load to be passed to requested page
	carrySearchParams: true,
	// We also want the page loaded to receive POST parameters etc.
	carryRequestMethod: true
})
// Navigate the root element defined in Vegvisir env file
.navigate(document.querySelector(globalThis.vv._env.MAIN));

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
	event.preventDefault();

	// This event does not have any state data. Ignore it
	if (event.state === null) {
		return;
	}

	// Force pushHistory to false as we don't want this navigation on the stack
	event.state.options.pushHistory = false;
	
	if ("url" in event.state) {
		return new globalThis.vv.Navigation(event.state.url, event.state.options).navigate();
	}
});