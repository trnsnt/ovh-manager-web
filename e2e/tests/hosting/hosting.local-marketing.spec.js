"use strict";

describe("MANAGER-WEB | HOSTING | Local Marketing", function () {
    var page;

    beforeEach(function () {
        page = require("./hosting.po");
        const tab = "GENERAL_INFORMATIONS";
        const serviceName = "benjaminbarakide.paris";
        browser.get(`/#/configuration/hosting/${serviceName}?tab=${tab}`);
    });

    describe("tests when option is available", function () {
        it("should display", function (done) {
            expect(true).toBe(false);
        });

        it("should be available to buy", function (done) {
            expect(true).toBe(false);
        });
    });

    describe("tests when option is in activation progress", function () {
        it("should display a waiting message", function (done) {
            expect(true).toBe(false);
        });

        it("should not be clickable", function (done) {
            expect(true).toBe(false);
        });
    });

    describe("tests when option is active", function () {
        it("should display", function (done) {
            expect(true).toBe(false);
        });

        it("should be clickable", function (done) {
            expect(true).toBe(false);
        });
    });
});
