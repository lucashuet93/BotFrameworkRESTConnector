//=========================================================
// IMPORTS
//=========================================================

import * as restify from 'restify';
import axios from 'axios';
import { Request, Response, Server } from 'restify'

//=========================================================
// INTERFACES
//=========================================================

export interface Activity {
    type: string,
    id: string,
    timestamp: string,
    serviceUrl: string,
    channelId: string,
    from: { id: string },
    conversation: { id: string },
    recipient: {
        id: string,
        name: string
    },
}

export interface Message extends Activity {
    text: string,
    locale: string,
    textFormat: string,
    from: {
        id: string,
        name: string
    }
}

export interface TextReply {
    type: "message",
    from: {
        id: string,
        name: string
    },
    conversation: {
        id: string,
        name: string
    },
    recipient: {
        id: string,
        name: string
    },
    text: string,
    replyToId: string
}

export interface MemberEntersConversation extends Activity {
    membersAdded: {
        id: string,
        name: string
    }[]
}

export interface MessagingHandler {
    (userInput: string) : string
}

//=========================================================
// REST CONNECTOR BOT
//=========================================================

export class RESTConnectorBot {

    appId: string;
    appPassword: string;
    accessToken: string;
    messagingHandler: MessagingHandler

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appId = appPassword;
    }

    initialize = () => {
        //sets the access token so the class can send and receive Activities from the connector
        const tokenUrl = `https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token`;
        const tokenBody = `grant_type=client_credentials&client_id=${ProofOfConceptAppId}&client_secret=${ProofOfConceptAppPassword}&scope=https://api.botframework.com/.default`
        const tokenConfig = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "login.microsoftonline.com"
            },
        };
        axios.post(tokenUrl, tokenBody, tokenConfig)
            .then((res) => {
                this.accessToken = res.data.access_token;
            })
            .catch((err) => {
                console.log(err)
            })
    }

    run(handler: MessagingHandler){
        this.messagingHandler = handler;
    }

    listen = (req: Request, res: Response) => {
        // TYPES OF ACTIVITES
        // 1. conversationUpdate (get a membersAdded property here)
        // 2. message

        if (req.body.type) {
            switch (req.body.type) {
                case 'conversationUpdate':
                    this.replyToConversationUpdate(req.body);
                    break;
                case 'message':
                    this.replyToMessage(req.body);
                    break;
                default:
                    console.log('not an activity');
                    break;

            }
        } else {
            console.log('not an activity')
        }
    }

    replyToConversationUpdate = (activity: MemberEntersConversation) => {
        //method takes in the activity, parses out relevant fields and sends them into this.appRules.event
        //this.appRules.event will return some text that is sent back to the user 

        let replyURL = activity.serviceUrl.concat(`/v3/conversations/${activity.conversation.id}/activities/${activity.id}`)
        let reply: {} = {
            type: "message",
            from: {
                id: activity.recipient.id,
                name: activity.recipient.name
            },
            conversation: {
                id: activity.conversation.id,
                name: activity.conversation.id
            },
            recipient: {
                id: activity.from.id,
                name: activity.from.id
            },
            text: `${activity.membersAdded[0].name} has entered the conversation`,
            replyToId: activity.id
        }
        const authorizedConfig = {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
        };
        axios.post(replyURL, reply, authorizedConfig)
            .then((res) => {
                // console.log(res)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    replyToMessage = (activity: Message) => {
        //method takes in the activity, parses out relevant fields and sends them into this.appRules.message
        //this.appRules.message will return some text that is sent back to the user 

        let replyURL = activity.serviceUrl.concat(`/v3/conversations/${activity.conversation.id}/activities/${activity.id}`)
        
        let replyMessage = this.messagingHandler(activity.text);

        let reply: {} = {
            type: "message",
            from: {
                id: activity.recipient.id,
                name: activity.recipient.name
            },
            conversation: {
                id: activity.conversation.id,
                name: activity.conversation.id
            },
            recipient: {
                id: activity.from.id,
                name: activity.from.name
            },
            text: replyMessage,
            replyToId: activity.id
        }
        const authorizedConfig = {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
        };
        axios.post(replyURL, reply, authorizedConfig)
            .then((res) => {
                // console.log(res)
            })
            .catch((err) => {
                console.log(err)
            })
    }
}

//=========================================================
// SET UP BOT
//=========================================================

let ProofOfConceptAppId: string = '5d3dc081-7572-4783-a385-e1a6f0afd179'
let ProofOfConceptAppPassword: string = '0C5L7PkvFhDQz1VvxDJoPdT'
let RESTBot = new RESTConnectorBot(ProofOfConceptAppId, ProofOfConceptAppPassword);

let messageHandler : MessagingHandler = (userInput: string) => {
    let reply: string;
    if(userInput.includes("color")){
        reply = "My favorite color is blue. What's yours?"
    } else {
        reply = "I'm sorry, I don't understand."
    }
    return reply;
}


RESTBot.initialize();
RESTBot.run(messageHandler);

//=========================================================
// SET UP RESTIFY SERVER
//=========================================================

let port: any = process.env.PORT || process.env.port || 3978;
var server: Server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/api/messages', RESTBot.listen)
server.listen(port, () => {
    console.log(`Restify server running on ${server.url}`);
});

//=========================================================
// STEPS TO RUN A REST CONNECTOR BOT
//=========================================================
/* 

1) Register a bot in the Bot Framework Portal and store the AppId and AppPassword
2) Create a new project and install prague-botframework-connector and restify dependencies
2) Import RESTConnectorBot class
3) Create a RESTConnectorBot instance using the bot's AppId and AppPassword 
4) Create a restify server 
5) On post requests to the restify server's /api/messages endpoint, run the RESTConnectorBot.listen method 
6) Deploy the bot to an Azure App Service
7) Register the endpoint of that Azure App Service with the bot back in the Bot Framework Portal

*/