import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import config from '@config/load.config';
import User from '@models/mongo/usuarios.model';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SERVER.SECRET
};

export default new Strategy(opts, async (payload, done) => {
    try {
        let userDoc = await User.findOne({ _id: payload.id, secret: payload.secret, activo: true }, { password: 0, secret: 0 });
        if (!userDoc) {
            return done(null, false);
        }
        let uss = userDoc.toObject();

        if (uss) {
            return done(null, uss);
        }
        return done(null, false);
    } catch (error) {
        console.log(error);
    }
});
