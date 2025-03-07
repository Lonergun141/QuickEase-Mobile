class APIKeyManager {
    constructor(apiKeys, logInfo = console.log, logError = console.error) {
        this.apiKeys = apiKeys.map(key => ({ key, inUse: false }));
        this.waitQueue = [];
        this.logInfo = logInfo;
        this.logError = logError;
    }

    async getAvailableKey(timeout = 30000) {
        // Try to find an available key
        const availableKeyObj = this.apiKeys.find(keyObj => !keyObj.inUse);

        if (availableKeyObj) {
            availableKeyObj.inUse = true;
            this.logInfo(`API key ${availableKeyObj.key} is now in use`);
            return availableKeyObj.key;
        } else {
            // No key is available; wait until one becomes available or timeout occurs
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.waitQueue = this.waitQueue.filter(item => item.reject !== reject);
                    reject(new Error('All API keys are in use. Please try again later.'));
                }, timeout);

                this.waitQueue.push({
                    resolve: (key) => {
                        clearTimeout(timer);
                        resolve(key);
                    },
                    reject: (err) => {
                        clearTimeout(timer);
                        reject(err);
                    }
                });
            });
        }
    }

    releaseKey(key) {
        const keyObj = this.apiKeys.find(k => k.key === key);
        if (keyObj) {
            keyObj.inUse = false;
            this.logInfo(`API key ${key} has been released`);

            // Assign the key to the next request in the queue, if any
            if (this.waitQueue.length > 0) {
                const { resolve } = this.waitQueue.shift();
                keyObj.inUse = true;
                this.logInfo(`API key ${key} is now assigned to a waiting request`);
                resolve(key);
            }
        } else {
            this.logError(`Attempted to release an unknown API key: ${key}`);
        }
    }
}

module.exports = APIKeyManager;
