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
                this.loadTab(true);
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

            this.loadTab()
                .then(() => this.initPolling());
        }

        initPolling () {
            this.Polling
                .startPolling(`/hosting/web/${this.productId}/module`, 15000, (ids) => {
                    this.modules.ids = ids;
                    this.modules.refresh ^= 1; // toggle refresh between 0 and 1
                });
        }

        loadTab (forceRefresh) {
            this.loading = true;

            return this.HostingModule.getModules(this.productId, { forceRefresh })
                .then((data) => {
                    this.modules.ids = data;
                })
                .catch((err) => {
                    this.Alerter.alertFromSWS(this.$scope.tr("hosting_configuration_tab_modules_create_step1_loading_error"), err, this.$scope.alerts.main);
                })
                .finally(() => {
                    // remove the loader immediately if there are no elements to display
                    if (_.isEmpty(this.modules.ids)) {
                        this.loading = false;
                    }
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

        onTransformItemDone () {
            this.loading = false;
        }
    }
);
