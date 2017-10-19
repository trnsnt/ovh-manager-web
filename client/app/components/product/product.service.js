angular.module("services").service(
    "Products",
    class Products {

        constructor ($rootScope, OvhHttp, $q, constants, $stateParams, AllDom, Emails) {
            this.$rootScope = $rootScope;
            this.OvhHttp = OvhHttp;
            this.$q = $q;
            this.constants = constants;
            this.$stateParams = $stateParams;
            this.AllDom = AllDom;
            this.Emails = Emails;

            this.cache = {
                products: "UNIVERS_WEB_PRODUCTS"
            };

            this.selectedProduct = {
                name: "",
                organization: "",
                type: ""
            };

            this.getProducts(true);
        }

        /*
         * Get all products arranged by type
         */
        getProducts (forceRefresh = false) {
            return this.OvhHttp.get("/service", {
                rootPath: "apiv7",
                params: {
                    $expand: true
                },
                cache: this.cache.products,
                forceRefresh
            }).then((result) => this._arrangeProductsByType(result));
        }

        /*
         * Format API response to arrange products by their type
         */
        _arrangeProductsByType (result) {
            const categories = {
                domains: [
                    { name: "DOMAIN", route: "/domain/{serviceName}" },
                    { name: "ZONE", route: "/domain/zone/{zoneName}" }
                ],
                hostings: [
                    { name: "HOSTING", route: "/hosting/web/{serviceName}" },
                    { name: "PRIVATE_DATABASE", route: "/hosting/privateDatabase/{serviceName}" }
                ],
                emails: [
                    { name: "EMAIL_DOMAIN", route: "/email/domain/{domain}" },
                    { name: "EMAIL_DELEGATE", route: "" }
                ],
                emailPros: [
                    { name: "EMAIL_PRO", route: "/email/pro/{service}" }
                ],
                licenseOffice: [
                    { name: "LICENSE_OFFICE", route: "/license/office/{serviceName}" }
                ],
                sharepoints: [
                    { name: "SHAREPOINT", route: "/msServices/sharepoint/{domain}" }
                ],
                exchanges: [
                    { name: "EXCHANGE_PROVIDER", route: "" },
                    { name: "EXCHANGE_HOSTED", route: "/email/exchange/{organizationName}/service/{exchangeService}" },
                    { name: "EXCHANGE", route: "" },
                    { name: "EXCHANGE_DEDICATED", route: "" }
                ],
                vps: [],
                cdns: [],
                allDoms: [
                    { name: "ALL_DOM", route: "" }
                ]
            };

            const types = _.flatten(_.map(categories));

            const typedProducts = _.map(result, (p) => {
                const type = _.find(types, (t) => t.route === _.get(p, "value.route.path"));
                return {
                    name: _.get(p, "value.resource.name", ""),
                    displayName: _.get(p, "value.resource.displayName", ""),
                    type: _.get(type, "name")
                };
            });

            return _.mapValues(categories, (category) => _.filter(typedProducts, (product) => _.some(category, (type) => type.name === product.type)));
        }

        /*
         * Get the selected product
         */
        getSelectedProduct (forceRefresh) {
            if (forceRefresh) {
                this.selectedProduct = {
                    name: "",
                    organization: "",
                    type: ""
                };
            }

            return this.getProducts(forceRefresh).then((prods) => {
                const emptyProduct = {
                    name: "",
                    organization: "",
                    type: ""
                };

                if ($.isEmpty(this.selectedProduct.name)) {
                    this.selectedProduct.name = this.$stateParams.productId ? this.$stateParams.productId : "";
                    this.selectedProduct.type = this.$rootScope.currentSectionInformation ? this.$rootScope.currentSectionInformation.toUpperCase() : null;
                    this.selectedProduct.organization = this.$stateParams.organization ? this.$stateParams.organization : "";

                    if (this.selectedProduct.name === "") {
                        return emptyProduct;
                    }
                }

                const found = _.find(prods, (prod) => {
                    const check = (p) => p.name === this.selectedProduct.name && p.type === this.selectedProduct.type;

                    if (check(prod)) {
                        return prod;
                    } else if (prod.hasSubComponent) {
                        return _.find(prod.subProducts, check);
                    }

                    return null;
                });

                return found || emptyProduct;
            });
        }

        /*
         * set the selected product by Id
         */
        setSelectedProduct (product) {
            if (product) {
                if (angular.isString(product)) {
                    this.selectedProduct.name = product;
                } else if (angular.isObject(product)) {
                    if (product.name === "" && product.type === "") {
                        this.selectedProduct = product;
                    } else {
                        this.selectedProduct.name = product.name;
                        this.selectedProduct.type = product.type;
                    }
                }
            }

            return this.getSelectedProduct().then((p) => {
                this.selectedProduct.type = p.type;
                this.$rootScope.$broadcast("changeSelectedProduct", p);
                return p;
            });
        }

        /*
         * set the selected product by Id
         */
        removeSelectedProduct () {
            return this.setSelectedProduct({
                name: "",
                type: ""
            }).then((p) => {
                this.$rootScope.$broadcast("removeSelectedProduct");
                return p;
            });
        }

        /**
         * Get working-status for the specified product
         */
        getWorks (product) {
            return this.OvhHttp.get(`${this.constants.aapiRootPath}working-status/${product}`).then((resp) => resp.data);
        }
    }
);
