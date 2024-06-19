import express from 'express';
import morgan from 'morgan';
import passport from 'passport'
import cors from 'cors';
import fs from 'fs';
import { dbConnection } from './mongo.db'
import passportMiddleware from './passport.middleware'

import pkg from '../../package.json'
import config from '@config/load.config';

import { initCreateRolesAndUser } from '@helpers/core.helper'

class Server {

    constructor() {
        process.env.TZ = 'America/Mexico_City';
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
        this.loadAppModules(config.SERVER.PATH_DIR_MODULES);
        this.setRouteAPIinfo(config.SERVER.PATH_API);
    }

    listen() {
        let port = config.SERVER.PORT_LISTEN;
        this.app.listen(port, () => {
            console.log('Servidor corriendo en puerto', port);
        });
    }

    async conectarDB() {
        await dbConnection(config.DATABASE.CONNECT, config.DATABASE.DBDEFAULT);
        await initCreateRolesAndUser();
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
        fs.readdirSync(modulesFolder).forEach(function (file) {
            let route = modulesFolder + '/' + file;
            fs.stat(route, function (err, stat) {
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