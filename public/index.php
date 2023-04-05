<?php

	require_once "../src/Init.php";
	require_once Path::pragma("src/request/Router.php");

	// Start the request processor. This is how Pragma gets initialized
	// from an HTTP request.
	(new Router());