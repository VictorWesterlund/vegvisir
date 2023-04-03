class NavigationWorker {
	constructor(event) {
		this.event = event;

		// Fetch page
		this.getPage();
	}

	// Create an empty Response with a status code only
	newEmptyResponse(code = 500, message = "Pragma:NavigationWorker: Internal Server Error") {
		return new Response(null, {
			status: code,
			statusText: message
		});
	}

	async send(response) {
		if (!response instanceof Response) {
			response = this.newEmptyResponse();
		}

		const body = await response.text();

		globalThis.postMessage([
			this.event.data[0], // Target element selector
			body, // Page body
			response.status, // HTTP status code
			response.url // Loaded URL (after redirection etc.)
		]);
	}

	// Request page from back-end
	async getPage() {
		const [target, page] = this.event.data;

		await this.send(await fetch(new Request(page, {
			headers: {
				// Tell the backend we only want page content, no app shell
				"X-Pragma-Navigation": true
			}
		})));

		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event));