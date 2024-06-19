import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import User from '@models/mongo/usuarios.model';
import config from '@config/load.config';
import { validationResult } from 'express-validator';
import { saveLog } from '@helpers/logs.helper';

export const login = async (req, res) => {
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) throw { status: 400, msg: { params: errors.array() } };
        const { usuario, password } = req.body;

        const userFound = await User.findOne({
            $or: [
                { usuario: { $regex: new RegExp('^' + usuario + '$', 'i') } },
                { correo: { $regex: new RegExp('^' + usuario + '$', 'i') } }
            ]
        });

        if (!userFound) throw { status: 401, msg: 'No se encontró el usuario ' + usuario };
        if (!userFound.activo) throw { status: 401, msg: 'El usuario ' + usuario + ' no esta activo' };

        const matchPassword = await User.comparePassword(password, userFound.password);
        if (!matchPassword) throw { status: 401, msg: 'No se pudo acceder con el usuario ' + usuario };

        const token = jwt.sign({ id: userFound._id, secret: userFound.secret }, config.SERVER.SECRET, {
            expiresIn: 86400 // 24 hours
        })

        let data = {
            'token': token,
            'correo': userFound.correo,
            'nombre': userFound.nombre,
        }

        saveLog({
            tipo: 'evento',
            usuarioId: userFound._id,
            seccion: 'login',
            mensaje: 'Login correcto por parte de ' + userFound.usuario + ' con correo ' + userFound.correo + '',
            path: 'app/src/modules/login/controllers/login.controller.js'
        });

        res.status(200).json({
            status: 200,
            error: false,
            msg: 'Login correcto',
            data: data
        });
    } catch (error) {
        saveLog({
            tipo: 'error',
            seccion: 'login',
            mensaje: { status: error.status, error: true, msg: error.msg },
            path: 'app/src/modules/login/controllers/login.controller.js'
        });
        return res.status(400).json({ status: error.status, error: true, msg: error.msg });
    }
}

export const logoutAll = async (req, res) => {
    try {
        const userFound = await User.findById(req.user._id);
        if (!userFound) throw { status: 401, msg: 'No se encontró el usuario' };
        userFound.secret = uuid();

        saveLog({
            tipo: 'evento',
            usuarioId: userFound._id,
            seccion: 'login',
            mensaje: 'Logout de todas las sesiones por parte de ' + userFound.usuario + ' con correo ' + userFound.correo + '',
            path: 'app/src/modules/login/controllers/login.controller.js'
        });

        userFound.save(function (err, user) {
            if (err) return res.status(401).json({ status: 401, error: true, msg: err });
            res.status(200).json({
                status: 200,
                error: false,
                msg: 'Tokens del usuario deshabilitados',
                data: []
            });
        });
    } catch (error) {
        saveLog({
            tipo: 'error',
            seccion: 'login',
            mensaje: { status: error.status, error: true, msg: error.msg },
            path: 'app/src/modules/login/controllers/login.controller.js'
        });
        return res.status(400).json({ status: error.status, error: true, msg: error.msg });
    }
}