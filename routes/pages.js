var fs = require("fs");
var express = require("express");

var Pages = function() {

    var self = this;

    self.PUBLIC_DIR = "./public";

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = {"index.html": ""};
        }
        //  Local cache for static content.
        self.zcache["index.html"] = fs.readFileSync(self.PUBLIC_DIR + "/index.html");
    };

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) {
        return self.zcache[key];
    };

    self.routes = function() {
        self.populateCache();

        var routes = express.Router();

        //  Serving the cached index page
        routes.get("/", function(req, res) {
            res.setHeader("Content-Type", "text/html");
            res.send(self.cache_get("index.html"));
        });

        //  Serving static stuff
        ["/css/", "/images/", "/js/", "/i18n/"].forEach(function(dir) {
            routes.use(dir, express.static(self.PUBLIC_DIR + dir));
        });

        return routes;
    };

}

module.exports = new Pages();