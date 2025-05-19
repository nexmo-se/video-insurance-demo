# video-insurance-demo

Agent can zoom-in / zoom out and pan the customer video. He can also use a laser pointer to highlight something on customer's video.
Useful for insurance use cases where remote claims specialist can investigate the claim.

Agent uses desktop and customer uses mobile phone.

## Setup

1. Sign-up for Vonage API Dashboard Account to use Vonage Unified Video API.
3. Stand Alone: 
    * Create an Application in Vonage Dashbaord and activate Video.
    * Add your Application ID and RSA Key an ENV using API_APPLICATION_ID and PRIVATE_KEY
4. Cloud Runtime
    * Create a Cloud Runtime Starter and copy the files or use the Github repro
    * Active the Video function in the VCR Application
    * delete the package-lock.json and run in the terminal "npm install" to get all dependencies.
3. Join as agent at https://yourdomain/agent.html?room=room-name
4. Connect to the video call.
5. Customer can open the link https://yourdomain/customer.html?room=room-name
6. For demo purposed, customer can also scan a QR code on agent screen to join the room.

## Changes

1. It runs on Vonage Cloud Runtime
2. It uses the new Vonage Video API Unified Environment

## Instruction how to use:
* connect to video session by pressing the call button
* after successful connection you will see a QR code for customer
* Scan the QR on a phone and join as customer.
* Now agent can use zoom-in and zoom-out button to enlarge the customer video. use reset button to bring the video back to original size.
* use the "pointer" button to show a pointer on the customer video tile. customer will see the same pointer on his side too.
