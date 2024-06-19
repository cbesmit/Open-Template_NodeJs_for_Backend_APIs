const nodemailer = require('nodemailer');
import config from '@config/load.config';

export default class mailSend {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.EMAIL.HOST,
            port: config.EMAIL.PORT,
            auth: {
                user: config.EMAIL.AUTH_USER,
                pass: config.EMAIL.AUTH_PASS
            }
        })
    }

    send(from = '', to = '', subject = '', msg = '', callback= null) {
        if(callback === null) return 'La función de callback es obligatoria';
        if(!from || !to || !subject || !msg) return callback('Faltan datos para enviar el correo');
        this.transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: msg
        }, callback);
    }
}