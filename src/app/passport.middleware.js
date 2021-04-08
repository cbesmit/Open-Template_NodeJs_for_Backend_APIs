import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import serverConfig from '../config/server.config';
import User from '../models/mongo/users.model';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: serverConfig.SECRET
};

export default new Strategy(opts, async(payload, done) => {
    try {
        const user = await User.findOne({ _id: payload.id, secret: payload.secret }, { password: 0, secret: 0 }).populate('rol');
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        console.log(error);
    }
});