<?php 

	/*
		This file generates a minified bundle of all resources loaded with Path::init()
		These are JavaScript files that are required to run the Vegvisir front-end and
		are required for Vegvisir SPA functions.
	*/

	use Vegvisir\ENV;
	use Vegvisir\Path;
	use Vegvisir\Frontend\ExportVariables;

	// Include export of select Vegvisir environment variables
	include Path::vegvisir("src/frontend/env.php");

?>
<?= 
	// Vegvisir inline modules and initializer LibreJS reference.
	"// @license magnet:?xt=urn:btih:3877d6d54b3accd4bc32f8a48bf32ebc0901502a&dn=mpl-2.0.txt MPL-2.0"
?>

<?php // Vegvisir global property and public environment variables ?>
<?= ";globalThis.vv = {};" ?>
<?= "globalThis.vv._env = " . (new ExportVariables())->json() . ";" ?>

<?php // Vegvisir initializer and global module scripts ?>
<?= VV::js(Path::vegvisir("src/frontend/js/modules/Navigation.js"), false) . ";" ?>
<?= VV::js(Path::vegvisir("src/frontend/js/modules/Interactions.js"), false) . ";" ?>
<?= VV::js(Path::vegvisir("src/frontend/js/vegvisir.js"), false) ?>

<?= "// @license-end" ?>