<?php

	namespace Vegvisir\Request;

	// Library for storing and restoring superglobal variables
	use victorwesterlund\GlobalSnapshot;

	// Create a new include proxy for holding existing PHP superglobal variables before a VV::include()
	// This can be used to send mock superglobal variables to another page and then restore them after it has been included
	class Proxy extends GlobalSnapshot {
		public function __construct() {
			parent::__construct();

			$this->capture();
		}

		public function env(array $vars): self {
			$_ENV = $vars;
			return $this;
		}

		public function get(array $vars): self {
			$_GET = $vars;
			return $this;
		}

		public function post(array $vars): self {
			$_POST = $vars;
			return $this;
		}

		public function files(array $vars): self {
			$_FILES = $vars;
			return $this;
		}

		public function server(array $vars): self {
			$_SERVER = $vars;
			return $this;
		}

		public function cookie(array $vars): self {
			$_COOKIE = $vars;
			return $this;
		}

		public function request(array $vars): self {
			$_REQUEST = $vars;
			return $this;
		}

		public function session(array $vars): self {
			$_SESSION = $vars;
			return $this;
		}

		// ----

		public function proxy(): void {
			$this->restore();
		}
	}