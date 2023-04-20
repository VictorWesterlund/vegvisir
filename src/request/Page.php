<?php

	// Library used to minify JS and CSS
	use MatthiasMullie\Minify;
	// Library that enables the use of function flags using PHP constants
	use FunctionFlags\FunctionFlags;

	class Page {
		// This class will look for this header to determine if we should send the env "page_document" or
		// the contents of a specific page.
		const PRAGMA_NAV_HEADER = "HTTP_X_PRAGMA_NAVIGATION";

		public function __construct(string $page = null) {
			FunctionFlags::define([
				"PATH_ABSOLUTE",
				"ENCODE_B64"
			]);
			
			$page = !empty($_SERVER[$this::PRAGMA_NAV_HEADER]) ? $page : $_ENV[Path::ENV_NS]["page_document"];

			// Return the requested page
			$this::include($page);
		}

		public static function error(int $code): never {
			http_response_code($code);
			exit();
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
			return Path::pragma("src/frontend/${folder}/${file}");
		}

		// These functions are exposed to all pages. They can be called
		// with the static reference Page::<method> anywhere on the page.

		// Return minified CSS from file
		public static function css(string $path, int $flags = null): string {
			// Get assets/css relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$path = !FunctionFlags::isset(PATH_ABSOLUTE) ? Page::get_asset_path("css", $path) : $path;

			// Load and minify CSS if file found. Else return empty string
			return is_file($path) ? (new Minify\CSS($path))->minify() : "";
		}

		// Return minified JS from file
		public static function js(string $path, int $flags = null): string {
			// Get assets/js relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$path = !FunctionFlags::isset(PATH_ABSOLUTE) ? Page::get_asset_path("js", $path) : $path;

			// Load and minify JS if file found. Else return empty string
			return is_file($path) ? (new Minify\JS($path))->minify() : "";
		}

		// Return contents of media file as base64-encoded string unless whitelisted
		// for assets that should be read as-is, such as SVG.
		public static function media(string $path, int $flags = null): string {
			// Get assets/media relative from site path unless the absolute flag is set.
			$path = !FunctionFlags::isset(PATH_ABSOLUTE) ? Page::get_asset_path("media", $path) : $path;

			$file = file_get_contents($path);
			// file_get_contents will return false if file not found. We will just return an empty string
			if ($file === false) {
				return "";
			}

			// Base64 encode if flag is set
			if (FunctionFlags::isset(ENCODE_B64)) {
				$mime = mime_content_type($path);
				$data = base64_encode($file);

				// Return as "data URL"
				return "data:${mime};base64,${data}";
			}
			
			return $file;
		}

		// Load an external document into the current document
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
			include Path::pragma("src/frontend/bundle.php");
		}
	}