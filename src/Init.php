<?php

	namespace Vegvisir;

	const PATH_COMPOSER = "vendor/autoload.php";
	const PATH_ENV      = ".env.ini";

	use Vegvisir\ENV;
	use Vegvisir\Path;

	// Backed enum for all variables available in ENV::ENV_INI
	enum ENV: string {
		protected const NAMESPACE = "_vv";
		protected const ENV_INI   = ".env.ini";
		protected const COMPOSER  = "vendor/autoload.php";

		case SITE       = "site_path";
		case MAIN       = "selector_main_element";
		case DOCUMENT   = "page_document";
		case INDEX      = "page_index";
		case ERROR_PAGE = "error_page_path";

		// Returns true if a Vegvisir environment variable is set in the namespaced $_ENV
		public static function isset(ENV $key): bool {
			return in_array($key->value, array_keys($_ENV[self::NAMESPACE])) && !empty($_ENV[self::NAMESPACE][$key->value]);
		}

		// Get Vegvisir environment variable by key
		public static function get(ENV $key): mixed {
			return self::isset($key) ? $_ENV[self::NAMESPACE][$key->value] : null;
		}

		// Set Vegvisir environment variable key value pair
		public static function set(ENV $key, mixed $value = null) {
			$_ENV[self::NAMESPACE][$key->value] = $value;
		}

		// Load environment variables and dependancies
		public static function init() {
			// Put environment variables from Vegvisir .ini into namespaced superglobal
			$_ENV[self::NAMESPACE] = parse_ini_file(Path::vegvisir(self::ENV_INI), true);

			// Load Composer dependencies
			require_once Path::vegvisir(self::COMPOSER);

			// Merge environment variables from user site into superglobal
			if (file_exists(Path::root(self::ENV_INI))) {
				$_ENV = array_merge($_ENV, parse_ini_file(Path::root(self::ENV_INI), true));
			}

			// Load composer dependencies from userspace if exists
			if (file_exists(Path::root(self::COMPOSER))) {
				require_once Path::root(self::COMPOSER);
			}
		}
	}

	// Global paths
	class Path {
		// Get root of Vegvisir installation for accesing framework files
		public static function vegvisir(string $crumbs = ""): string {
			return dirname(__DIR__) . "/" . $crumbs;
		}

		// Get root of user site folder
		public static function root(string $crumbs = ""): string {
			return ENV::get(ENV::SITE) . "/" . $crumbs;
		}
	}

	ENV::init();
