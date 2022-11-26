<?php

	require_once "../src/Init.php";
	require_once Path::pragma("src/request/Request.php");

	// Start the request processor. This is how Pragma gets initialized
	// from an HTTP request.
	(new Request());