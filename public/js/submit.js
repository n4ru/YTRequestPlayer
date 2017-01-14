$('img').click(function() {
    req = $('#yt').val();
    if (!(/youtu.?be/.test(req))) {
        $('#yt').val('');
        $('#done').html("</br>Unsupported Link");
    } else {
        if (/v=([a-z0-9A-Z_-]*)/.test(req))
            vidID = req.match(/v=([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
        else
            vidID = req.match(/.be\/([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
        $.get("https://www.googleapis.com/youtube/v3/videos?id=" + vidID + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=contentDetails", function(data) {
            stuff = data;
            if (!(/PT([0-9]*)M/.test(stuff["items"][0]["contentDetails"]["duration"])) || stuff["items"][0]["contentDetails"]["duration"].match(/PT([0-9]*)M/)[1] < 11) {
                $.ajax({
                    method: "POST",
                    url: "http://crabjams.com/playlist/insert",
                    data: {
                        url: req
                    },
                    success: function(d) {
                        $('#yt').val('');
                        $('#done').html("</br>Your request has been submitted");
                        setTimeout(function(){location.reload();},2000);
                    }
                })
            } else {
                $('#yt').val('');
                $('#done').html("</br>Too Long");
            }
        });
    }
});
