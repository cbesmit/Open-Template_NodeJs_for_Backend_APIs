import mailSend from '@helpers/email.helper';
import fs from 'fs';
import path from 'path';
import config from '@config/load.config';
import { saveLog } from '@helpers/logs.helper';
import Notificaciones from '@models/mongo/notificaciones.model';
import Usuarios from '@models/mongo/usuarios.model';

const baseHTML = fs.readFileSync(path.join(__dirname, '/emailTemplates/base.html'), 'utf-8').replace('{{BASE_URL_FRONT}}', config.SERVER.BASE_URL_FRONT);

const exectNotif = {
    //CBSComm   - Emvío de notificación de prueba
    //        const respNoti = await sendNotification('test', 'exec', {}, {_id: 'lord.besmit@gmail.com'}); 
    'test': {
        'exec': async (parametros, usuario) => {
            const titulo = 'Correo de prueba';
            let body = baseHTML;
            body = body.replace('{{TITULO}}', titulo);
            body = body.replace('{{BODY}}', 'Este es un correo de prueba');
            body = body.replace('{{FOOTER}}', '<a href="' + config.SERVER.BASE_URL_FRONT + '">Home</a>');
            const respEmail = await emailNotification(usuario, titulo, body);
            if (respEmail.error) console.log('error al enviar la notificacion: ', respEmail.msg);
            return { error: respEmail.error, msg: respEmail.msg };
        },
    },

    //CBSComm   - Modulo Login
    'loginPassword': {
        //CBSComm   - Envía la contraseña al usuario
        'send': async (parametros, usuario) => {
            if (!parametros.password) return { error: true, msg: 'No se ha enviado la nueva contraseña para el usuario' };
            if (!usuario._id) return { error: true, msg: 'No se ha enviado el usuario' };
            
            const titulo = 'Contraseña para el Sistema'; 

            let body = baseHTML;
            body = body.replace('{{TITULO}}', titulo);
            body = body.replace('{{BODY}}', 'Se ha reiniciado su contraseña para poder acceder al Sistema, su nueva contraseña es: ' + parametros.password);
            body = body.replace('{{FOOTER}}', '<a href="' + config.SERVER.BASE_URL_FRONT + '">Acceder</a>');

            return await sendNotificationAndEmail(titulo, body, usuario._id);
        },
    },

};

export const sendNotification = async (seccion, accion, parametros, usuario = {}) => {
    /*
        seccion: 'seccion o formulario',
        accion: 'el botón o acción que se ejecuto',
        parametros: 'los parametros que se enviaron, puede ser el id de la solicitud, el id del usuario, etc'
        usuario: 'el usuario que ejecuto la acción'
    */
    try {
        if (!usuario) throw { msg: 'No se ha enviado el usuario', params: parametros };
        if (!usuario._id) throw { msg: 'No se ha enviado el id del usuario', params: parametros };
        if (!seccion) throw { msg: 'No se ha enviado la seccion', params: parametros };
        if (!accion) throw { msg: 'No se ha enviado la accion', params: parametros };

        if (exectNotif[seccion] && exectNotif[seccion][accion]) {
            if (typeof exectNotif[seccion][accion] === 'function') {
                const result = await exectNotif[seccion][accion](parametros, usuario);
                if (result.error) throw { msg: result.msg, params: parametros };
                return result;
            } else {
                throw { msg: 'La accion: ' + accion + ' con la seccion: ' + seccion + ' no esta definida como una función', params: parametros };
            }
        } else {
            throw { msg: 'No existe la seccion: ' + seccion + ' o la accion: ' + accion, params: parametros };
        }
    } catch (error) {
        console.log('error: ', error);
        saveLog({
            tipo: 'error',
            seccion: 'Emviar notificacion',
            mensaje: error,
            path: 'src/helpers/notificacion.helper.js',
            usuarioId: usuario._id
        });
        return { error: true, msg: error };
    }
}

async function sendNotificationAndEmail(titulo, body, usuarioId, pathAdjunto = null) {
    const UsuariosFound = await Usuarios.findOne({ _id: usuarioId });
    if (!UsuariosFound) return { error: true, msg: 'No se encontro el usuario' };
    const emailTo = UsuariosFound.correo;

    const respNotif = await saveNotification(titulo, body, usuarioId);
    const respEmail = await emailNotification(emailTo, titulo, body, pathAdjunto);

    let msgresp = '';
    if (respNotif.error) msgresp = respNotif.msg;
    if (respEmail.error) msgresp = msgresp + respEmail.msg;
    if (!respEmail.error && !respNotif.error) msgresp = 'Se ha guardado y se ha enviado un correo con la notificación';
    return { error: respNotif.error || respEmail.error, msg: msgresp };
}

async function saveNotification(titulo, body, usuarioId) {
    try {
        let notificacion = new Notificaciones(
            {
                titulo: titulo,
                body: body,
                usuarioId: usuarioId
            }
        );
        await notificacion.save();
        return { error: false, msg: 'Se ha guardado la notificación' };
    } catch (error) {
        console.log('error: ', error);
        saveLog({
            tipo: 'error',
            seccion: 'Guardar notificacion',
            mensaje: error,
            path: 'src/helpers/notificacion.helper.js',
        });
        return { error: true, msg: error };
    }
}

async function emailNotification(emailTo, subject, msg, pathAdjunto = null) {
    try {
        if (config.EMAIL.ONLY_DEBUG) {
            emailTo = config.EMAIL.EMAIL_DEBUG;
        }








        //CBSToDo   #TODO: Borrar lo siguiente que solo es para pruebas cuando no saca correos
        console.log('---------------------------------------------');
        console.log('emailTo',emailTo);
        console.log('subject',subject);
        console.log('msg',msg);
        console.log('---------------------------------------------');







        const mailer = new mailSend();
        const result = await new Promise((resolve, reject) => {
            mailer.send(
                config.EMAIL.DEFAULT_FROM,
                emailTo,
                subject,
                msg,
                (err, info) => {
                    if (err) {
                        resolve({ error: true, msg: err });
                    } else {
                        resolve({ error: false, msg: 'Se ha enviado un correo con la notificación' });
                    }
                }
            );
        });
        return result;
    } catch (error) {
        console.log('error: ', error);
        saveLog({
            tipo: 'error',
            seccion: 'Envio de correo de notificacion',
            mensaje: error,
            path: 'src/helpers/notificacion.helper.js',
        });
        return { error: true, msg: error };
    }
}