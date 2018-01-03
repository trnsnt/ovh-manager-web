angular
    .module("services")
    .service("Polling", class Polling {

        constructor (OvhHttp, $interval) {
            this.Interval = $interval;

            this.pollers = [];
        }

        startPolling (method, interval) {
            if (_.any(this.pollers, (p) => p.method === method)) {
                const err = new Error(`A polling task is already running for "${method}".`);
                err.type = "PollingAlreadyExistsError";
                return Promise.reject(err);
            }

            const poller = {
                method
            };
            const promise = this.Interval(method, interval);

            // we need to keep this id, it is overwritten by further promise chaining,
            // but the cancel method needs it.
            poller.id = promise.$$intervalId;

            poller.promise = promise.finally(() => {
                this.stopPolling(poller);
            });

            this.pollers.push(poller);
            return poller;
        }

        stopPolling (poller) {
            _.remove(this.pollers, poller);

            // reset the internal promise id in case it was overwritten
            poller.promise.$$intervalId = poller.id;
            this.Interval.cancel(poller.promise);
        }

        isPollingAlreadyExistsError (error) {
            return error.type && error.type === "PollingAlreadyExistsError";
        }
    });
