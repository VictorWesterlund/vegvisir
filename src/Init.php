<?php

	// Global paths
	final class Path {
		// Get root of Pragma installation for accesing framework files
		public static function pragma(string $crumbs = ""): string {
			return dirname(__DIR__) . "/" . $crumbs;
		}

		// Get root of user site folder
		public static function root(string $crumbs = ""): string {
			return $_ENV["site_path"] . "/" . $crumbs;
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
	require_once Path::pragma("vendor/autoload.php");

	// Put environment variables from INI into superglobal
	$_ENV = parse_ini_file(Path::pragma(".env.ini"), true);

	// Merge environment variables from site contents with Pragma default.
	// Site content variables will override default, by default.
	if (file_exists(Path::root(".env.ini"))) {
		$_ENV = array_merge($_ENV, parse_ini_file(Path::root(".env.ini"), true));
	}
