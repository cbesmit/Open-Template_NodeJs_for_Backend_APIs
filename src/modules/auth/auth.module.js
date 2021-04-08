import authRouter from './auth.router';
import serverConfig from '../../config/server.config';

module.exports = function(app) {
    app.use(serverConfig.API + '/auth', authRouter);
}