<?php

	/*
		NOTE: This file intentionally lacks a namespace
		This is to make asset imports with "Page" less verbose in userspace
		with no need to declare "use" on every page.
	*/

	use Vegvisir\ENV;
	use Vegvisir\Path;

	// Library used to minify JS and CSS
	use MatthiasMullie\Minify;

	// -- Expose these helper scripts to Vegvisir pages --
	require_once Path::vegvisir("src/request/Proxy.php");

	class VV {
		// This class will look for this header to determine if we should send the env "page_document" or
		// the contents of a specific page.
		private const VEGVISIR_NAV_HEADER = "HTTP_X_VEGVISIR_NAVIGATION";

		public function __construct(string $page = null) {
			// Return specific page if the Vegvisir "nav header" is detected, else return the app shell which in turn
			// should spin up a Navigation to the requested specific page.
			$page = !empty($_SERVER[self::VEGVISIR_NAV_HEADER]) ? $page : ENV::get(ENV::DOCUMENT);

			// Return the requested page
			self::include("pages/{$page}.php");
		}

		// Append extension string to input string if omitted
		private static function append_extension(string $input, string $extension): string {
			return strpos($input, $extension) ? $input : $input . $extension;
		}

		// -- Methods callable from any Vegvisir page --

		// Set HTTP response code and return error page if enabled
		public static function error(int $code): void {
			http_response_code($code);

			// Bail out here if we got an HTTP code from the 200-range or no custom error page is defined
			if (($code >= 200 && $code < 300) || !ENV::isset(ENV::ERROR_PAGE)) {
				exit();
			}

			include Path::root(self::append_extension(ENV::get(ENV::ERROR_PAGE), ".php"));
		}

		// Load and return minified CSS file from absolute path or CSS assets folder
		public static function css(string $file, bool $relative = true): string {
			$file = $relative ? Path::root("assets/css/" . self::append_extension($file, ".css")) : $file;

			// Import and minify CSS stylesheet or return empty string if not found
			return is_file($file) ? (new Minify\CSS($file))->minify() : "";
		}

		// Load and return minified JS file from absolute path or JS assets folder
		public static function js(string $file, bool $relative = true): string {
			$file = $relative ? Path::root("assets/js/" . self::append_extension($file, ".js")) : $file;

			// Import and minify JS source or return empty string if not found
			return is_file($file) ? (new Minify\JS($file))->minify() : "";
		}

		// Load and return contents of a file from absolute path or media assets folder
		public static function media(string $file, bool $relative = true): string {
			$file = $relative ? Path::root("assets/media/" . $file) : $file;
			
			// Return empty string if media file doesn't exist
			if (!is_file($file)) {
				return "";
			}

			// Resolve MIME-type and charset for media
			[$mime, $charset] = explode("; ", finfo_file(finfo_open(FILEINFO_MIME), $file), 2);

			$data = file_get_contents($file);			
			// Return binary files as base64-encoded strings
			return $charset !== "charset=binary" ? $data : "data:{$mime};base64," . base64_encode($data);
		}

		// Include and evaulate a PHP file relative from userspace root
		public static function include(string $name) {
			// Rewrite empty paths to index page
			$name = !empty($name) && $name !== "pages/.php" ? $name : "pages/" . ENV::get(ENV::INDEX);

			// Load PHP file relative from userpsace root
			$file = Path::root(self::append_extension($name, ".php"));

			if (!is_file($file)) {
				return self::error(404);
			}

			// Import and evaluate PHP file
			include $file;
		}

		public static function init(): void {
			include Path::vegvisir("src/frontend/bundle.php");
		}
	}