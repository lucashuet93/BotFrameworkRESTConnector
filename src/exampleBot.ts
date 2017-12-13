//=========================================================
// IMPORTS
//=========================================================

import * as restify from 'restify';
import { Request, Response, Server } from 'restify';
import { RESTConnectorBot, MessagingHandler } from './connector'

//=========================================================
// EXAMPLE BOT
//=========================================================

let ProofOfConceptAppId: string = 'bd5cba79-e44b-4f97-b480-ce6803d74caf'
let ProofOfConceptAppPassword: string = 'mkbIXCU37}drndCSD864(__'
let POCBot = new RESTConnectorBot(ProofOfConceptAppId, ProofOfConceptAppPassword);

let messageHandler : MessagingHandler = (userInput: string) => {
    let reply: string;
    if(userInput.includes("color")){
        reply = "My favorite color is blue. What's yours?"
    } else {
        reply = "I'm sorry, I don't understand."
    }
    return reply;
}


POCBot.initialize();
POCBot.run(messageHandler);

//=========================================================
// SET UP RESTIFY SERVER
//=========================================================

let port: any = process.env.PORT || process.env.port || 3978;
var server: Server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/api/messages', POCBot.listen)
server.listen(port, () => {
    console.log(`Restify server running on ${server.url}`);
});

//=========================================================
// STEPS TO RUN A REST CONNECTOR BOT
//=========================================================
/* 

1) Register a bot in the Bot Framework Portal and store the AppId and AppPassword
2) Create a new project and install PACKAGE_NAME and restify dependencies
2) Import RESTConnectorBot class
3) Create a RESTConnectorBot instance using the bot's AppId and AppPassword 
4) Create a restify server 
5) On post requests to the restify server's /api/messages endpoint, run the RESTConnectorBot.listen method 
6) Deploy the bot to an Azure App Service
7) Register the endpoint of that Azure App Service with the bot back in the Bot Framework Portal

You will then be able to communicate with your bot on any Bot Framework supported channel like Microsoft Teams, Skype, or Facebook Messenger
*/