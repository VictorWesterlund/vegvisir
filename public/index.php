<?php

	require_once "../src/Init.php";
	require_once Path::vegvisir("src/request/Router.php");

	// Start the request processor. This is how Vegvisir gets initialized
	// from an HTTP request.
	(new Router());