db.user.findOne({
    userid: 'undefined'
}, function(err, doc) {
    if (!doc) {
        db.user.insert({
            userid: 'nobody',
            email: 'nobody@stickerme.net',
            name: 'nobody',
            create_date: new Date(),
            access_count: 0
        });
    }
});