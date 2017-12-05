angular
    .module("services")
    .service("Polling", class Polling {

        constructor (OvhHttp, $interval) {
            this.OvhHttp = OvhHttp;
            this.Interval = $interval;

            this.pollers = {};
        }

        startPolling (path, interval, callback, errorCallback) {

            if (_.has(this.pollers, path)) {
                console.warn(`A polling task is already running for "${path}".`);
                return;
            }

            this.pollers[path] = this.Interval(() => {
                this.OvhHttp.get(path, {
                    rootPath: "apiv6"
                })
                .then(callback)
                .catch((err) => {
                    if (errorCallback) {
                        errorCallback(err);
                    }
                    this.Interval.cancel(this.pollers[path]);
                    delete this.pollers[path];
                });
            }, interval);
        }
    });
