class NavigationWorker {
	constructor(request) {
		this.options = {
			// Tell the backend we only want page content, no app shell
			headers: {
				"X-Vegvisir-Navigation": true
			}
		};

		// Append request method if carryRequestMethod flag is set
		if (request.options.carryRequestMethod) {
			this.options.method = request.vars.initial_method;
			this.options.body = request.vars.post_data;

			// TODO: Content type
		}

		this.getPage(request.url);
	}

	// Send response back to initator thread
	async send(response) {
		return response instanceof Response 
			// Return page as plaintext along with the response HTTP status and the fetched URL
			? globalThis.postMessage([await response.text(), response.status, response.url])
			// Didn't get a response object
			: globalThis.postMessage([-1, null]);
	}

	// Request page from back-end
	async getPage(url) {
		// Fetch page from URL with options
		await this.send(await fetch(new Request(url, this.options)));
		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event.data));