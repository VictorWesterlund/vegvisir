<?php

    // This procedural file exposes select variables from namespace to frontend in a globalThis variable.

    use \Vegvisir\ENV;

    // Environment variables to expose to frontend
    $exports = [
        "selector_main_element",
        "page_document",
        "page_index"
    ];

    // Sequential array of strings with format 'VAR_NAME : "VAR_VALUE"'
    $vars = array_map(fn($export): string => "${export}:\"" . ENV::get($export) . "\"", $exports);
    // Turn vars into a CSV string
    $vars = implode(",", $vars);

    // Put environment varibles as object on globalThis
    echo "globalThis." . strtolower(ENV::NS) . " = {{$vars}};";