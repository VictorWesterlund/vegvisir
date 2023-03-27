class NavigationWorker {
	constructor(event) {
		this.options = {
			headers: {
				// Tell the backend we only want page content, no app shell
				"X-Navigation-Type": "contained"
			}
		};

		this.event = event;

		this.getPage();
	}

	// Create an empty Response with a status code only
	newEmptyResponse(code = 500, message = "NavigationWorker: Internal Server Error") {
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

	// ----

	// Request metadata for page from backend
	async getMeta(page) {
		let options = {
			headers: {
				// Tell the backend we only want metadata for the page
				"X-Navigation-Type": "meta"
			}
		};
		
		Object.assign(options, this.options);
		
		const req = new Request(page, options);
		const resp = await fetch(req);

		const json = await resp.json();
		console.log("meta", json);
	}

	// Request page from back-end
	async getPage() {
		const [target, page] = this.event.data;

		const request = new Request(page, this.options);
		await this.send(await fetch(request));

		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event));