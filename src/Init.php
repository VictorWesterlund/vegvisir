<?php

	// Global paths
	final class Path {

		// Constant file paths relative from Pragma root
		const ENV_INI = ".env.ini";
		// Namespace to store env variables in the $_ENV superglobal.
		// Variables exported to JavaScript will also have this namespace on the globalThis
		const ENV_NS = "_pragma";
		// Path to composer autoload script
		const COMPOSER_AUTOLOAD = "vendor/autoload.php";

		// Get root of Pragma installation for accesing framework files
		public static function pragma(string $crumbs = ""): string {
			return dirname(__DIR__) . "/" . $crumbs;
		}

		// Get root of user site folder
		public static function root(string $crumbs = ""): string {
			return $_ENV[Path::ENV_NS]["site_path"] . "/" . $crumbs;
		}

		// Return the contents of a path
		public static function contents(string $path): array|null {
			$dir = scandir($path);

			// Remove "." and ".." if is dir
			if (!empty($dir)) {
				array_shift($dir);
				array_shift($dir);
			}

			return $dir;
		}
	}

	// Load Composer dependencies
	require_once Path::pragma(Path::COMPOSER_AUTOLOAD);

	// Put environment variables from INI into superglobal
	$_ENV[Path::ENV_NS] = parse_ini_file(Path::pragma(Path::ENV_INI), true);

	// Merge environment variables from site contents with Pragma default.
	// Site content variables will override default, by default.
	if (file_exists(Path::root(Path::ENV_INI))) {
		$_ENV[Path::ENV_NS] = array_merge($_ENV[Path::ENV_NS], parse_ini_file(Path::root(Path::ENV_INI), true));
	}
