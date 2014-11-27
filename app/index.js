var analytics = require("app/site/blocks/analytics");
var config = require("config3");
var connect = require("connect");
var express = require("express");
var NotFound = require("./NotFound");

var app = express();
app.set("view engine", "jade");
app.set("views", __dirname);
app.locals.config = config;
app.locals.appURI = config.appURI;
app.locals.appVersion = config.appVersion;
app.locals.analytics = analytics;
if (config.enableLogger) {
  app.use(connect.logger({
    immediate: true,
    format: ":method :url :date"
  }));
}
[
  "blogs/blogRoutes",
  "plusParty/plusPartyRoutes",
  "jsDebug/jsDebugRoutes",
  "pages/pagesRoutes",
  "photos/photosRoutes",
  "photos/galleriesRoutes",
  "site/cssRoutes",
  "site/jsRoutes",
  "site/errorRoutes"
].forEach(function(routesPath) {
  require("app/" + routesPath)(app);
});

app.use(connect.static(config.staticDir));
app.use(connect.static(config.zeroClipboardDir));
app.use(function(req, res, next) {
  next(new NotFound(req.path));
});

/* eslint no-unused-vars:0 */
//Express looks at function arity, so we must declare 4 arguments here
app.use(function(error, req, res, next) {
  if (error instanceof NotFound) {
    res.status(404);
    res.render("site/error404");
  } else {
    res.status(500);
    res.render("site/error500");
    console.error(error);
  }
});

module.exports = app;