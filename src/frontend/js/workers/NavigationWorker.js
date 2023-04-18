class NavigationWorker {
	constructor(event) {
		this.event = event;

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
		// Didn't get a response object
		if (!response instanceof Response) {
			return globalThis.postMessage([-1, null]);
		}

		const body = await response.text();

		globalThis.postMessage([body, response.status, response.url]);
	}

	// Request page from back-end
	async getPage() {
		await this.send(
			await fetch(new Request(this.event.data, {
				headers: {
					// Tell the backend we only want page content, no app shell
					"X-Pragma-Navigation": true
				}
			}))
		);

		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event));