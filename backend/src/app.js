require('dotenv').config();
import 'module-alias/register'
import Server from './app/server';

const server = new Server();
server.listen();