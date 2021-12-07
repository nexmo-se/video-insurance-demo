let state = "stopped";
let OTSession = null;
let publisher = null;
let subscriber = null;

var laserOn = true;
var zoomLevel = 0;
var MAX_ZOOM_LEVEL = 5;
var ZOOM_INCREMENT_PX = 50;

var elPublisherId = "customer";

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

function handleError(err){
    if(err)
        console.log(err);
}

function startSession(){
    fetchCredentials().then(cred => {
        console.log(cred);
        OTSession = OT.initSession(cred.apikey, cred.sessionid);
        publisher = OT.initPublisher('customer', {
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
            subscriber = OTSession.subscribe(event.stream,"agent",{
                insertMode: "append",
                width: '100%',
    		    height: '100%'
              }, (error) => {
                if(error){
                  console.log("subscribe error");
                }
            });
        });
        OTSession.on('signal', (event) => {
            console.log(event.type);
            if(event.type === "signal:laserstart"){
                document.getElementById("customer-laser").style.visibility="visible";   
            }
            else if(event.type === "signal:laserstop"){
                document.getElementById("customer-laser").style.visibility="hidden";
            }
            else{
                var publisherElem = document.getElementById(elPublisherId);
                var pointerInfo = JSON.parse(event.data);
                //console.log(publisherElem.getBoundingClientRect().top +" "+pointerInfo.y+" "+publisherElem.getBoundingClientRect().height+" "+pointerInfo.height);
                //alert(document.documentElement.scrollTop);
                var y = document.documentElement.scrollTop + publisherElem.getBoundingClientRect().top + (pointerInfo.y*(publisherElem.getBoundingClientRect().height/pointerInfo.height));

                var x = publisherElem.getBoundingClientRect().left + (pointerInfo.x*(publisherElem.getBoundingClientRect().width/pointerInfo.width));

                /* map horizontal mirror image */
                var centerOverFlow = x - (publisherElem.getBoundingClientRect().left + (publisherElem.getBoundingClientRect().width/2));

                if(centerOverFlow < 0)
                    x = publisherElem.getBoundingClientRect().left + (publisherElem.getBoundingClientRect().width/2) + Math.abs(centerOverFlow);
                else
                    x = publisherElem.getBoundingClientRect().left + (publisherElem.getBoundingClientRect().width/2) - Math.abs(centerOverFlow);

                //console.log("x="+x+"; y="+y);
                document.getElementById("customer-laser").style.top = y+"px";
                document.getElementById("customer-laser").style.left = x+"px";
            }
        });
    }).catch(error => {
        console.log(error.message);
        alert(error.message); // 'An error has occurred: 404'
    });;
}