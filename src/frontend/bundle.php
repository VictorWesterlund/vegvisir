<?php 

    /*
        This file generates a minified bundle of all resources loaded with Path::init()
        These are JavaScript files that are required to run the Vegvisir front-end.
    */

    use \Vegvisir\ENV;
    use \Vegvisir\Path;
    use \Vegvisir\Frontend\ExportVariables;

    // Include export of select Vegvisir environment variables
    include Path::vegvisir("src/frontend/env.php");

    // Expose exported variables on globalThis as a JavaScript object
    echo "globalThis." . strtolower(ENV::NS) . " = " . (new ExportVariables())->json() . ";";

?>
<?= Page::js(Path::vegvisir("src/frontend/js/modules/Navigation.js"), false) ?>
<?= Page::js(Path::vegvisir("src/frontend/js/modules/Interactions.js"), false) ?>
<?= Page::js(Path::vegvisir("src/frontend/js/vegvisir.js"), false) ?>