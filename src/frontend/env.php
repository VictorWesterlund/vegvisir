<?php

    // This procedural file exposes select variables from namespace to frontend in a globalThis variable.

    namespace Vegvisir\Frontend;

    use \Vegvisir\ENV;

    class ExportVariables {
        // Sequential array of JSON formatted strings with property name and values
        private array $vars = [];

        // Export these variables from $_ENV
        private const ENV = [
            "selector_main_element",
            "page_document",
            "page_index"
        ];

        public function __construct() {
            // Resolve environment variables from constant and append to export array
            $this->vars = array_combine(self::ENV, array_map(
                fn(string $key): string => ENV::get($key), 
                self::ENV)
            );

            // Expose initial request method as string. This is used on initial load to pass along the request method to 
            $this->vars["initial_method"] = $_SERVER["REQUEST_METHOD"];
            // Append POST data as stringified JSON to export array
            $this->vars["post_data"] = json_encode($_POST);
        }

        // Get JSON from $this->vars
        public function json() {
            return json_encode($this->vars);
        }
    }