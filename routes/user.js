var express = require("express");
var FB = require("fb");
var util = require("util");
var mongo = require("mongojs");
var db;

var User = function() {

    var self = this;

    self.routes = function() {
        // configure the database
        if (typeof db === "undefined") {
            self.configure();
        }
        // create the routes
        var routes = express.Router();
        routes.post("/login", self.login);
        return routes;
    }

    self.login = function(req, res, next) {
        var grantedScopes = req.body.grantedScopes;
        // query FB user data
        FB.setAccessToken(req.body.accessToken);
        FB.api(
            "/me",
            {
                fields: [
                    'id', 
                    'name',
                    'email'
                ]
            }, 
            function(response) {
                if (!response || response.error) {
                    return next(response.error);
                }
                // facebook user data
                var userid = response.id;
                var email = response.email;
                var name = response.name;
                // find for stored user data
                db.user.findOne({
                    userid: userid
                }, function(err, doc) {
                    if (err) {
                        console.warn(err);
                    }
                    if (!doc) {
                        // not doc? insert a new user
                        self.createUser(userid, email, name);
                    } else {
                        // otherwise, update access counter
                        self.updateCount(userid, "access");
                    }
                });
                // return the userid
                res.json(200, {userid: userid, username: name, permissions: grantedScopes});
            }
        );
    };

    self.createUser = function(userid, email, name) {
        db.user.insert({
            userid: userid,
            email: email,
            name: name,
            create_date: new Date(),
            access_count: 1
        }, function(err, doc) {
            if (err) {
                console.warn(err);
            }
        });
    }

    self.updateCount = function(userid, countType) {
        // allowed counters
        var types = [
            "access", 
            "img_camera", 
            "img_upload",
            "img_facebook",
            "process"
        ];
        // countType is allowed?
        types.contains(countType, function(result) {
            if (result === true) {
                // no userid? update the "nobody" user
                if (!userid || typeof userid === "undefined") {
                    userid = "nobody";
                }
                // increment modifier
                var incModifier = { $inc: {} };
                incModifier.$inc[countType + "_count"] = 1;
                // update the count
                db.user.update (
                    { userid: userid }, 
                    incModifier,
                    function(err, doc) {
                        if (err) {
                            console.warn(err);
                        }
                    }
                );
            }
        });
    }

    /**
     * Configure database access
     */ 
    self.configure = function() {
        // default to a "localhost" configuration:
        var conn = "127.0.0.1:27017/stickerme";
        // if OPENSHIFT env variables are present, use the available connection info:
        if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
            conn = util.format("%s:%s@%s:%d/%s",
                               process.env.OPENSHIFT_MONGODB_DB_USERNAME,
                               process.env.OPENSHIFT_MONGODB_DB_PASSWORD,
                               process.env.OPENSHIFT_MONGODB_DB_HOST,
                               process.env.OPENSHIFT_MONGODB_DB_PORT,
                               process.env.OPENSHIFT_APP_NAME);
        } else if (process.env.MONGOHQ_URL) {
            conn = process.env.MONGOHQ_URL;
        }

        db = mongo(conn, ["user"]);
    }

    /** 
     * Extended method to verify if an array contains a specified value 
     */
    Array.prototype.contains = function(key, callback) {
        var self = this;
        return (function check(i) {
            if (i >= self.length) {
                return callback(false);
            }
            if (self[i] === key) {
                return callback(true);
            }
            return process.nextTick(check.bind(null, i + 1));
        }(0));
    }

}

module.exports = new User();
