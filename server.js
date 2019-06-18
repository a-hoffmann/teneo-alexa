/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const bodyParser = require('body-parser')
const TIE = require('@artificialsolutions/tie-api-client');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({
   extended: true
}))
app.use(bodyParser.json())

const config = {
   teneoURL: process.env.TENEO_ENGINE_URL
};

//Create Teneo API interface
const teneoApi = TIE.init(config.teneoURL);


// initialise session handler, to store mapping between WeChat and engine session id
const sessionHandler = SessionHandler();
/***
 * SESSION HANDLER
 ***/
function SessionHandler() {

   // Map Alexa's Sid id to the teneo engine session id. 
   // This code keeps the map in memory, which is ok for testing purposes
   // For production usage it is advised to make use of more resilient storage mechanisms like redis
   const sessionMap = new Map();

   return {
      getSession: (userId) => {
         if (sessionMap.size > 0) {
            return sessionMap.get(userId);
         } else {
            return "";
         }
      },
      setSession: (userId, sessionId) => {
         sessionMap.set(userId, sessionId)
      }
   };
}


// register a webhook handler with the connector
app.post('/', async function(req, res) {

      if (req.body.request.type == "SessionEndedRequest") {
         sessionHandler.setSession(req.body.session.sessionId, "")
         res.send({
            version: '1.0',
            response: {
               shouldEndSession: true
                  /*,
                          outputSpeech: {
                            type: 'SSML',
                            text: teneoResponseText,
                            ssml: '<speak>' + teneoResponseText + '</speak>'
                           }*/
            }
         });
      }

      var teneoResponseText = ""
      if (req.body.request.type == "LaunchRequest") {
         teneoResponseText = await handleAlexaMessage("hello", "") //greeting

         res.send({
            version: '1.0',
            response: {
               shouldEndSession: false,
               outputSpeech: {
                  type: 'SSML',
                  text: teneoResponseText,
                  ssml: '<speak>' + teneoResponseText + '</speak>'
               }
            }
         })
      }

      if (req.body.request.type == "IntentRequest") {
         const intentName = req.body.request.intent.name
         const alexaSessionID = req.body.session.sessionId

         if (intentName == "teneointent") {
            const userInput = req.body.request.intent.slots.RawInput.value
            teneoResponseText = await handleAlexaMessage(userInput, alexaSessionID)

            console.log(`Teneo response:\n ${teneoResponseText}`)

            res.send({
               version: '1.0',
               response: {
                  shouldEndSession: false,
                  outputSpeech: {
                     type: 'SSML',
                     text: teneoResponseText,
                     ssml: '<speak>' + teneoResponseText + '</speak>'
                  }
               }
            })
         }

         if ((intentName == "AMAZON.CancelIntent") || (intentName == "Amazon.StopIntent")) {
            teneoResponseText = await handleAlexaMessage("bye", alexaSessionID)
            res.send({
               version: '1.0',
               response: {
                  shouldEndSession: true,
                  outputSpeech: {
                     type: 'SSML',
                     text: teneoResponseText,
                     ssml: '<speak>' + teneoResponseText + '</speak>'
                  }
               }
            })
            sessionHandler.setSession(req.body.session.sessionId, "")
         }
      }
   }
);


async function handleAlexaMessage(alexaMessage, userID) {

   // check if there's an engine sessionid for this caller
   const teneoSessionId = sessionHandler.getSession(userID);

   // send input to engine using stored sessionid and retreive response
   const teneoResponse = await teneoApi.sendInput(teneoSessionId, {
      'text': alexaMessage
   });
   
   teneoTextReply = teneoResponse.output.text
   console.log(`teneoResponse: ${teneoTextReply}`)

   // store engine sessionid for this caller
   sessionHandler.setSession(userID, teneoResponse.sessionId);

   return teneoTextReply
}

app.listen(8080, () => console.log(`Teneo-Alexa connector listening on port 8080!, ENDPOINT: ${config.teneoURL}`));