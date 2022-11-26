// Basic virtual KV store with Storage API (and cookies)
class KvStore {
	constructor(namespace = "kvstore", medium = null) {
		this.namespace = namespace;
		this.storage = medium; // Storage API interface (or document.cookie)

		// Use LocalStorage as the default medium if none specified
		if (!this.storage && localStorage in globalThis) {
			this.storage = globalThis.localStorage;
		}

		// Create polyfill for cookie storage
		if (this.storage === document.cookie) {
			this.cookieStorage();
		}

		// ----

		// Initialize virtual KV store
		if (!this.get("kvstore")) {
			this.set("kvstore", {
				version: "1.0"
			});
		}
	}

	// Polyfill Storage API with cookies
	cookieStorage() {
		this.storage = {
			// Get cookie value from namespace by key
			getItem: (key) => {
				let data = document.cookie.split("; ").find(cookie => cookie.startsWith(key + "="))?.split("=")[1] ?? null;
				data = decodeURIComponent(data);

				return JSON.stringify(data);
			},
			// Create/replace new namespaced cookie with key
			setItem: (key, value, expires = null) => {
				expires = expires ?? 60 * 60 * 24 * 365; // Cookie expires in 1 year by default
				value = encodeURIComponent(value);
				
				document.cookie = `${key}=${value}; max-age=${expires}; Path=/`;
			},
			// Remove namespaced cookie by key
			removeItem: (key) => {
				this.storage.setItem(key, "", 1);
			}
		}
	}

	// Prepend namespace prefix to key
	key(key) {
		return [this.namespace, key].join("_");
	}

	/* ---- */

	// Get value by key
	get(key) {
		return JSON.parse(this.storage.getItem(this.key(key)));
	}

	// Set value by key
	set(key, value) {
		return this.storage.setItem(this.key(key), JSON.stringify(value));
	}

	// Remove entry by key
	remove(key) {
		return this.storage.removeItem(this.key(key));
	}
}