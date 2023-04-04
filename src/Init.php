<?php

	// Global paths
	final class Path {
		// Name of the environment variable files
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

		// List the files and folders in directory (without the dots on Linux)
		public static function ls(string $path): array|bool {
			return array_diff(scandir($path), ["..", "."]);
		}
	}

	// Load Composer dependencies
	require_once Path::pragma(Path::COMPOSER_AUTOLOAD);

	// Put environment variables from Pragma .ini into namespaced superglobal
	$_ENV[Path::ENV_NS] = parse_ini_file(Path::pragma(Path::ENV_INI), true);

	// Merge environment variables from user site into superglobal
	if (file_exists(Path::root(Path::ENV_INI))) {
		$_ENV = array_merge($_ENV, parse_ini_file(Path::root(Path::ENV_INI), true));
	}
