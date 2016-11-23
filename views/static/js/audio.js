
        window.URL = window.URL || window.webkitURL;

        window.onload = initializePlayer;

				var isIE = /*@cc_on!@*/false || !!document.documentMode;
						// Edge 20+
				var isEdge = !isIE && !!window.StyleMedia;

        var fileSelect = document.getElementById("fileSelect"),
            fileElem   = document.getElementById("fileElem"),
            fileList   = document.getElementById("fileList");

        var imageSelect = document.getElementById("imageSelect"),
            imageElem   = document.getElementById("imageElem"),
            imageList   = document.getElementById("imageList");

				var form = document.forms.namedItem("uploadForm"),
						image,
						fileImage,
						token;

        var endAudioTime = audio.duration;

        var bgImage;
        var albumImage = document.getElementById("albumImage");
        var albumTags = document.getElementById("postTags");


        fileSelect.addEventListener("click", function(e){
            if(fileElem){
                fileElem.click();
            }

            e.preventDefault();
        }, false);

        imageSelect.addEventListener("click", function(e){
            if(imageElem){
                imageElem.click();
            }

            e.preventDefault();
        }, false);

				form.addEventListener('submit', function(e){
				if(!isIE || !isEdge){
					console.log(isIE);
					formData = new FormData(form);

					formData.set('fileElem', file);

					e.preventDefault();
					getAlbumCover(file, function(cover){
						formData.set('imageElem', cover);

						var req = new XMLHttpRequest();
						req.open("POST", "upload", true);
						req.onload = function(event){
							if(req.status == 200){
								console.log("Uploaded!");
								document.location.href = "/";
							}else{
								console.log("error" + req.status);
							}
						}
						req.send(formData);
					});
				}
				}, false);

        var slider = document.getElementById("seekSlider");
        noUiSlider.create(slider, {
            start: 0,
            range:{
                'min': 0,
                'max': 100
            },
            step: 1,
        });


        function showMetaData(data){

            musicmetadata(data, function(err, result){
                if(err)
                    console.log(err);

                if(result.picture.length > 0 && !isIE && !isEdge){
                    var picture = result.picture[0];
                    var url = URL.createObjectURL(new Blob([picture.data], {'type':'image/' + picture.format}));
                    var image = document.getElementById('albumImage');

                    imageList.innerHTML = "<p>" + result.title + "." + picture.format + "</p>";

                    image.style.backgroundImage = "url(" + url + ")";
                    image.style.backgroundRepeat = "no-repeat";
                    image.style.backgroundSize = "155px 131px";

                    bgImage = url;
										fileImage = undefined;
										console.log(fileImage);
                } else {
									if(typeof fileImage == 'undefined')
										imageList.innerHTML = "<p>Pulling the Album image isnt supported, please select an (album)Image</p>";
									
                }

                document.getElementById('title').value = result.title;
                document.getElementById('artist').value = result.artist;
                document.getElementById('genre').value = result.genre;
                document.getElementById('postSong').innerHTML = result.title;
                document.getElementById('postArtist').innerHTML = result.artist;
            }); 
        }   


        function init(){
            var audio = document.getElementById("audio");
            audio.ontimeupdate = function(){ getCurrentPlayTime(), stopAudio() };
        }

        function handleFiles(files){
           if(!files.length){
               fileList.innerHTML = "<p>No files selected</p>";
           } else {
							file = files[0];

              fileList.innerHTML = "<p>" + files[0].name + "</p>";
              var audio = document.getElementById("audio");
              audio.src = window.URL.createObjectURL(files[0])
              audio.pause();
							audio.setAttribute('preload', 'auto');
              document.getElementById("currentTimePosition").innerHTML = "0:00/0:00";
              document.getElementById("playbtn").innerHTML ="<img src=\"/images/play_button.png\">";
              showMetaData(file);
							

              document.getElementById("fileStart").value = "0:00";
              document.getElementById("fileStop").value = "0:35";
              slider.noUiSlider.set(value = 0);
           }
        }

				function getAlbumCover(data, callback) {
					musicmetadata(data, function(err, result){
						if(err)
							console.log(err);

						var picture = result.picture[0];
						if(picture){
							var albumBlob = new Blob([picture.data], {'type':'image/' + picture.format});
						}
						if(typeof fileImage === 'undefined'){
							callback(albumBlob);
						}else{
							callback(fileImage);
						}
					});
				}

        function handleImage(files){
           if(!files.length){
               imageList.innerHTML = "<p>No image selected</p>";
           } else {
              imageList.innerHTML = "<p>" + files[0].name + "</p>";
              var image = document.getElementById("albumImage");
              img = window.URL.createObjectURL(files[0])
              image.style.backgroundImage = "url(" + img + ")";
              image.style.backgroundRepeat = "no-repeat";
              image.style.backgroundSize = "155px 131px";

              bgImage = img;
							fileImage = files[0];
							console.log(fileImage);
           }
        }


        function initializePlayer(){
            var audio = document.getElementById("audio");
            var playbtn = document.getElementById("playbtn");
            var fileStart = document.getElementById("fileStart");

            function playPause(){
                if(audio.paused){
                    playAudio(); 
                    showAlbum();
                } else {
                    pauseAudio();
                    showTags();
                }
            }


            function seekTimeUpdate(){
                var newTime = audio.currentTime * (100 / audio.duration);

                slider.noUiSlider.set(newTime);
            }


            playbtn.addEventListener("click", playPause, false);
            playbtn.addEventListener("mouseenter", showAlbumMouseOver, false);
            playbtn.addEventListener("mouseleave", showTagsMouseOut, false);
            audio.addEventListener("timeupdate", seekTimeUpdate, false);
            slider.noUiSlider.on("slide", function(values, handle){
                var seekTo = audio.duration * (values[handle] / 100);
                audio.currentTime = seekTo;
                var currentAudioTime = getCurrentAudioTime();
                var endAudioTime = getEndAudioTime();

                document.getElementById("fileStart").value = currentAudioTime;
                document.getElementById("fileStop").value = endAudioTime;
            });

        }

        function playAudio(){
            audio.play();
            playbtn.innerHTML = "<img src=\"/images/pause_button.png\">";
            audio.setAttribute("data-isPlayed", 1);
        }

        function pauseAudio(){
            audio.pause();
            playbtn.innerHTML = "<img src=\"/images/play_button.png\">";
            audio.setAttribute("data-isPlayed", 0);
        }

        function showAlbum(){
            albumTags.style.visibility = "hidden"; 
            albumImage.style.backgroundImage = "url(" + bgImage + ")";
            var isPlayed = audio.getAttribute("data-isPlayed");
        }

        function showTags(){
            albumTags.style.visibility = "visible"; 
            albumImage.style.backgroundImage = "none";
            var isPlayed = audio.getAttribute("data-isPlayed");
        }

        function showAlbumMouseOver(){
            var isPlayed = audio.getAttribute("data-isPlayed");
                if(isPlayed == 0){
                    showAlbum();
                }

        }

        function showTagsMouseOut(){
            var isPlayed = audio.getAttribute("data-isPlayed");
                if(isPlayed == 0){
                    showTags();
                }

        }

        function stopAudio(){
                var startTime = document.getElementById("fileStart").value;
                var newTime = convertToSeconds(startTime);
                if(audio.currentTime >= endAudioTime){
                    audio.pause();
                    audio.currentTime = newTime;
                    document.getElementById("playbtn").innerHTML = "<img src=\"/images/play_button.png\">";
                    showTags();
                }
        }

        function getCurrentPlayTime(){
            var currentAudioTime = getCurrentAudioTime();
            var audioDuration = getAudioDuration();

            if(audio.currentTime >= audio.duration){
                document.getElementById("playbtn").innerHTML = "<img src=\"/images/play_button.png\">";

                showTags();
            }

            document.getElementById("currentTimePosition").innerHTML = currentAudioTime + "/" + audioDuration;
        }

        function getCurrentAudioTime(){
            var min = Math.floor(audio.currentTime / 60);
            var sec = Math.floor(audio.currentTime - min * 60);

            sec = padTimer(sec, "00");


            return min + ":" + sec;
        }

        function getEndAudioTime(){
            var endTime = audio.currentTime + 35;

            endAudioTime = endTime;

            if(endTime >= audio.duration){
                endTime = audio.duration;
            }

            var min = Math.floor(endTime / 60);
            var sec = Math.floor(endTime - min * 60);

            sec = padTimer(sec, "00");

            if(audio.ended)
                playbtn.innerHTML = "<img src=\"/images/play_button.png\">";

            return min + ":" + sec;

        }

        function getAudioDuration(){
            var duration = audio.duration;

            var min = Math.floor(duration / 60);
            var sec = Math.floor(duration - min * 60);

            sec = padTimer(sec, "00");

            return min + ":" + sec;

        }

        function convertToSeconds(string){
           var result = string.split(":");
           var min = parseInt(result[0], 10);
           var sec = parseInt(result[1], 10);

           var newMin = min * 60;
           var newSec = newMin + sec
           var newTime = newSec;

           return newTime;

        }

        function formatSecondsToMin(string){
            var min = Math.floor(string / 60);
            var sec = Math.floor(string - min * 60);

            sec = padTimer(sec, "00");

            return min + ":" + sec;

        }

        function setAudioStart(){
           var start = document.getElementById("fileStart").value; 
           var newTime = convertToSeconds(start);
           var stop = document.getElementById("fileStop").value;
           var stopTime = convertToSeconds(stop);
           audio.currentTime = newTime;

           if(newTime >= stopTime){
                document.getElementById("fileStop").value = formatSecondsToMin(newTime + 35);
           }

           slider.noUiSlider.set(value = newTime);
        }

        function setAudioStop(){
           var start = document.getElementById("fileStart").value; 
           var startTime = convertToSeconds(start);
           var stop = document.getElementById("fileStop").value;
           var newTime =  convertToSeconds(stop);

           if(newTime >= startTime + 35){
                document.getElementById("fileStop").value = formatSecondsToMin(startTime + 35);
           }
           if(newTime <= startTime){
                document.getElementById("fileStop").value = formatSecondsToMin(startTime + 35);
           } else {
                endAudioTime = newTime;
           }
          }

        //Pads the duration with (n) leading 0000000 (zeros)
        function padTimer(time, padding){
            var oldTime = "" + time;
            var pad = padding;
            return time = pad.substring(0, pad.length - oldTime.length) + oldTime;
        }

        function updateTags(tags){
            document.getElementById("postTags").innerHTML = "<span>" + tags + "</span>";
        }

        document.addEventListener("DOMContentLoaded", init, false);
