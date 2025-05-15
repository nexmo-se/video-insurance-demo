import { Auth }  from "@vonage/auth"
import { Vonage } from "@vonage/server-sdk";
import { MediaMode } from "@vonage/video";
import { vcr } from "@vonage/vcr-sdk";
import express from 'express';

const app = express();
const port = process.env.VCR_PORT || 3000;

const VONAGE_APPLICATION_ID = process.env.API_APPLICATION_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY

const credentials = new Auth({
  applicationId: VONAGE_APPLICATION_ID,
  privateKey: PRIVATE_KEY,
});

const vonage = new Vonage(credentials);

var sessions = {};


let sessionid = null; 

const createSession = async () => {
  try {
    const session = await vonage.video.createSession({ mediaMode: MediaMode.ROUTED });
    sessionid = session.sessionId;
    console.log("Session created:", sessionid);
    return sessionid; 
  } catch (error) {
    console.error("Error on creating the session::", error);
  }
};

app.use(express.static("public"));

app.get("/token", async (request, response) => {
  var uid = request.query.room;

  if (uid == undefined) {
    console.log("sending default session");
    var token = vonage.video.generateClientToken(sessionid);
    response.json({ "apikey": VONAGE_APPLICATION_ID, "sessionid": sessionId, "token": token });
  } else {
    if (sessions.hasOwnProperty(uid)) {
      console.log("session exists for " + uid);
      let sessionId = sessions[uid];
      console.log("Reuse sessionId:", sessionId);
      /* Session already exists, generate a token */
      const options = {
        role: "publisher",
      }
      var token = vonage.video.generateClientToken(sessionId, options);
      response.json({ "apikey": VONAGE_APPLICATION_ID, "sessionid": sessionId, "token": token });
    } else {
      console.log("creating new session for " + uid);
      try {
        /* Session doesn't exist, generate a new session and token */
        let sessionId = await createSession();
        console.log("Received sessionId:", sessionId);
        sessions[uid] = sessionId;
        const options = {
          role: "publisher",
        }
        var token = vonage.video.generateClientToken(sessionId, options);
        response.json({ "apikey": VONAGE_APPLICATION_ID, "sessionid": sessionId, "token": token });
      } catch (error) {
        console.error("Error on creating the session:", error);
        response.status(500).json({ error: "Error on creating the session" });
      }
    }
  }
});

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});
