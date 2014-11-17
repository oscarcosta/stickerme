define([
    "jquery",
    "require",
    "./server",
    "jquery.ui.rcarousel"
], function($, require) {

    var server = require("./server");

    function initStickerCarousel() {
        $("#stickers_selector").rcarousel({
            width: 150,
            height: 150,
            visible: 3,
            step: 2,
            orientation: "vertical",
            navigation: {
                next: ".selector-wrapper .ui-nav-next",
                prev: ".selector-wrapper .ui-nav-prev"
            },
            start: function() {
                stickersSelectorEvent();
                $("#stickers_selector img")[0].click();
            },
            pageLoaded: function() {
                stickersSelectorEvent();
            }
        });
    }

    function stickersSelectorEvent() {
        $("#stickers_selector img").click(function(event) {
            var imgSrc = $(event.target).attr("src");
            $("#sticker").val(imgSrc);
            var tracker = $(".jcrop-holder div div div.jcrop-tracker");
            tracker.css("background", 
                        "url('" + imgSrc + "') no-repeat 0 0 / " + 
                        tracker.width() + "px " + 
                        tracker.height() + "px");
        });
    }

    var functions = {
        initStickersSelector: function() {
            if (!$.trim($("#stickers_selector").html())) {
                server.loadTemplates(function(templates) {
                    var $img, $jqElements = $();
                    $.each(templates, function(index, template) {
                        $img = $("<img/>").attr("src", "images/stickers/" + template);
                        if (index < 3) {
                            $img.appendTo("#stickers_selector");
                        } else {
                            if (index == 3) {
                                initStickerCarousel();
                            }
                            $jqElements = $jqElements.add($img);
                        }
                    });
                    $("#stickers_selector").rcarousel("append", $jqElements);
                });
            }
        }
    };

    return functions;

});
