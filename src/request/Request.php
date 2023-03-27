<?php

	require_once Path::pragma("src/request/Page.php");

	class Request {

		private static $preg_asset = "/^\/assets\/*/";
		private static $preg_worker = "/^\/worker\/*/";

		public function __construct() {
			// Get pathname from request URI
			$this->path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

			$this->router();
		}

		// Request router
		private function router() {
			switch ($this->path) {
				// Get static asset from user content
				case (preg_match($this::$preg_asset, $this->path) ? true : false):
					return $this->asset();
				
				// Return script to be run in a JS Worker
				case (preg_match($this::$preg_worker, $this->path) ? true : false):
					return $this->worker();

				// Ignore requests to /favicon.ico which sometimes gets sent automatically
				// by browsers when a an icon meta tag is not specified. We don't want to prepare
				// a whole page instance for this.
				case "/favicon.ico": 
					return $this->void();

				// Pass request to Page() initializer
				default:
					return new Page($this->get_requested_path());
			}
		}

		private function get_requested_path(): string {
			$path = $this->path;

			// Requests to root of user content path should be rewritten to /index
			if ($this->path === "/") {
				$path = "index";
			}

			// Strip leading slash
			if (strpos($this->path, "/") === 0) {
				$path = substr($this->path, 1);
			}

			return $path;
		}

		// Return empty response
		private function void(): never {
			// No content
			http_response_code(204);
			exit();
		}

		// Return contents of a JS file to be run inside a JS Worker
		private function worker(): never {
			$path = $this->get_requested_path();

			// Check if worker script exists
			$file = Path::pragma("src/frontend/js/${path}");
			if (!is_file($file)) {
				http_response_code(404);
				die("Not a worker");
			}

			// Return worker script contents
			header("Content-Type: text/javascript");
			exit(file_get_contents($file));
		}

		// Return the contents of a static asset from the user content folder.
		// This should ideally be handled upstream by the webserver and is usually
		// faster than going through PHP, and of course this code. But here we go.
		private function asset(): never {
			$file = Path::root($this->get_requested_path());

			// Get MIME-type for file or default to plaintext
			$type = mime_content_type($file);
			if (!$type || $type === "application/x-empty") {
				$type = "text/plain";
			}

			header("Content-Type: " . $type);

			// File not found in user content /assets/<file>
			if (!is_file($file)) {
				http_response_code(404);
				die("Asset not found");
			}

			exit(file_get_contents($file));
		}
	}