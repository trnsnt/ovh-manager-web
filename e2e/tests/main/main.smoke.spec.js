"use strict";

var config = browser.params;

describe("MANAGER: WEB", function () {
    var protractor = require("protractor");
    var EC = protractor.ExpectedConditions;
    var page;

    beforeEach(function () {
        page = require("./main.po");
    });

    describe("simple test", function () {
        var originalTimeout;

        beforeAll(function () {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
        });

        it("should login.", function (done) {
            // Because login page is not in Angular.
            browser.ignoreSynchronization = true;
            browser.get("/auth/")
                .then(function () {
                    return browser.wait(
                        EC.presenceOf(page.loginEl),
                        30000,
                        "Login should be displayed within 30 seconds."
                    );
                })
                .then(function () {
                    page.loginEl.sendKeys(config.login);
                    page.passwordEl.sendKeys(config.password);
                    return page.loginSubmitBtnEl.click();
                })
                .then(browser.getCurrentUrl)
                .then(function (url) {
                    expect(url).toContain(browser.params.baseUrl);
                    done();
                });
        });

        it("should test if NIC is present.", function (done) {
            browser.get("/")
                .then(function () {
                    return browser.wait(EC.presenceOf(page.nicEl));
                })
                .then(function () {
                    return browser.sleep(5000);
                })
                .then(function () {
                    return page.nicEl.getText();
                })
                .then(function (text) {
                    expect(text).toContain(browser.params.login);
                    done();
                });
        });

        afterAll(function () {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

    });

});
