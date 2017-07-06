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

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appId = appPassword;
    }
    listen = (req: Request, res: Response) => {
        console.log(req)
    }
}

//=========================================================
// SETUP RESTIFY SERVER
//=========================================================

let ProofOfConceptAppId: string = '5d3dc081-7572-4783-a385-e1a6f0afd179'
let ProofOfConceptAppPassword: string = '0C5L7PkvFhDQz1VvxDJoPdT'
let RESTBot = new RESTConnectorBot(ProofOfConceptAppId, ProofOfConceptAppPassword);

let port: any = process.env.PORT || process.env.port || 3978;
var server: Server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/api/messages', RESTBot.listen)
server.listen(port, () => {
    console.log(`Restify server running on ${server.url}`);
});