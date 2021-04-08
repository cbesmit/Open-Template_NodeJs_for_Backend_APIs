require('dotenv').config();
import Server from './app/server';

const server = new Server();
server.listen();