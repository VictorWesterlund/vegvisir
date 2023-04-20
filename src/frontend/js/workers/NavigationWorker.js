class NavigationWorker {
	constructor(event) {
		this.event = event;

		this.getPage();	
	}

	async send(response) {
		return response instanceof Response 
			// Return page as plaintext along with the response HTTP status and the fetched URL
			? globalThis.postMessage([await response.text(), response.status, response.url])
			// Didn't get a response object
			: globalThis.postMessage([-1, null]);
	}

	// Request page from back-end
	async getPage() {
		await this.send(
			await fetch(new Request(this.event.data, {
				headers: {
					// Tell the backend we only want page content, no app shell
					"X-Vegvisir-Navigation": true
				}
			}))
		);

		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event));