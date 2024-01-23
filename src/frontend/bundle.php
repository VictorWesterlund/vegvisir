<?php 

	/*
		This file generates a minified bundle of all resources loaded with Path::init()
		These are JavaScript files that are required to run the Vegvisir front-end and
		and is loaded once.
	*/

	use \Vegvisir\ENV;
	use \Vegvisir\Path;
	use \Vegvisir\Frontend\ExportVariables;

	// Include export of select Vegvisir environment variables
	include Path::vegvisir("src/frontend/env.php");

?>
<?= ";globalThis.vv = {};" ?>
<?= "globalThis.vv._env = " . (new ExportVariables())->json() . ";" ?>
<?= VV::js(Path::vegvisir("src/frontend/js/modules/Navigation.js"), false) . ";" ?>
<?= VV::js(Path::vegvisir("src/frontend/js/modules/Interactions.js"), false) . ";" ?>
<?= VV::js(Path::vegvisir("src/frontend/js/vegvisir.js"), false) ?>