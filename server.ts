//=========================================================
// IMPORTS
//=========================================================

import * as restify from 'restify';
import axios from 'axios';
import { Request, Response, Server } from 'restify'

//=========================================================
// SETUP RESTIFY SERVER
//=========================================================

let port: any = process.env.PORT || process.env.port || 3978;
var server: Server = restify.createServer();
server.listen(port, () => {
    console.log(`Restify server running on ${server.url}`);
});

export class RESTConnectorBot {

    appId: string;
    appPassword: string;

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appId = appPassword;
    }
    
}