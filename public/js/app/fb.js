define([
    "jquery",
    "require",
    "./util",
    "./server",
    "facebook"
], function($, require) {

    var util = require("./util");
    var server = require("./server");

    FB.init({
        appId: "",
        status: true,
        cookie: true,
        xfbml: true,
        version: "v2.0"
    });

    var functions = {
        login: function(callback) {
            FB.login(function(response) {
                if (response.status === "connected") {
                    server.registerUser(response.authResponse, function(data) {
                        if (callback && typeof callback === "function") {
                            callback(data);
                        }
                    });
                } else {
                    util.showI18nMessage("info", "not_logged_in");
                }
            }, {
                scope: "public_profile, email, user_photos", return_scopes: true
            });
        },
        checkLoginState: function(callback) {
            FB.getLoginStatus(function(response) {
                if (response.status === "connected") {
                    server.registerUser(response.authResponse, function(data) {
                        if (callback && typeof callback === "function") {
                            callback(data);
                        }
                    });
                } else {
                    util.showI18nMessage("info", "not_logged_in");
                    if (callback && typeof callback === "function") {
                        callback({message: util.getMessage("not_logged_in")});
                    }
                }
            });
        },
        loadPicture: function(userid, callback) {
            FB.api(
                "/me/picture",
                {
                    "redirect": true,
                    "type": "normal",
                    "height": "500",
                    "width": "500"
                },
                function(response) {
                    if (response && !response.error) {
                        server.storePicture(response.data.url, userid, "img_facebook", function(data) {
                            if (callback && typeof callback === "function") {
                                callback(data);
                            }
                        });
                    } else {
                        util.showI18nMessage("error", "error_loading_picture");
                    }
                }
            );
        },
        loadAlbums: function(callback) {
            FB.api(
                "/me/albums",
                function(response) {
                    if (response && !response.error) {
                        if (callback && typeof callback === "function") {
                            callback(response.data);
                        }
                    } else {
                        util.showI18nMessage("error", "error_loading_user_albums");
                    }
                }
            );
        },
        loadAlbumPhotos: function(albumId, callback) {
            FB.api(
                "/" + albumId + "/photos",
                function (response) {
                    if (response && !response.error) {
                        if (callback && typeof callback === "function") {
                            callback(response.data);
                        }
                    } else {
                        util.showI18nMessage("error", "error_loading_user_photos");
                    }
                }
            );
        },
        publishSticker: function() {
            FB.login(function(response) {
                if (response.authResponse) {
                    var grantedScopes = response.authResponse.grantedScopes;
                    if (require("./fb").havePermission(grantedScopes, "publish_actions")) {
                        var accessToken = response.authResponse.accessToken;
                        var formData = new FormData();
                        formData.append("access_token", accessToken);
                        formData.append("source", util.dataURItoBlob($("#response_sticker").attr("src")));
                        formData.append("message", $("#share_message").val());
                        $.ajax({
                            url: "https://graph.facebook.com/me/photos?access_token=" + accessToken,
                            type: "POST",
                            data: formData,
                            processData: false,
                            contentType: false,
                            cache: false,
                            complete: function(jqXHR, textStatus) {
                                if (textStatus == "success") {
                                    util.showI18nMessage("info", "sticker_published_facebook");
                                } else {
                                    util.showI18nMessage("error", "error_publishing_sticker");
                                }
                            }
                        });
                    } else {
                        util.showI18nMessage("error", "unauthorized_publishing");
                    }
                }
            }, {
                scope: "publish_actions", return_scopes: true
            });
        },
        havePermission: function(permissions, requiredPermission) {
            return permissions.indexOf(requiredPermission) >= 0;
        },
        selectableAlbum: function(album) {
            return album.count > 0 
                && (album.type === "normal" || album.type === "profile") 
                && (album.privacy === "everyone" || album.privacy === "friends");
        }
    };

    return functions;

});
