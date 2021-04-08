import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import User from '../../../models/mongo/users.model';
import Role from '../../../models/mongo/roles.model';
import serverConfig from '../../../config/server.config';

export const login = async(req, res) => {
    const { username, password } = req.body;
    const userFound = await User.findOne({ username: username });

    if (!userFound) return res.status(400).json({ status: 'error', result: { msg: 'No se encontró el usuario' } });

    const matchPassword = await User.comparePassword(password, userFound.password);

    if (!matchPassword) return res.status(401).json({ status: 'error', result: { msg: 'Contraseña incorrecta' } });

    const token = jwt.sign({ id: userFound._id, secret: userFound.secret }, serverConfig.SECRET, {
        expiresIn: 86400 // 24 hours
    })
    res.status(200).json({ status: 'success', result: { token } });

}

export const signup = async(req, res) => {
    const { username, email, password } = req.body;

    const newUser = new User({
        username,
        email,
        password: await User.encryptPassword(password),
        secret: uuid()
    });

    const role = await Role.findOne({ name: 'visitante' });
    newUser.rol = [role._id];

    newUser.save(function(err, user) {
        if (err) return res.status(401).json({ status: 'error', result: err });

        const token = jwt.sign({ id: user._id, secret: user.secret }, serverConfig.SECRET, {
            expiresIn: 86400 // 24 hours
        })
        res.status(200).json({ status: 'success', result: { token } });
    });
}

export const logoutAll = async(req, res) => {
    const userFound = await User.findById(req.user._id);
    if (!userFound) return res.status(400).json({ status: 'error', result: { msg: 'No se encontró el usuario' } });
    userFound.secret = uuid();

    userFound.save(function(err, user) {
        if (err) return res.status(401).json({ status: 'error', result: err });
        res.status(200).json({ status: 'success', result: 'Tokens del usuario deshabilitados' });
    });
}