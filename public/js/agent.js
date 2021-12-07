let state = "stopped";
let OTSession = null;
let publisher = null;
let subscriber = null;

var laserOn = false;
var clicking = false;
var previousX;
var previousY;
var zoomLevel = 0;
var MAX_ZOOM_LEVEL = 5;
var ZOOM_INCREMENT_PX = 50;

var elSubscribersId = "customer";
var elPublisherId = "agent"

    document.addEventListener('mouseup',function(){
        clicking = false;
        console.log("up "+clicking);
    });
    document./*getElementById(elSubscribersId).*/addEventListener('mousedown',function(e){
        e.preventDefault();
        previousX = e.clientX;
        previousY = e.clientY;
        clicking = true;
        console.log("down "+clicking);
    });
    document.getElementById(elSubscribersId).addEventListener('mousemove',function(e){
        e.preventDefault();
       if(laserOn){
            var subscriberElem = document.getElementById(elSubscribersId);
            var videoElem = subscriberElem.querySelector('video');
            var laserElem = document.getElementById("laser");
            //console.log(videoElem.getBoundingClientRect());
            //console.log(document.getElementById("laser").getBoundingClientRect());
            sendLaserLocation(videoElem.getBoundingClientRect().width,
                              videoElem.getBoundingClientRect().height,
                              (laserElem.getBoundingClientRect().left - videoElem.getBoundingClientRect().left),
                              (laserElem.getBoundingClientRect().top - videoElem.getBoundingClientRect().top));
            laserElem.style.top = e.clientY+"px";
            laserElem.style.left = e.clientX+"px";
            
       }
        
       if (clicking) {
            
            var subscriberElem = document.getElementById(elSubscribersId);
            var videoElem = subscriberElem.querySelector('video');

            var publisherBox = subscriberElem.getBoundingClientRect();
            var videoBox = videoElem.getBoundingClientRect();
            
            var curTop = videoElem.style.top === '' ? '0px' : videoElem.style.top;
            var curLeft = videoElem.style.left === '' ? '0px' : videoElem.style.left;
            
            var newTop = (parseInt(curTop,10) -  (previousY - e.clientY));
            var newLeft = (parseInt(curLeft,10) -  (previousX - e.clientX));
           
            if(newTop > 0) newTop =0;
            if(newTop < (publisherBox.height-videoBox.height)) newTop = (publisherBox.height-videoBox.height)
            if(newLeft > 0) newLeft =0;
            if(newLeft < (publisherBox.width-videoBox.width)) newLeft = (publisherBox.width-videoBox.width);
           
            videoElem.style.top = newTop+"px";
            videoElem.style.left = newLeft+"px";
            console.log("t:"+newTop+" l:"+newLeft)
            previousX = e.clientX;
            previousY = e.clientY;
           
       } 
    });
    document.getElementById("zoomInBtn").addEventListener('click', function(){
       if(zoomLevel >= MAX_ZOOM_LEVEL)
           return;
       var publisherDiv = document.getElementById(elSubscribersId);
       var videoElem = publisherDiv.querySelector('video');
       var rect = videoElem.getBoundingClientRect()
       videoElem.style.width = (rect.width*1.2)+'px';
       videoElem.style.height = (rect.height*1.2)+'px';
       
        var curTop = videoElem.style.top === '' ? '0px' : videoElem.style.top;
        var curLeft = videoElem.style.left === '' ? '0px' : videoElem.style.left;
        videoElem.style.top = (parseInt(curTop,10) - (rect.height*0.1))+'px';
        videoElem.style.left = (parseInt(curLeft,10) - (rect.width*0.1))+'px';
        zoomLevel++;
    });
    document.getElementById("zoomOutBtn").addEventListener('click', function(){
       var publisherDiv = document.getElementById(elSubscribersId);
       var videoElem = publisherDiv.querySelector('video');
       var rect = videoElem.getBoundingClientRect()
       var pubRect = publisherDiv.getBoundingClientRect();
       if(rect.width*0.84 < pubRect.width || rect.height*0.84 < pubRect.height){
            videoElem.style.width = pubRect.width+'px';
            videoElem.style.height = pubRect.height+'px';
            zoomLevel = 0;
       }
       else{
            videoElem.style.width = (rect.width*0.84)+'px';
            videoElem.style.height = (rect.height*0.84)+'px';
            rect = videoElem.getBoundingClientRect();
            var curTop = videoElem.style.top === '' ? '0px' : videoElem.style.top;
            var curLeft = videoElem.style.left === '' ? '0px' : videoElem.style.left;
            var newTop = (parseInt(curTop,10) + (rect.height*0.12));
            var newLeft = (parseInt(curLeft,10) + (rect.width*0.12));
            if(newTop>0) newTop=0;
            if(newLeft>0) newLeft=0;
            if(newTop < (pubRect.height-rect.height)) newTop = (pubRect.height-rect.height)
            if(newLeft < (pubRect.width-rect.width)) newLeft = (pubRect.width-rect.width);
           
            videoElem.style.top = newTop+'px';
            videoElem.style.left = newLeft+'px';
            zoomLevel--;
       }
    });
    document.getElementById("zoomResetBtn").addEventListener('click', function(){
       var publisherDiv = document.getElementById(elSubscribersId);
       var videoElem = publisherDiv.querySelector('video');
       var rect = videoElem.getBoundingClientRect()
       var pubRect = publisherDiv.getBoundingClientRect();
       
        videoElem.style.width = pubRect.width+'px';
        videoElem.style.height = pubRect.height+'px';
        videoElem.style.top = "0px";
        videoElem.style.left = "0px";
        zoomLevel = 0;
       
    });
    
    document.getElementById("pointerOn").addEventListener('click', function(){
        document.getElementById("pointerOn").style.display = 'none';
        document.getElementById("pointerOff").style.display = 'inline';
        document.getElementById("laser").style.visibility="hidden";
        laserOn = false;
        sendStopLaser();
        
    });
    document.getElementById("pointerOff").addEventListener('click', function(){
        document.getElementById("pointerOff").style.display = 'none';
        document.getElementById("pointerOn").style.display = 'inline';
        document.getElementById("laser").style.visibility="visible";
        laserOn = true;
        sendStartLaser();
    });

