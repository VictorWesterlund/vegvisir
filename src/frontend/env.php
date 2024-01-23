<?php

    // This procedural file exposes select variables from namespace to frontend in a globalThis variable.

    namespace Vegvisir\Frontend;

    use \Vegvisir\ENV;

    class ExportVariables {
        // Sequential array of JSON formatted strings with property name and values
        protected array $vars;

        // Export these variables from $_ENV
        protected const ENV = [
            ENV::MAIN,
            ENV::INDEX,
            ENV::DOCUMENT
        ];

        public function __construct() {
            foreach (self::ENV as $env) {
                $this->vars[$env->name] = ENV::GET($env);
            }

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