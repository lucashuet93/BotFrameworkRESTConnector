//=========================================================
// IMPORTS
//=========================================================

import * as restify from 'restify';
import axios from 'axios';
import { Request, Response, Server } from 'restify'

//=========================================================
// REST CONNECTOR BOT
//=========================================================

export class RESTConnectorBot {

    appId: string;
    appPassword: string;
    accessToken: string;

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
                console.log(this.accessToken)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    listen = (req: Request, res: Response) => {
        console.log(req)
    }
}

//=========================================================
// SET UP BOT
//=========================================================

let ProofOfConceptAppId: string = '5d3dc081-7572-4783-a385-e1a6f0afd179'
let ProofOfConceptAppPassword: string = '0C5L7PkvFhDQz1VvxDJoPdT'
let RESTBot = new RESTConnectorBot(ProofOfConceptAppId, ProofOfConceptAppPassword);
RESTBot.initialize();

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