<?php

	use MatthiasMullie\Minify;
	use FunctionFlags\FunctionFlags;

	class Page {
		public function __construct($page = "document") {
			FunctionFlags::define([
				"PATH_RELATIVE",
				"MEDIA_BASE64"
			]);

			// Check if request is for partial content
			if (array_key_exists("HTTP_X_NAVIGATION_TYPE", $_SERVER)) {
				switch ($_SERVER["HTTP_X_NAVIGATION_TYPE"]) {
					// Request is for a page
					case "contained":
						Page::include($page, true);
						break;

					default:
						http_response_code(422);
						die("NAVIGATION_TYPE not supported");		
				}
			} else {
				// Serve the whole document on (re)load
				Page::include("document");
			}
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

		// Set or get locale cookie from reference list of hostnames
		private static function get_locale(string $locale = null): string {
			$locales = Path::contents(Path::root("pages"));

			if (!empty($_COOKIE["user_locale"]) && in_array($_COOKIE["user_locale"], $locales)) {
				return $_COOKIE["user_locale"];
			}
			
			// Locale arg not provided, use the first locale in user content pages
			// as default.
			if (empty($locale)) {
				if (empty($locales)) {
					http_response_code(404);
					die("No pages defined");
				}

				$locale = $locales[0];
			}

			// Set and return locale cookie if provided
			if (!empty($locale)) {
				setcookie("user_locale", $locale, 0, "/");
				return $locale;
			}

			// Return already set locale cookie
			return $_COOKIE["user_locale"];
		}

		// These functions are exposed to all pages. They can be called
		// with the static reference Page::<method> anywhere on the page.

		// Return minified CSS from file
		public static function css(string $file, bool $relative = true): string {
			// Get assets/css relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $relative ? Page::get_asset_path("css", $file) : $file;

			if(!is_file($file)) {
				return "";
			}

			$minifier = new Minify\CSS($file);
			return $minifier->minify();
		}

		// Return minified JS from file
		public static function js(string $file, bool $relative = true): string {
			// Get assets/js relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $relative ? Page::get_asset_path("js", $file) : $file;

			if(!is_file($file)) {
				return "";
			}

			$minifier = new Minify\JS($file);
			return $minifier->minify();
		}

		// Return contents of media file as base64-encoded string unless whitelisted
		// for assets that should be read as-is, such as SVG.
		public static function media(string $file, int $flags): string {
			$test = FunctionFlags::isset(MEDIA_BASE64);
			// Get assets/media relative from site path unless the relative flag is set.
			// An unset relative flag will make the path absolute.
			$file = $flags & TEST ? file_get_contents(Page::get_asset_path("media", $file)) : $file;

			// Invalid file returns empty string
			if ($file === false) {
				return "";
			}

			// Base64-encode everything that isn't in whitelist array
			if (!in_array(substr($file, -1, 4), [".svg"])) {
				$file = base64_encode($file);
			}
			
			return $file;
		}

		// Load an external document into the current document
		public static function include(string $name) {
			// Rewrite empty path to "index" page
			if ($name === "/") {
				$name = "/index";
			}

			// Attempt to load from user content pages
			$locale = Page::get_locale();
			$file = Path::root("pages/${locale}/${name}.php");

			include $file;
		}

		public static function init() {
			include Path::pragma("src/frontend/bundle.php");
		}
	}