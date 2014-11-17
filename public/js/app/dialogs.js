define([
    "jquery",
    "require",
    "./util",
    "./fb",
    "./server",
    "./picture",
    "jquery.ui",
    "jquery.fileupload",
    "jquery.ui.rcarousel"
], function($, require) {

    var util = require("./util");
    var fb = require("./fb");
    var server = require("./server");
    var picture = require("./picture");

    function initPictureSelectorfunction() {
        if (!$.trim($("#pictures_selector").html())) {
            fb.loadAlbums(function(albums) {
                var count = 0;
                $.each(albums, function(i, album) {
                    if (fb.selectableAlbum(album)) {
                        fb.loadAlbumPhotos(album.id, function(photos) {
                            var $img, $jqElements = $();
                            $.each(photos, function(i, photo) {
                                $img = $("<img/>").attr("src", photo.source);
                                if (count < 4) {
                                    $img.appendTo("#pictures_selector");
                                } else {
                                    if (count == 4) {
                                        initPictureCarousel();
                                    }
                                    $jqElements = $jqElements.add($img);
                                }
                                count++;
                            });
                            $("#pictures_selector").rcarousel("append", $jqElements);
                        });
                    }
                });
            });
        }
    }

    function initPictureCarousel() {
        $("#pictures_selector").rcarousel({
            width: 150,
            height: 150,
            visible: 4,
            step: 4,
            navigation: {
                next: ".pictures-wrapper .ui-nav-next",
                prev: ".pictures-wrapper .ui-nav-prev"
            },
            start: function() {
                pictureSelectorEvent();
            },
            pageLoaded: function() {
                pictureSelectorEvent();
            }
        });
    }

    function pictureSelectorEvent() {
        $("#pictures_selector img").click(function(event) {
            var imgSrc = $(event.target).attr("src");
            var userid = $("#userid").val();
            server.storePicture(imgSrc, userid, "img_facebook", function(data) {
                picture.updatePicture(data.picture);
                $("#dlg_facebook").dialog("close");
            });
        });
    }

    var functions = {
        initDialogs: function() {
            /* facebook dialog */
            $("#dlg_facebook").dialog({
                autoOpen: false,
                height: 250,
                width: 700,
                modal: true,
                title: $.i18n.prop("facebook_dialog_title"),
                open: function(event, ui) {
                    initPictureSelectorfunction();
                }
            });
            $("#text_picture_facebook").html($.i18n.prop("facebook_dialog_text"));

            /* share dialog */
            $("#dlg_share").dialog({
                autoOpen: false,
                height: 250,
                width: 450,
                modal: true,
                title: $.i18n.prop("share_dialog_title"),
                open: function(event, ui) {
                    $("#share_message").val("");
                    $("#btn_confirm_share").button({
                        icons: {
                            primary: "ui-icon-check"
                        },
                        label: $.i18n.prop("confirm_share_label")
                    }).click(function(event) {
                        event.preventDefault();
                        fb.publishSticker();
                        $("#dlg_share").dialog("close");
                    }).attr("title", $.i18n.prop("confirm_share_title"));
                }
            });
            $("#text_share").html($.i18n.prop("share_dialog_text"));

            /* upload dialog */
            $("#dlg_upload").dialog({
                autoOpen: false,
                height: 200,
                width: 400,
                modal: true,
                title: $.i18n.prop("upload_dialog_title"),
                open: function(event, ui) {
                    var userid = $("#userid").val();
                    server.uploadPicture(userid, function(data) {
                        picture.updatePicture(data.result.picture);
                        $("#dlg_upload").dialog("close");
                    });
                },
                beforeClose: function(event, ui) {
                    $("#upload_progress .bar").css("width", "0%");
                }
            });
            $("#text_picture_upload").html($.i18n.prop("upload_dialog_text"));

            /* about dialog */
            $("#dlg_about").dialog({
                autoOpen: false,
                height: 300,
                width: 600,
                modal: true,
                title: $.i18n.prop("about_dialog_title")
            });
            $("#dlg_about").html($.i18n.prop("about_dialog_text"));
            
            /* contact dialog */
            $("#dlg_contact").dialog({
                autoOpen: false,
                height: 200,
                width: 400,
                modal: true,
                title: $.i18n.prop("contact_dialog_title")
            });
            $("#dlg_contact").html($.i18n.prop("contact_dialog_text"));
        }
    };

    return functions;
    
});