document.getElementById("start").addEventListener('click', function(){
    if(state === "stopped"){
        /*start session */
        startSession();
        state = "started";
        document.getElementById("start").style.display="none";
        document.getElementById("stop").style.display="inline";
    }
});

document.getElementById("stop").addEventListener('click', function(){
    if(state === "started"){
        /*start session */
        OTSession.disconnect();
        state = "stopped";
        document.getElementById("start").style.display="inline";
        document.getElementById("stop").style.display="none";
    }
});

document.getElementById("cyclecamera").addEventListener('click', function(){
    publisher.cycleVideo();
});

document.getElementById("mute").addEventListener('click', function(){
    publisher.publishAudio(false);
    document.getElementById("mute").style.display="none";
    document.getElementById("unmute").style.display="inline";
});

document.getElementById("unmute").addEventListener('click', function(){
    publisher.publishAudio(true);
    document.getElementById("mute").style.display="inline";
    document.getElementById("unmute").style.display="none";
});

async function fetchCredentials() {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');

  if(room === undefined || room === "" || room == null){
      const message = "room name missing";
      throw new Error(message);
  }
  const response = await fetch('/token?room='+room);
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const cred = await response.json();
  return cred;
}

function sendLaserLocation(width,height,x,y){
    OTSession.signal(
    {
        data:JSON.stringify({
            width: width,
            height:height,
            x:x,
            y:y
        }),
        type:"location"
    });
}

function sendStartLaser(){
    OTSession.signal(
    {
        data:"laser",
        type:"laserstart"
    });
}

function sendStopLaser(){
    OTSession.signal(
    {
        data:"laser",
        type:"laserstop"
    });
}

function handleError(err){
    if(err)
        console.log(err);
}

function startSession(){
    fetchCredentials().then(cred => {
        console.log(cred);
        OTSession = OT.initSession(cred.apikey, cred.sessionid);
        publisher = OT.initPublisher('agent', {
    		insertMode: 'append',
            width:'100%',
            height:'100%'
  		}, handleError);
        
        OTSession.connect(cred.token, function(error) {
		    if (error) {
      		    handleError(error);
            } else {
      		    OTSession.publish(publisher, handleError);
            }
  	     });
        
        OTSession.on('streamCreated', (event) => {
            document.getElementById("qr").style.display="none";
            subscriber = OTSession.subscribe(event.stream,"customer",{
                insertMode: "append",
                width: '100%',
    		    height: '100%'
              }, (error) => {
                if(error){
                  console.log("subscribe error");
                }
            });
        });
    }).catch(error => {
        console.log(error.message);
        alert(error.message); // 'An error has occurred: 404'
    });;
}