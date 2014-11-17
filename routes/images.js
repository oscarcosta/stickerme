var fs = require("fs");
var https = require("https");
var crypto = require("crypto");
var util = require("util");
var path = require("path");
var express = require("express");
var im = require("gm").subClass({imageMagick: true});
var mime = require("mime");
var user = require("./user");

var Images = function() {

    var self = this;

    self.UPLOAD_PATH = process.env.OPENSHIFT_TMP_DIR
                     ? process.env.OPENSHIFT_TMP_DIR + "/uploads"
                     : "./uploads/";
    self.STICKER_PATH = process.env.OPENSHIFT_DATA_DIR 
                      ? process.env.OPENSHIFT_DATA_DIR + "/stickers"
                      : "./stickers/";
    self.PUBLIC_PATH = "./public/";
    self.TEMPLATES_PATH = "./public/images/stickers/";
    self.IMG_SIZE = 500;

    self.routes = function() {
        var routes = express.Router();
        routes.post("/upload", self.upload);
        routes.post("/store", self.store);
        routes.post("/process", self.process);
        routes.get("/picture/:name", self.download);
        routes.get("/sticker/:name", self.download);
        routes.get("/templates", self.templates);
        return routes;
    }

    self.upload = function(req, res, next) {
        //  uploaded image info
        var imgPath = req.files.file.path;
        var imgExt = req.files.file.extension;
        var mimeType = req.files.file.mimetype;
        // userid and origin of image to update counter
        var userid = req.body.userid;
        var origin = req.body.imgOrigin;
        // is a blob image? rename it to real image extension
        if (imgExt === "blob") {
            var newPath = imgPath.replace("blob", mimeType.split("/")[1]);
            fs.renameSync(imgPath, newPath);
            imgPath = newPath;
        }
        // resize and writes the image
        im(imgPath)
            .resize(self.IMG_SIZE, self.IMG_SIZE)
            .write(imgPath, function(err) {
                if (err) {
                    return next(err);
                }
                // update a counter
                user.updateCount(userid, origin);
                // return the image name and mimetype
                res.json(200, {picture: self.fileName(imgPath),
                               type: mimeType});
            });
    };

    self.store = function(req, res, next) {
        // remote image url
        var imgURL = req.body.imgURL;
        // userid and origin of image to update counter
        var userid = req.body.userid;
        var origin = req.body.imgOrigin;
        // get the remote image
        https.get(imgURL, function(response) {
            var buffers = [];
            var length = 0;
            response.on("data", function(chunk) {
                // store each block of data
                length += chunk.length;
                buffers.push(chunk);
            });
            response.on("end", function() {
                // combine the binary data into single buffer
                var image = Buffer.concat(buffers);
                // generate a new name for the image
                var imgName = self.fileName(imgURL);
                var imgExt = imgName.split(".").pop();
                var imgPath = path.join(self.UPLOAD_PATH,
                                        self.genName(imgName, imgExt));
                // resize and writes the image
                im(image, imgName)
                    .resize(self.IMG_SIZE, self.IMG_SIZE)
                    .write(imgPath, function(err) {
                        if (err) {
                            return next(err);
                        }
                        // update a counter
                        user.updateCount(userid, origin);
                        // return the image name and mimetype
                        res.json(200, {picture: self.fileName(imgPath),
                                       type: mime.lookup(imgPath)});
                    });
            });
        }).on("error", function(err) {
            return next(err);
        });
    };

    self.process = function(req, res, next) {
        // userid to update counters and username to insert on sticker
        var userid = req.body.userid;
        var username = req.body.username;
        // crop coordinates
        var x1 = req.body.x1;
        var y1 = req.body.y1;
        var w = req.body.w;
        var h = req.body.h;
        // sticker and image names
        var sticker = req.body.sticker;
        var imgName = req.body.picture;
        // images paths
        var imgPath = path.join(self.UPLOAD_PATH, imgName.trim());
        var dstPath = path.join(self.STICKER_PATH, userid + "_" + imgName);
        // crop the source image, compose the new image 
        // with the frame over the source image, then resize it
        im().in(imgPath)
            .in("-crop", util.format("%dx%d+%d+%d", w, h, x1, y1))
            .in("-geometry", util.format("%dx%d+0+0", w, h))
            .in(path.join(self.PUBLIC_PATH, sticker))
            .in("-geometry", util.format("%dx%d+0+0", w, h))
            .in("-composite")
            .resize(self.IMG_SIZE, self.IMG_SIZE)
            .write(dstPath, function(err) {
                if (err) {
                    next(err);
                }
                // identified user? write his name on sticker
                if (typeof username !== "undefined" && username) {
                    im().in(dstPath)
                        .fontSize(18)
                        .drawText(0, 0, username, "south")
                        .write(dstPath, function(err){
                            if (err) {
                                next(err);
                            }
                            // update process counter
                            user.updateCount(userid, "process");
                            // return the generated image name and mimetype
                            res.json(200, {picture: self.fileName(dstPath), 
                                           type: mime.lookup(dstPath)});
                        });
                } else {
                    // update process counter
                    user.updateCount(userid, "process");
                    // return the generated image name and mimetype
                    res.json(200, {picture: self.fileName(dstPath), 
                                   type: mime.lookup(dstPath)});
                }
            });
    };

    self.download = function(req, res, next) {
        // define the file path
        var basePath = req.url.match(/^\/picture.*/) 
                     ? self.UPLOAD_PATH 
                     : self.STICKER_PATH;
        var filePath = path.join(basePath, req.params.name.trim());
        // read the image file
        fs.readFile(filePath, "binary", function(err, file) {
            if (err) {
                return next(err);
            }
            var type = mime.lookup(filePath);
            if (basePath === self.UPLOAD_PATH) {
                // temporary image? return the binary image
                res.writeHead(200, {"Content-Type": type});
                res.end(file, "binary");    
            } else {
                // generated image? return a base64 image
                res.json(200, {
                    picture: util.format(
                        "data:%s;base64,%s", 
                        type, 
                        new Buffer(file, "binary").toString("base64")
                    ), 
                    type: type
                });
            }
        });
    };

    self.templates = function(req, res, next) {
        fs.readdir(self.TEMPLATES_PATH, function(err, files) {
            if (err) {
                return next(err);
            }
            res.json(200, {templates: files});
        })
    }

    self.fileName = function(filePath) {
        return filePath.split("/").pop();
    }

    self.genName = function(name, extension) {
        var randString = self.UPLOAD_PATH + 
                         name +
                         Date.now() + 
                         Math.random();
        var newName = crypto.createHash("md5")
                            .update(randString)
                            .digest("hex");
        return util.format("%s.%s", newName, extension);
    }

}

module.exports = new Images();