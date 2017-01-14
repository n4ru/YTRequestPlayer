data_arr = []
data_inc = 0;
data_track = [];

function playTrack(data_track) {
    data_track = data_track;
}

function playNext(del) {
    console.log("DOING THE THING")
    if (del) {
        $.get("http://crabjams.com/playlist/delete/latest", function() {
            $.get("http://crabjams.com/playlist/get/latest", function(data) {
                data_track = data
                if (/v=([a-z0-9A-Z_-]*)/.test(data_track))
                    vidID = data_track.match(/v=([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
                else
                    vidID = data_track.match(/.be\/([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
                $.get("https://www.googleapis.com/youtube/v3/videos?id=" + vidID + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=contentDetails", function(data) {
                    stuff = data;
                    time = stuff["items"][0]["contentDetails"]["duration"].match(/PT([0-9]*)M([0-9]*)S/)
                        // EMBED VIDEO
                    $('.video').html("<iframe width=\“1\” height=\“0\” src=http://www.youtube.com/embed/" + vidID + "?autoplay=1 frameborder=\“0\” allowfullscreen></iframe>");
                    // END EMBED]
                    timetonext = ((time[1] * 60 * 1000) + (time[2] * 1000))
                    console.log(timetonext)
                    if (typeof time[1] === "undefined")
                        time[1] = 0
                    nextTrack = setTimeout(function() {
                        console.log("QD")
                        playNext(true)
                    }, timetonext)
                });
            })
        })
    } else {
        $.get("http://crabjams.com/playlist/get/latest", function(data) {
            data_track = data;
            if (/v=([a-z0-9A-Z_-]*)/.test(data_track))
                vidID = data_track.match(/v=([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
            else
                vidID = data_track.match(/.be\/([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
            $.get("https://www.googleapis.com/youtube/v3/videos?id=" + vidID + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=contentDetails", function(data) {
                stuff = data;
                time = stuff["items"][0]["contentDetails"]["duration"].match(/PT([0-9]*)M([0-9]*)S/)
                    // EMBED VIDEO
                $('.video').html("<iframe width=\“1\” height=\“0\” src=http://www.youtube.com/embed/" + vidID + "?autoplay=1 frameborder=\“0\” allowfullscreen></iframe>");
                // END EMBED]
                timetonext = ((time[1] * 60 * 1000) + (time[2] * 1000))
                console.log(timetonext)
                if (typeof time[1] === "undefined")
                    time[1] = 0
                nextTrack = setTimeout(function() {
                    console.log("QD")
                    playNext(true)
                }, timetonext)
            });
        })
    }
}

function getSongs() {
    $.get("http://crabjams.com/playlist/get/all", function(data) {
        data_arr = data;
        for (var x in data_arr) {
            count = parseInt(x) + 1;
            data_arr[x] = "<a style='text-decoration:none' id='song'>" + data_arr[x][0] + "</a>";
        }
        if (data_inc > 0) {
            for (var x = 0; x < data_inc; x++) {
                data_arr.splice(0, 1);
            }
        }
        $('#requests').html(data_arr.join('</br>'))
            //download href='../done/" + count + "-" + data_arr[x].replace(/ /g,"_") + ".mp3'
        $('#song').click(function(event) {
            data_inc++;
            var text = $(event.target).text();
            $('#current').text(text);
            getSongs();
        });
        $('#current').html(data_arr[0]);
    })
}



getTracks = setInterval(getSongs, 60000);
playNext();
getSongs();