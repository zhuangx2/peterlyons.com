#!/usr/bin/env mocha
/* eslint-env mocha */
require("app/blogs/blogsAreLoaded.test");
var request = require("supertest")(require("app"));
var testConfigs = require("app/testConfigs");
var w3c = require("w3c-validate").createValidator();

describe("The HTML of each page", function () {
  testConfigs.forEach(function (testConfig) {
    var URI = testConfig[0];
    it(URI + " should be valid HTML5 according to the W3C", function(done) {
      this.slow(5000);
      this.timeout(9000);
      request.get(URI).expect(200).end(function (error, res) {
        if (error) {
          done(error);
          return;
        }
        w3c.validate(res.text, done);
      });
    });
  });
});
