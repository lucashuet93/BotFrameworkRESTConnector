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
    messagingHandler: MessagingHandler;

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appPassword = appPassword;
    }

    initialize = () => {
        //sets the access token so the class can send and receive Activities from the connector
        const tokenUrl = `https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token`;
        const tokenBody = `grant_type=client_credentials&client_id=${this.appId}&client_secret=${this.appPassword}&scope=https://api.botframework.com/.default`
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
                console.log(err.response.data)
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

