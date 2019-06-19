# tie-api-example-alexa
This node.js example connector makes a Teneo bot available on Alexa as a Skill. The connector acts as middleware between Alexa and Teneo. This guide will take you through the steps of deploying the connector to respond to events sent by Teneo. 

## Prerequisites

### Amazon Developer account
Create an Amazon Developer Account [here](https://developer.amazon.com/alexa)

### Teneo Engine
Your bot needs to be published and you need to know the engine URL.

## Setup instructions
### Setup an Alexa Skill
1. Go to the [Developer Console](https://developer.amazon.com/alexa/console/ask), and click `Create Skill`. Select a "Custom" Skill type, give it a name, and click Create Skill. Next, select a `Start from scratch` template.

2. From the left pane menu, open the `JSON Editor` section, paste the JSON below. This JSON represents the Interaction Model of this Alexa skill, and defines:
   * The invocation name of our Bot, a phrase that redirects the conversation away from Alexa, to your Teneo bot.
   * The phrases that trigger the StopIntent, which dismisses your bot, and steers the conversation back to Alexa
   * The fashion in which the user input is captured, to be later relayed to your Teneo bot.
```
{
    "interactionModel": {
        "languageModel": {
            "invocationName": "studio bot",
            "intents": [
                {
                    "name": "AMAZON.FallbackIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": [
                        "close studio bot",
                        "dismiss studio bot",
                        "shut down studio bot",
                        "goodbye studio bot",
                        "bye studio bot"
                    ]
                },
                {
                    "name": "teneointent",
                    "slots": [
                        {
                            "name": "RawInput",
                            "type": "LIST_OF_COMMANDS"
                        }
                    ],
                    "samples": [
                        "{RawInput}"
                    ]
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                }
            ],
            "types": [
                {
                    "name": "LIST_OF_COMMANDS",
                    "values": [
                        {
                            "name": {
                                "value": "Hello"
                            }
                        },
                        {
                            "name": {
                                "value": "What is your name"
                            }
                        },
                        {
                            "name": {
                                "value": "Where are you"
                            }
                        }
                    ]
                }
            ]
        }
    }
}

```
   At this point, some of the parts of this JSON model are only really required to avoid errors and warnings from the Alexa console. 
3. Click Save Model, and then Create Model to build and activate the Alexa-User Interaction model.

### Running the connector locally
Before continuing setting up things on Alexa's Developer Console side, get the connector code running locally:

1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/tie-api-example-alexa.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Create a `.env` file in the folder where you stored the source, and add values for TENEO_ENGINE_URL and HTTP_API_TOKEN:
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    ```
4. Start the connector in Console:
    ```
    node server.js
    ```

### Start chatting with the bot.
1. Go back to the [Developer Console](https://developer.amazon.com/alexa/console/ask), and click `Endpoint` from the left side menu.
2. Select a HTTPS service endpoint type, and paste the public URL from ngrok obtained in the previous step. in the `Select SSL certificate type`, select `My developement endpoint is a sub-domain ... that has a wildcard certificate from a certificate authority`. Click on Save endpoints.
3. In the top menu, click Test to begin chatting to the bot. At first, the conversation takes place with Alexa, to begin talking with the actual Teneo bot Skill, trigger the IntentRequest in the code by telling Alexa a phrase such as "Alexa, launch studio bot" on the chat window. Your Teneo bot should then greet, and take over the conversation. 
4. To end a conversation with your Teneo bot, and go back to talking to Alexa, type a phrase from the StopIntent key of the Interaction Model JSON, such as "Goodbye studio bot".
Important: "Studio bot" was the default name specified in the Interaction Model's JSON, you can choose any other name and then re-save, and re-build the model to apply the change.

That's it! Your bot is ready to deploy on Alexa.
