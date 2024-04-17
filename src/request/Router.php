<?php

	namespace Vegvisir\Request;

	use VV;
	use Vegvisir\ENV;
	use Vegvisir\Path;

	require_once Path::vegvisir("src/request/VV.php");

	enum StaticPathRegex: string {
		case ASSETS  = "/^\/assets\/*/";
		case WORKER = "/^\/_vv\/*/"; // "Vegvisir worker"
	}

	class Router {
		private string $path;

		public function __construct() {
			// Get pathname from request URI
			$this->path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

			// Request has a body, attempt to parse it into $_POST
			if (in_array("HTTP_CONTENT_TYPE", array_keys($_SERVER))) {
				$this->parse_request_body();
			}

			// Perform request routing
			switch ($this->path) {
				// Get static asset from user content
				case ((bool) preg_match(StaticPathRegex::ASSETS->value, $this->path)):
					return $this->asset();
				
				// Return script to be run in a JS Worker
				case ((bool) preg_match(StaticPathRegex::WORKER->value, $this->path)):
					return $this->worker();

				// Ignore requests to /favicon.ico which sometimes gets sent automatically
				// by browsers when a an icon meta tag is not specified. We don't want to prepare
				// a whole VV instance for this.
				case "/favicon.ico": 
					// Return no content response
					return VV::error(204);

				// Pass request to VV() initializer
				default:
					return new VV($this->get_requested_path());
			}
		}

		// Parse request body into $_POST superglobal
		private static function parse_request_body() {
			// Polyfill for loading JSON from request body into $_POST
			if ($_SERVER["HTTP_CONTENT_TYPE"] === "application/json") {
				$_POST = json_decode(file_get_contents("php://input"), true) ?? [];
			}
		}

		private function get_requested_path(): string {
			// Requests to root of user content path should be rewritten to configured index VV
			$path = $this->path !== "/" ? $this->path : ENV::get(ENV::INDEX);

			// Strip leading slash
			if (strpos($this->path, "/") === 0) {
				$path = substr($this->path, 1);
			}

			return $path;
		}

		// Return contents of a JS file to be run inside a JS Worker
		private function worker(): never {
			// Get crumbs from pathname
			$crumbs = explode("/", $this->get_requested_path());

			// Get only worker file name from path (last crumb)
			$file = Path::vegvisir("src/frontend/js/workers/" . end($crumbs));
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
			if (empty($type) || $type === "application/x-empty") {
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