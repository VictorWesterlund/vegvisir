class Log {
    constructor(data) {
        this.endpoint = "https://api.icellate.com/log";
        this.payload = {
            host: globalThis.location.host,
            ua: this.getUaString(),
            time: performance.now(),
            data: data
        };

        this.dispatch();

        // Timeout and self-terminate after 10 seconds
        setTimeout(() => this.destroy(), 10000);
    }

    // Terminate the log worker
    destroy() {
        globalThis.close();
    }

    getUaString() {
        // Browser doesn't support/expose a NavigatorUAData object on global in this scope
        if (!"userAgentData" in globalThis.navigator) {
            return globalThis.navigator.userAgent;
        }

        // Get low-entropy values of the user agent
        return JSON.stringify(globalThis.navigator.userAgentData);
    }

    // Send log data to endpoint
    async dispatch() {
        const log = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.payload)
        });

        // Program will normally exit here on a successful log
        if (log.ok) {
            return this.destroy();
        }

        console.log(log, this.payload);
    }
}

globalThis.addEventListener("message", event => new Log(event.data));