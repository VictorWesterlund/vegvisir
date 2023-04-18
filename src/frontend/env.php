<?php

    // This procedural file exposes select variables from Path::ENV_NS to frontend in a globalThis variable.

    // Environment variables to expose to frontend
    $exports = [
        "selector_main_element",
        "page_document",
        "page_index"
    ];

    // Sequential array of strings with format 'VAR_NAME : "VAR_VALUE"'
    $vars = array_map(fn($export): string => "${export}:\"{$_ENV[Path::ENV_NS][$export]}\"", $exports);
    // Turn vars into a CSV string
    $vars = implode(",", $vars);

    // Return generated JS
    echo "globalThis." . Path::ENV_NS . " = {{$vars}};";