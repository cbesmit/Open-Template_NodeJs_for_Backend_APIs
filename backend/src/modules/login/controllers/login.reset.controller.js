import config from '@config/load.config';
import mailSend from '@helpers/email.helper'
import { v4 as uuid } from 'uuid';
import { validationResult } from 'express-validator';

import User from '@models/mongo/usuarios.model';

export const reset = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 400, error: true, msg: {params: errors.array()} });
    const { usuario } = req.body;
    const userFound = await User.findOne({
        $or: [
            { usuario: usuario },
            { correo: usuario }
        ]
    });
    if (!userFound) return res.status(400).json({ status: 400, error: true, msg: 'No se encontró el usuario' });
    if (!userFound.activo) return res.status(400).json({ status: 400, error: true, msg: 'El usuario no esta activo' });

    userFound.resetPass = Math.floor(100000000 + Math.random() * 900000000);
    let resetPassExpire = new Date();
    resetPassExpire.setMinutes(resetPassExpire.getMinutes() + 15);
    userFound.resetPassExpire = resetPassExpire;

    userFound.save(function (err, user) {
        if (err) return res.status(400).json({ status: 400, error: true, msg: err });
        const mailer = new mailSend();
        mailer.send(config.EMAIL.DEFAULT_FROM, userFound.correo, 'Recuperación de contraseña',
            '<h1>Recuperación de contraseña</h1>' +
            '<p>Hola, <b>' + userFound.nombre + '</b></p>' +
            '<p>Se hizo una solicitud para recuperar tu contraseña, en la aplicación coloca el siguiente código:</p>' +
            '<p>' + userFound.resetPass + ',</p>' +
            '<p>Tienes 30 minutos hasta que el código expire,</p>' +
            '<p>Saludos,</p>',
            (err, info) => {
                if (err) return res.status(400).json({ status: 400, error: true, msg: 'No se pudo enviar el correo: ' + err });
                return res.status(200).json({
                    status: 200,
                    error: false,
                    msg: 'Se ha enviado un correo con el código de verificación',
                    data: []
                });
            }
        );
    });

}

export const resetValid = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 400, error: true, msg: {params: errors.array()} });
    const { usuario, pin } = req.body;
    const userFound = await User.findOne({
        $or: [
            { usuario: usuario },
            { correo: usuario }
        ],
        resetPass: pin,
        resetPassExpire: {
            $gte: new Date(),
        }
    });
    if (!userFound) return res.status(400).json({ status: 400, error: true, msg: 'No se encontró el usuario o ya expiró el código de verificación' });
    if (!userFound.activo) return res.status(400).json({ status: 400, error: true, msg: 'El usuario no esta activo' });

    res.status(200).json({
        status: 200,
        error: false,
        msg: 'El PIN es correcto',
        data: []
    });
}

export const resetValidChange = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 400, error: true, msg: {params: errors.array()} });
    const { usuario, pin, password } = req.body;
    const userFound = await User.findOne({
        $or: [
            { usuario: usuario },
            { correo: usuario }
        ],
        resetPass: pin,
        resetPassExpire: {
            $gte: new Date(),
        }
    });

    if (!userFound) return res.status(401).json({ status: 401, error: true, msg: 'No se encontró el usuario o ya expiró el código de verificación' });
    if (!userFound.activo) return res.status(401).json({ status: 401, error: true, msg: 'El usuario no esta activo' });

    userFound.password = await User.encryptPassword(password);
    userFound.secret = uuid();

    userFound.resetPass = Math.floor(100000000 + Math.random() * 900000000);
    let resetPassExpire = new Date();
    resetPassExpire.setMinutes(resetPassExpire.getMinutes() - 30);
    userFound.resetPassExpire = resetPassExpire;

    userFound.save(function (err, user) {
        if (err) return res.status(401).json({ status: 401, error: true, msg: err });
        return res.status(200).json({
            status: 200,
            error: false,
            msg: 'Se ha actualizado la contraseña correctamente',
            data: []
        });
    });
}
