
var mhLog = require("src/js/mhlog.js");

// Variables
var localMediaStream;
var canvasUpdateId;

// Variable needed to control testing
var testing = false;


// Code
// window.onload = main;
if (!testing)
    main();

// EventHandlers
function main()
{
    // initialization
    mhLog.setLoggingLevel(mhLog.LEVEL.ALL);
    mhLog.log(mhLog.LEVEL.PRODUCTION, "In window.onload handler...");

    // Check out screen orientation command
    if (window.orientation) {
        console.log("Orientation is " + window.orientation);
    } else {
        console.log("No screen orientation API");
    }

    // Check for user media!
    if (hasGetUserMedia())
    {
        var captureBtnElem = document.getElementById("screenshot-button");
        captureBtnElem.onclick = screenshotButton;

        var stopBtnElem = document.getElementById("screenshot-stop-button");
        stopBtnElem.onclick = screenshotStopButton;

        var startBtnElem = document.getElementById("screenshot-start-button");
        startBtnElem.onclick = screenshotStartButton;

        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia;
    }
    else
    {
        var titleElem = document.getElementById("media");
        titleElem.innerHTML += " (Not available)";
    }

    // Setup Audio
    var playAudioBtn = document.getElementById("addSound");
    playAudioBtn.onclick = addAudioSound;
}

function addAudioSound()
{
    console.log("In addAudioSound");
    var audioHolder = document.getElementById("audioHolder");
    var audioElement = document.createElement("audio");
    audioHolder.appendChild(audioElement);
    //audioElement.setAttribute('src', 'http://www.csc.calpoly.edu/~mhaungs/pub/536618.mp3');  // Works
    //audioElement.setAttribute('src', 'http://www.newgrounds.com/audio/download/536618'); // Works
    audioElement.setAttribute('src', 'https://api.soundcloud.com/tracks/93726556/download?client_id=0f8fdbbaa21a9bd18210986a7dc2d72c');
    audioElement.setAttribute('controls', true);
    audioElement.setAttribute('preload', true);
    audioElement.setAttribute('type', 'audio/mp3');
    audioElement.addEventListener("load", function() {
        console.log("Play play play!");
        audioElement.play();
    }, true);  // http://www.newgrounds.com/audio/download/536618
    audioElement.load();
}

// Media operations
function hasGetUserMedia()
{
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function onMediaFail(e)
{
    mhLog.log(mhLog.LEVEL.PRODUCTION, "Media Failed: " + e);
}

function screenshotButton(e)
{
    var vcanvas = document.getElementById("screenshot-canvas");
    var ctx = vcanvas.getContext('2d');
    var vimg = document.getElementById("screenshot");
    if (localMediaStream) {
        //ctx.drawImage(video, 0, 0);
        // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
        ctx.fillStyle = "rgba(220,223,0, 0.3);";
        ctx.fillRect(100, 100, 200, 200);
        ctx.fillStyle = "#FF00DD";
        ctx.font = "30px Arial";
        ctx.fillText("PolyXpress is with you!", 200, 200);
        vimg.src = vcanvas.toDataURL('image/webp');
    }
}

function screenshotStopButton(e)
{
    var video = document.getElementById("screenshot-stream");
    clearInterval(canvasUpdateId);
    video.pause();
    localMediaStream.stop();
}

function screenshotStartButton(e)
{
    navigator.getUserMedia({video: true}, function(stream)
    {
        var canvas = document.getElementById("screenshot-canvas");
        var ctx = canvas.getContext('2d');
        var img = document.getElementById("screenshot");
        var video = document.getElementById("screenshot-stream");

        video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
        sizeCanvas(function()
        {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            img.height = video.videoHeight;
            img.width = video.videoWidth;
        });
        canvasUpdateId = setInterval(function() {
            ctx.drawImage(video, 0, 0);
            //console.log("stop me..");
        }, 67);

    }, onMediaFail);
}

function sizeCanvas(sizeStuff)
{
    setTimeout(sizeStuff, 100);
}

// Interface


// Error Functions

function displayError(error)
{
    var errorTypes =
            {
                0: "Unknown error",
                1: "Permission denied by user",
                2: "Position is not available",
                3: "Request timed out"
            };
    var errorMessage = errorTypes[error.code];
    if (error.code === 0 || error.code === 2)
    {
        errorMessage = errorMessage + " " + error.message;
    }
    var div = document.getElementById("errorMsg");
    div.innerHTML = errorMessage;
}
