// @license magnet:?xt=urn:btih:3877d6d54b3accd4bc32f8a48bf32ebc0901502a&dn=mpl-2.0.txt MPL-2.0

class Navigate {
	constructor(request) {
		// Parse URL form string into URL object
		this.url = new URL(request.url);
		// Expose request options as property
		this.options = request.options;

		this.fetchOptions = {
			// Tell the backend we only want page content, no app shell
			headers: {
				"X-Vegvisir-Navigation": true
			}
		};

		// Append request method if carryRequestMethod flag is set
		if (this.options.carryRequestMethod) {
			this.fetchOptions.method = request.vars.initial_method;

			// Append JSON request body if request is not GET or HEAD
			if (!["GET", "HEAD"].includes(request.vars.initial_method.toUpperCase())) {
				this.fetchOptions.body = request.vars.post_data;
				this.fetchOptions.headers["Content-Type"] = "application/json";
			}
		}

		this.getPage();
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
	async getPage() {
		// Fetch URL by pathname and carry search parameters
		let url = this.url.pathname;

		// Carry search parameters if flag is set
		if (this.options.carrySearchParams) {
			url = url + this.url.search;
		}
		
		// Fetch page from URL with options
		await this.send(await fetch(new Request(url, this.fetchOptions)));
		globalThis.close();
	}
}

globalThis.addEventListener("message", event => new Navigate(event.data));

// @license-end