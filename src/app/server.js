import express from 'express';
import morgan from 'morgan';
import passport from 'passport'
import cors from 'cors';
import fs from 'fs';
import { dbConnection } from './mongo.db'
import passportMiddleware from './passport.middleware'

import pkg from '../../package.json'
import serverConfig from '../config/server.config';
import dbConfig from '../config/database.config'

import { initCreateRoles } from '../helpers/core.helper'

class Server {

    constructor() {
        this.app = express();
        this.app.set('pkg', pkg);
        this.app.use(morgan('dev'));

        //-------------
        this.app.use(cors());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
        this.app.use(passport.initialize());
        passport.use(passportMiddleware);
        //-------------

        this.conectarDB();
        this.loadAppModules(serverConfig.DIR_MODULES);
        this.setRouteAPIinfo(serverConfig.API + '/');
    }

    listen() {
        let port = (process.env.PORT) ? process.env.PORT : serverConfig.PORT_LISTEN;
        this.app.listen(port, () => {
            console.log('Servidor corriendo en puerto', serverConfig.PORT_LISTEN);
        });
    }

    async conectarDB() {
        await dbConnection(dbConfig.CONNECT);
        await initCreateRoles();
    }

    setRouteAPIinfo(url) {
        this.app.get(url, (req, res) => {
            res.json({
                name: this.app.get('pkg').name,
                author: this.app.get('pkg').author,
                description: this.app.get('pkg').description,
                version: this.app.get('pkg').version
            });
        });

    }

    loadAppModules(modulesFolder) {
        let othat = this;
        fs.readdirSync(modulesFolder).forEach(function(file) {
            let route = modulesFolder + '/' + file;
            fs.stat(route, function(err, stat) {
                if (stat.isDirectory()) {
                    othat.loadAppModules(route);
                } else {
                    if (route.endsWith('.module.js')) require(route)(othat.app);
                }
            });
        });
    }

}

module.exports = Server;