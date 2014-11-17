define([
    "jquery",
    "require",
    "jquery.i18n.properties",
    "jquery.ui.message"
], function($, require) {

    var functions = {
        getMessage: function(key, args) {
            return $.i18n.prop(key, args);
        },
        showMessage: function(type, message) {
            $(".message").message({
                type: type, 
                message: message
            });
        },
        showI18nMessage: function(type, key) {
            require("./util").showMessage(type, $.i18n.prop(key));
        },
        dataURItoBlob: function(dataURI) {
            var byteString = atob(dataURI.split(",")[1]);
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], {type: "image/png"});
        }
    };

    return functions;

});
