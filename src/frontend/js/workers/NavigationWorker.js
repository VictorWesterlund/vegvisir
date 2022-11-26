class NavigationWorker {
	constructor(event) {
		this.options = {
			headers: {
				// Tell the backend we only want page content, no app shell
				"X-Navigation-Type": "contained"
			}
		};

		this.getPage(event.data);
	}

	// Create an empty Response with a status code only
	newEmptyResponse(code = 500, message = "NavigationWorker: Internal Server Error") {
		return new Response(null, {
			status: code,
			statusText: message
		});
	}

	// Create a new error Response from a recieved Response
	async error(resp, data = ["main"]) {
		const target = data[0];

		// Simulate Response from server if error is internal
		if (!resp instanceof Response) {
			resp = this.newEmptyResponse(500);
		}

		// Attempt to load custom error page
		const errorPage = await this.getPage([target, "/error/404"]);
		if (errorPage.ok) {
			return errorPage;
		}

		// Create new Response with error HTML and forward HTTP status data
		const html = `<main><h1>Error</h1><p>${resp.statusText}</main>`;
		return new Response(html, { 
			status: resp.status,
			statusText: resp.statusText
		});
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
	async getPage(data) {
		const target = data[0];
		const page = data[1];

		const req = new Request(page, this.options);
		let resp = await fetch(req);

		// Request failed, so show error page with status code
		if(!resp.ok) {
			resp = this.error(resp, data);
		}
		
		/* 
		 * Fetch response body as plaintext and send to main thread
		 * so the browser can start parsing and painting the page ASAP
		 */ 
		const body = await resp.text();

		// Send response back to initiator thread
		globalThis.postMessage([
			data[0], // Target element selector
			body, // Page body
			resp.status, // HTTP status code
			resp.url // Loaded URL (after redirection etc.)
		]);

		// .. Get metadata for the page, such as <title> and more in the meantime
		if (target === "main") {
			this.getMeta(page);
		}

		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new NavigationWorker(event));