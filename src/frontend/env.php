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
            $this->append_vars(array_combine(self::ENV, array_map(
                fn(string $key): string => ENV::get($key), 
                self::ENV)
            ));

            // Expose initial request method as string. This is used on initial load to pass along the request method to 
            $this->append_vars(["initial_method" => $_SERVER["REQUEST_METHOD"]]);

            // Append POST data as stringified JSON to export array
            $this->append_vars(["post_data" => htmlspecialchars(json_encode($_POST))]);
        }

        private function append_vars(array $vars) {
            $this->vars = array_merge($this->vars, array_map(
                fn(string $k, string $v): string => "{$k}:\"{$v}\"",
                array_keys($vars),
                array_values($vars)
            ));
        }

        // Get JSON from $this->vars
        public function json() {
            return "{" . implode(",", $this->vars) . "}";
        }
    }