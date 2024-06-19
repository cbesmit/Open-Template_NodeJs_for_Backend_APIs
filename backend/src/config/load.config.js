const configServer = require('dotenv').config({ path: __dirname + '/' + process.env.NODE_ENV + '/.server.env' }).parsed;
const configDB = require('dotenv').config({ path: __dirname + '/' + process.env.NODE_ENV + '/.database.env' }).parsed;
const configEmail = require('dotenv').config({ path: __dirname + '/' + process.env.NODE_ENV + '/.email.env' }).parsed;
const configFiles = require('dotenv').config({ path: __dirname + '/' + process.env.NODE_ENV + '/.files.env' }).parsed;
const configSAP = require('dotenv').config({ path: __dirname + '/' + process.env.NODE_ENV + '/.sap.env' }).parsed;

var config = {
    SERVER: configServer,
    DATABASE: configDB,
    EMAIL: configEmail,
    FILES: configFiles,
    SAP: configSAP
}

let dirRoot = __dirname.replace(/\/config$/g, '');

for (var key in config) {
    for (var prop in config[key]) {
        if (prop !== 'PATH_API' && prop.startsWith("PATH") && typeof config[key][prop] === 'string') {
            config[key][prop] = dirRoot + (config[key][prop].startsWith('/') ? '' : '/') + config[key][prop] + (config[key][prop].endsWith('/') ? '' : '/');
        }
    }
}


export default config;
