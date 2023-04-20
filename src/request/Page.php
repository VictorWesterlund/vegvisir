<?php

	// Library used to minify JS and CSS
	use MatthiasMullie\Minify;

	class Page {
		// This class will look for this header to determine if we should send the env "page_document" or
		// the contents of a specific page.
		const VEGVISIR_NAV_HEADER = "HTTP_X_VEGVISIR_NAVIGATION";
		// HTTP status code environment variable name used with custom error pages
		const HTTP_ERROR = "http_status";

		public function __construct(string $page = null) {
			// Return specific page if the Vegvisir "nav header" is detected, else return the app shell which in turn
			// should spin up a Navigation to the requested specific page.
			$page = !empty($_SERVER[$this::VEGVISIR_NAV_HEADER]) ? $page : $_ENV[Path::ENV_NS]["page_document"];

			// Return the requested page
			$this::include($page);
		}

		// Set HTTP response code and return error page if enabled
		public static function error(int $code) {
			http_response_code($code);

			// No custom error page is defined, just exit here
			if (!in_array("error_page_path", array_keys($_ENV[Path::ENV_NS]))) {
				exit();
			}
			
			// Put error code into environment variable so the custom error page can access it if desired
			$_ENV[Path::ENV_NS][Page::HTTP_ERROR] = $code;

			include Path::root(
				// Append .php extension if omitted
				substr($_ENV[Path::ENV_NS]["error_page_path"], -4) === ".php" 
					? $_ENV[Path::ENV_NS]["error_page_path"]
					: $_ENV[Path::ENV_NS]["error_page_path"] . ".php"
			);
		}

		// Return absolute path to asset on disk.
		// The function takes a "scope" in the form of a $folder name relative to the asset root
		// to prevent this function from reading anywhere on disk.
		private static function get_asset_path(string $folder, string $file): string {
			// Append name of folder as file extension if omitted.
			// This may or may not resolve into an existing file. But for common web assets like
			// JS and CSS it works rather fine.
			if (strpos($file, ".") === false) {
				$file .= "." . $folder;
			}

			// Attempt to read asset from user site first
			$path = Path::root("assets/${folder}/${file}");
			if (is_file($path)) {
				return $path;
			}

			// Default to framework static asset if no user site asset found
			return Path::vegvisir("src/frontend/${folder}/${file}");
		}

		// These functions are exposed to all pages. They can be called
		// with the static reference Page::<method> anywhere on the page.

		// Return minified CSS from file
		public static function css(string $file, bool $relative = true): string {
			// Get assets/css relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $relative ? Page::get_asset_path("css", $file) : $file;

			// Import and minify CSS stylesheet or return empty string if not found
			return is_file($file) ? (new Minify\CSS($file))->minify() : "";
		}

		// Return minified JS from file
		public static function js(string $file, bool $relative = true): string {
			// Get assets/js relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $relative ? Page::get_asset_path("js", $file) : $file;

			// Import and minify JS source or return empty string if not found
			return is_file($file) ? (new Minify\JS($file))->minify() : "";
		}

		// Return contents of media file as base64-encoded string unless whitelisted
		// for assets that should be read as-is, such as SVG.
		public static function media(string $file, bool $relative = true): string {
			// Get assets/media relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $relative ? file_get_contents(Page::get_asset_path("media", $file)) : $file;

			// Invalid file returns empty string
			if ($file === false) {
				return "";
			}

			// Base64-encode everything that isn't in whitelist array
			if (!preg_match("//u", $file)) {
				$file = base64_encode($file);
			}
			
			return $file;
		}

		// Include external PHP file from user site into the current document
		public static function include(string $name) {
			// Rewrite empty path and "/" to page_index
			$name = !empty($name) && $name !== "/" ? $name : $_ENV[Path::ENV_NS]["page_index"];

			// Attempt to load from user content pages
			$file = Path::root("pages/${name}.php");

			if (!is_file($file)) {
				return Page::error(404);
			}

			// Import and run PHP file
			include $file;
		}

		public static function init() {
			include Path::vegvisir("src/frontend/bundle.php");
		}
	}