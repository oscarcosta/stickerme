define([
    "jquery",
    "require",
    "./util",
    "jquery.fileupload"
], function($, require) {

    var util = require("./util");
    
    var functions = {
        registerUser: function(authResponse, callback) {
            $.post(
                "/login", 
                authResponse, 
                function(data, textStatus, jqXHR) {
                    if (textStatus === "success") {
                        if (callback && typeof callback === "function") {
                            callback(data);
                        }
                    } else {
                        util.showI18nMessage("error", "error_registering_user");
                    }
                }
            );
        },
        loadTemplates: function(callback) {
            $.get("/templates", function(data, textStatus, jqXHR) {
                if (textStatus === "success") {
                    if (callback && typeof callback === "function") {
                        callback(data.templates);
                    }
                } else {
                    util.showI18nMessage("error", "error_loading_templates");
                }
            });
        },
        storePicture: function(imgURL, userid, imgOrigin, callback) {
            $.post(
                "/store", 
                {
                    "imgURL": imgURL,
                    "userid": userid,
                    "imgOrigin": imgOrigin
                }, 
                function(data, textStatus, jqXHR) {
                    if (textStatus === "success") {
                        if (callback && typeof callback === "function") {
                            callback(data);
                        }
                    } else {
                        util.showI18nMessage("error", "error_storing_picture");
                    }
                }
            );
        },
        uploadBase64Picture: function(imgURL, userid, callback) {
            var formData = new FormData();
            formData.append("file", util.dataURItoBlob(imgURL));
            formData.append("userid", userid);
            formData.append("imgOrigin", "img_camera");
            $.ajax({
                url: "/upload",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                complete: function(jqXHR, textStatus) {
                    if (textStatus === "success") {
                        if (callback && typeof callback === "function") {
                            callback(jqXHR.responseJSON);
                        }
                    } else {
                        util.showI18nMessage("error", "error_uploading_picture");
                    } 
                }
            });
        },
        uploadPicture: function(userid, callback) {
            var formData = new FormData();
            formData.append("userid", userid);
            formData.append("imgOrigin", "img_upload");
            $("#picture_upload").fileupload({
                url: "/upload",
                dataType: "json",
                formData: formData,
                always: function(e, data) {
                    if (data.textStatus === "success") {
                        if (callback && typeof callback === "function") {
                            callback(data);
                        }
                    } else {
                        util.showI18nMessage("error", "error_uploading_picture");
                    }
                },
                progressall: function(e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $("#upload_progress .bar").css("width", progress + "%");
                }
            });
        },
        processPicture: function(callback) {
            $.post(
                "/process",
                $("#main_form").serialize(), 
                function(data, textStatus, jqXHR) {
                    if (textStatus === "success") {
                        $.get(
                            "/sticker/" + data.picture,
                            function(data, textStatus, jqXHR) {
                                if (callback && typeof callback === "function") {
                                    callback(data);
                                }
                            }
                        );
                    } else {
                        util.showI18nMessage("error", "error_processing_sticker");
                    }
                }
            );
        }
    };

    return functions;

});
