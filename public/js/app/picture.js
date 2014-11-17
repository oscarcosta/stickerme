define([
    "jquery",
    "require",
    "./util",
    "./fb",
    "./server",
    "jquery.ui",
    "jquery.jcrop",
    "jquery.facedetection",
    "jquery.photobooth"
], function($, require) {

    var util = require("./util");
    var fb = require("./fb");
    var server = require("./server");

    var jcropApi; /* store jcrop to enable image changes */

    var functions = {
        memePicture: function() {
            var images = ['meme01.jpg', 'meme02.jpg', 'meme03.jpg', 'meme04.jpg'];
            var currentDate = new Date();
            var imageNumber = Math.floor(currentDate.getSeconds()/(60/images.length));
            require("./picture").updatePicture(images[imageNumber]);
        },
        updatePicture: function(picture) {
            /* destroy any existing jcrop */
            if (jcropApi) {
                jcropApi.destroy();
            }
            /* "reset" the picture object */
            $("#picture").val(picture);
            $(".picture-merger").html("");
            var pic = $("<img id='file' alt='My Picture' name='file'/>");
            pic.attr("src", "/picture/" + picture);
            pic.appendTo(".picture-merger")
            /* init square selection */
            pic.faceDetection({
                complete: function(img, coords) {
                    var pos = [0, 0, 300, 300];
                    if (coords.length > 0) {
                        var adj1 = (300 - coords[0].width) / 2;
                        var adj2 = adj1 + coords[0].width;
                        pos = [
                            (coords[0].x - adj1), 
                            (coords[0].y - adj1), 
                            (coords[0].x + adj2), 
                            (coords[0].y + adj2)
                        ];
                    }
                    pic.Jcrop({
                        allowSelect: false,
                        aspectRatio: 1,
                        setSelect: pos,
                        bgColor: "black",
                        bgOpacity: .2,
                        onSelect: function(c) {
                            $("#x1").val(c.x);
                            $("#x2").val(c.x2);
                            $("#y1").val(c.y);
                            $("#y2").val(c.y2);
                            $("#w").val(c.w);
                            $("#h").val(c.h);
                        },
                        onChange: function(c) {
                            $(".jcrop-holder div div div.jcrop-tracker").css(
                                "background", 
                                "url('" + $("#sticker").val() + "') no-repeat 0 0 / " + c.w + "px " + c.h + "px");
                        }
                    },
                    function() {
                        jcropApi = this;
                    });
                    /* enable generate button */
                    $("#btn_profile").button("enable");
                    $("#btn_upload").button("enable");
                    $("#btn_take").button("enable");
                    $("#btn_generate").button("enable");
                }
            });
        },
        takePicture: function() {
            var userid = $("#userid").val();
            $(".picture-merger").html("");
            $(".picture-merger").photobooth().on(
                "image", 
                function(event, dataUrl) {
                    server.uploadBase64Picture(dataUrl, userid, function(data) {
                        $(".picture-merger").data("photobooth").destroy();
                        require("./picture").updatePicture(data.picture);
                    });
                }
            ).resize(500, 500);
            if ($(".picture-merger").data("photobooth").isSupported) { 
                $("#btn_profile").button("disable");
                $("#btn_upload").button("disable");
                $("#btn_take").button("disable");
                $("#btn_generate").button("disable");
            } else {
                util.showI18nMessage("info", "take_picture_not_available");
                $(".picture-merger").data("photobooth").destroy();
                require("./picture").memePicture();
            }
        }
    };

    return functions;

});