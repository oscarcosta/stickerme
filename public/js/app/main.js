define([
    "jquery", 
    "require",
    "./util",
    "./fb",
    "./server",
    "./selector",
    "./dialogs",
    "./picture",
    "jquery.ui",
    "jquery.i18n.properties"
], function($, require) {

    var util = require("./util");
    var fb = require("./fb");
    var server = require("./server");
    var selector = require("./selector");
    var dialogs = require("./dialogs");
    var picture = require("./picture");
    
    /* i18n */
    $.i18n.properties({
        name: "Messages", 
        path: "i18n/", 
        mode: "both"
    });

    /* init application features */
    selector.initStickersSelector();
    dialogs.initDialogs();

    /* head links */
    $("#label_about").click(function(event){
        event.preventDefault();
        $("#dlg_about").dialog("open");
    });
    $("#label_about").html($.i18n.prop("label_about"));

    $("#label_contact").click(function(event){
        event.preventDefault();
        $("#dlg_contact").dialog("open");
    });
    $("#label_contact").html($.i18n.prop("label_contact"));

    /* main actions */
    $("#btn_profile").button({
        icons: {
            primary: "ui-icon-person"
        },
        label: $.i18n.prop("profile_label")
    }).click(function(event) {
        event.preventDefault();
        fb.login(function(data) {
            $("#userid").val(data.userid);
            $("#username").val(data.username);
            if (fb.havePermission(data.permissions, "user_photos")) {
                $("#dlg_facebook").dialog("open");
            } else {
                fb.loadPicture(data.userid, function(data) {
                    picture.updatePicture(data.picture);
                });
            }
        });
    }).attr("title", $.i18n.prop("profile_title"));

    $("#btn_upload").button({
        icons: {
            primary: "ui-icon-image"
        },
        label: $.i18n.prop("upload_label")
    }).click(function(event) {
        event.preventDefault();
        $("#dlg_upload").dialog("open");
    }).attr("title", $.i18n.prop("upload_title"));
    
    $("#btn_take").button({
        icons: {
            primary: "ui-icon-image"
        },
        label: $.i18n.prop("take_label")
    }).click(function(event) {
        event.preventDefault();
        picture.takePicture();
    }).attr("title", $.i18n.prop("take_title"));

    $("#btn_generate").button({
        disabled: true,
        icons: {
            primary: "ui-icon-check"
        },
        label: $.i18n.prop("generate_label")
    }).click(function(event) {
        event.preventDefault();
        server.processPicture(function(data) {
            $("#response_sticker").attr("src", data.picture);
            $(".main-wrapper").css("display", "none");
            $(".response-wrapper").css("display", "block");
            $("#btn_reload").button("enable");
            $("#btn_download").button("enable");
            $("#btn_share").button("enable");
        });
    }).attr("title", $.i18n.prop("generate_title"));

    /* result actions */
    $("#btn_reload").button({
        disabled: true,
        icons: {
            primary: "ui-icon-document"
        },
        label: $.i18n.prop("reload_label")
    }).click(function(event){
        event.preventDefault();
        window.location.reload(false);
    }).attr("title", $.i18n.prop("reload_title"));
    
    $("#btn_download").button({
        disabled: true,
        icons: {
            primary: "ui-icon-disk"
        },
        label: $.i18n.prop("download_label")
    }).click(function(event){
        event.preventDefault();
        var url = $("#response_sticker").attr("src")
                                        .replace(/^data:image\/[^;]/, 
                                                 "data:application/octet-stream");
        window.open(url);
    }).attr("title", $.i18n.prop("download_title"));
    
    $("#btn_share").button({
        disabled: true,
        icons: {
            primary: "ui-icon-comment"
        },
        label: $.i18n.prop("share_label")
    }).click(function(event){
        event.preventDefault();
        $("#dlg_share").dialog("open");
    }).attr("title", $.i18n.prop("share_title"));

    /* tooltip */
    $(".ui-button").tooltip();

    /* public module functions */
    var functions = {
        checkLogin: function() {
            fb.checkLoginState(function(data) {
                if (data.userid) {
                    $("#userid").val(data.userid);
                    $("#username").val(data.username);
                    fb.loadPicture(data.userid, function(data) {
                        picture.updatePicture(data.picture);
                    });
                } else {
                    picture.memePicture();
                }
            });            
        }
    }

    functions.checkLogin();
    return functions;
    
});
