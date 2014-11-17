({
    appDir: "public",
    baseUrl: "js",
    dir: "public-build",
    paths: {
        "jquery": "libs/jquery/jquery-2.1.1.min",
        "jquery.ui": "libs/jqueryui/jquery-ui-1.10.4.custom.min",
        "jquery.ui.rcarousel": "libs/jquery-rcarousel/jquery.ui.rcarousel",
        "jquery.ui.message": "libs/jqueryui-message/jquery.ui.message.min",
        "jquery.jcrop": "libs/jquery-jcrop/js/jquery.Jcrop",
        "ccv": "libs/jquery-facedetection/facedetection/ccv",
        "face": "libs/jquery-facedetection/facedetection/face",
        "jquery.facedetection": "libs/jquery-facedetection/jquery.facedetection",
        "jquery.ui.widget": "libs/jquery-fileupload/vendor/jquery.ui.widget",
        "jquery.iframetransport": "libs/jquery-fileupload/jquery.iframe-transport",
        "jquery.fileupload": "libs/jquery-fileupload/jquery.fileupload",
        "jquery.i18n.properties": "libs/jquery-i18n-properties/jquery.i18n.properties-min-1.0.9",
        "jquery.photobooth": "libs/photobooth-js/photobooth_min",
        "facebook": "empty:"
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
        }
    },
    modules: [
        {
            name: "app"
        }
    ]
})