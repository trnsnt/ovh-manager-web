angular.module("App").controller(
    "HostingTabModulesController",
    class HostingTabModulesController {
        constructor ($scope, $stateParams, Alerter, Hosting, HostingModule, User, Polling, OvhHttp) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.Alerter = Alerter;
            this.Hosting = Hosting;
            this.HostingModule = HostingModule;
            this.User = User;
            this.Polling = Polling;
            this.OvhHttp = OvhHttp;
        }

        $onInit () {
            this.modules = {
                ids: [],
                details: [],
                refresh: 0
            };
            this.loading = true;

            this.$scope.$on("hosting.tabs.modules.refresh", () => {
                this.loadModules(true);
            });

            this.$scope.isIn = (list, element) => _.includes(list, element);

            this.productId = this.$stateParams.productId;

            this.Hosting.getSelected(this.productId)
                .then((hosting) => {
                    this.serviceState = hosting.serviceState;
                })
                .catch((err) => {
                    this.Alerter.alertFromSWS(this.$scope.tr("hosting_configuration_tab_modules_create_step1_loading_error"), _.get(err, "data", err), this.$scope.alerts.main);
                });

            this.User.getUrlOf("guides")
                .then((guides) => {
                    if (guides && guides.hostingModule) {
                        this.guide = guides.hostingModule;
                    }
                });

            this.loadModules(true);
            this.poller = this.Polling.startPolling(() => this.loadModules(true), 5000);
            this.poller.promise
                .catch((err) => {
                    if (!this.Polling.isPollingAlreadyExistsError(err)) {
                        throw err;
                    }
                });
        }

        $onDestroy () {
            this.Polling.stopPolling(this.poller);
        }

        loadModules (forceRefresh) {
            return this.HostingModule.getModules(this.productId, { forceRefresh })
                .then((data) => {
                    this.modules.ids = data;
                })
                .catch((err) => {
                    this.Alerter.alertFromSWS(this.$scope.tr("hosting_configuration_tab_modules_create_step1_loading_error"), err, this.$scope.alerts.main);
                })
                .finally(() => {
                    this.loading = false;
                });
        }

        transformItem (id) {
            return this.HostingModule.getModule(this.productId, id)
                .then((module) => this.HostingModule.getAvailableModule(module.moduleId)
                    .then((template) => {
                        module.template = template;
                        return module;
                    }));
        }
    }
);
