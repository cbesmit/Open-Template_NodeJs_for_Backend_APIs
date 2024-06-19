import loginRouter from './login.router';
import config from '@config/load.config';

module.exports = function(app) {
    app.use(config.SERVER.PATH_API + '/auth', loginRouter);
}