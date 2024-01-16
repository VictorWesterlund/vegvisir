<?php

	namespace Vegvisir;

	/*
		# Vegvisir environment abstractions
		This class contains abstractions for Vegvisir environment variables
	*/
	class ENV {
        // Vegvisir environment variables are placed in $_ENV as an assoc array with this as the array key.
        // Example: $_ENV[self::NS][<vegvisir_env_var>]
        public const NS = "_vv_env";

		// Name of the .ini file containing environment variables to be loaded (internal and userspace)
		private const INI = ".env.ini";

		// Path to the composer autoload file (internal and userspace)
		private const COMPOSER_AUTOLOAD = "vendor/autoload.php";

        // Returns true if Reflect environment variable is present and not empty in 
        public static function isset(string $key): bool {
            return in_array($key, array_keys($_ENV[self::NS])) && !empty($_ENV[self::NS][$key]);
        }

		// Get environment variable by key
		public static function get(string $key): mixed {
			return self::isset($key) ? $_ENV[self::NS][$key] : null;
		}

		// Set environment variable key, value pair
		public static function set(string $key, mixed $value = null) {
			$_ENV[self::NS][$key] = $value;
		}

		/* ---- */

		// Load environment variables and dependancies
		public static function init() {
			// Put environment variables from Vegvisir .ini into namespaced superglobal
			$_ENV[self::NS] = parse_ini_file(Path::vegvisir(self::INI), true);

			// Load Composer dependencies
			require_once Path::vegvisir(self::COMPOSER_AUTOLOAD);

			// Merge environment variables from user site into superglobal
			if (file_exists(Path::root(self::INI))) {
				$_ENV = array_merge($_ENV, parse_ini_file(Path::root(self::INI), true));
			}

			// Load composer dependencies from userspace if exists
			if (file_exists(Path::root(self::COMPOSER_AUTOLOAD))) {
				require_once Path::root(self::COMPOSER_AUTOLOAD);
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
			return ENV::get("site_path") . "/" . $crumbs;
		}
	}

	ENV::init();
