var _ = require("lodash");
var connect = require("connect");
var fs = require("fs");
var moment = require("moment");

var config = require("config3");
var galleries = require("./galleries");
var defaultLocals = {
  title: "",
  test: false
};

function adminGalleries(req, res, next) {
  galleries.getGalleries(function(error, jsonGalleries) {
    if (error) {
      next(error);
      return;
    }
    var jsonNames = _.pluck(jsonGalleries, "dirName");
    fs.readdir(config.photos.galleryDir, function(error, names) {
      if (error) {
        next(error);
        return;
      }
      var galleryDirNames = _.without(names, ".DS_Store");
      galleryDirNames = galleryDirNames.filter(function(name) {
        return jsonNames.indexOf(name) < 0;
      });
      var newGalleries = galleryDirNames.map(function (dirName) {
        return {dirName: dirName};
      });
      var allGalleries = jsonGalleries.concat(newGalleries);
      var locals = {
        title: "Manage Photos",
        galleries: allGalleries,
        formatDate: function(date) {
          if (!date) {
            return "";
          }
          return moment(date).format("YYYY-MM-DD");
        }
      };
      locals = _.defaults(locals, defaultLocals);
      res.render("photos/adminGalleries", locals);
    });
  });
}

function updateGalleries(req, res) {
  var gals = [];
  for (var key in req.body) {
    var match = key.match(/gallery_(.*)_displayName/);
    if (!match) {
      continue;
    }
    var dirName = match[1];
    var startDate = req.body["gallery_" + dirName + "_startDate"];
    gals.push({
      dirName: dirName,
      displyName: req.body[key],
      startDate: moment(startDate).toDate()
    });
  }
  gals = _.sortBy(gals, function(gallery) {
    return gallery.startDate;
  });
  galleries.reverse();
  fs.writeFile("../data/galleries.json", JSON.stringify(gals), function(error) {
    if (error) {
      res.send(error, 503);
      return;
    }
    res.redirect("/admin/galleries");
  });
}

function setup(app) {
  if (process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging") {
    return;
  }
  app.get("/admin/galleries", adminGalleries);
  app.post("/admin/galleries", connect.json(), updateGalleries);
}

module.exports = setup;
