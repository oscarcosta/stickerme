/* Configure loading modules from the libs directory */
requirejs.config({
    baseUrl: "js/libs",
    paths: {
        "jquery": "jquery/jquery-2.1.1.min",
        "jquery.ui": "jqueryui/jquery-ui-1.10.4.custom.min",
        "jquery.ui.rcarousel": "jquery-rcarousel/jquery.ui.rcarousel",
        "jquery.ui.message": "jqueryui-message/jquery.ui.message.min",
        "jquery.jcrop": "jquery-jcrop/js/jquery.Jcrop",
        "ccv": "jquery-facedetection/facedetection/ccv",
        "face": "jquery-facedetection/facedetection/face",
        "jquery.facedetection": "jquery-facedetection/jquery.facedetection",
        "jquery.ui.widget":"jquery-fileupload/vendor/jquery.ui.widget",
        "jquery.iframetransport":"jquery-fileupload/jquery.iframe-transport",
        "jquery.fileupload": "jquery-fileupload/jquery.fileupload",
        "jquery.i18n.properties": "jquery-i18n-properties/jquery.i18n.properties-min-1.0.9",
        "jquery.photobooth": "photobooth-js/photobooth_min",
        "facebook": "//connect.facebook.net/en_US/all",
        "app": "../app"
    },
    shim: {
        "jquery.ui": {
            deps: ["jquery"]
        },
        "jquery.ui.rcarousel": {
            deps: ["jquery", "jquery.ui"]
        },
        "jquery.ui.message": {
            deps: ["jquery", "jquery.ui"]
        },
        "jquery.jcrop": {
            deps: ["jquery"]
        },
        "jquery.facedetection": {
            deps: ["jquery", "ccv", "face"]
        },
        "jquery.ui.widget": {
            deps: ["jquery"]
        },
        "jquery.iframetransport": {
            deps: ["jquery"]
        },
        "jquery.fileupload": {
            deps: ["jquery", "jquery.ui.widget", "jquery.iframetransport"]
        },
        "jquery.i18n.properties": {
            deps: ["jquery"]
        },
        "jquery.photobooth": {
            deps: ["jquery"]
        },
        "facebook": {
            exports: "FB"
        }
    }
});

define("initializer", ["jquery"], function($) {
    /* Configure jQuery to append timestamps to requests, to bypass browser caches */
    $.ajaxSetup({cache: false});
    $("head").append("<link rel='stylesheet' href='css/app.css' type='text/css' />");
});

/* Start loading the app modules */
requirejs(["initializer", "app/main"]);