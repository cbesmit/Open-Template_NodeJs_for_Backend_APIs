import logs from '@models/mongo/logs.model';
const fs = require('fs');
const path = require('path');
import fetchServer from '@helpers/fetchServer.helper';

/*
log = {
    tipo: 'accion o evento o error o alerta',
    usuarioId: 'id del usuario o vacio',
    seccion: 'nombre de la seccion es obligatorio',
    seccionId: 'id de la seccion o vacio',
    subSeccion: 'nombre de la sub-seccion o vacio',
    subSeccionId: 'id de la sub-seccion o vacio',
    mensaje: 'mensaje es obligatorio si no es un string se convierte a string',
    path: 'path del archivo donde se genera el log'
}
*/

export const saveLog = async (log) => {
    if (log.tipo === 'error') {
        console.error('saveLog ', log);
    }
    log.mensaje = convertirAStringConFormatoJSON(log.mensaje);
    try {
        let logSave = new logs(log);
        saveFileLog(log);
        await logSave.save();
    } catch (error) {
        let logError = {
            tipo: 'error',
            seccion: 'logs.helper',
            mensaje: JSON.stringify(error),
            path: 'app/src/helpers/logs.helper.js'
        }
        try {
            let logSave = new logs(logError);
            saveFileLog(logError);
            await logSave.save();
        } catch (error) {
            console.error(error);
        }    
    }
}

function saveFileLog(log) {
    try {
        let date = new Date();
        let dateFormated = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        let timeFormated = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        let newLog = {
            date: dateFormated,
            time: timeFormated,
            ...log
        };
        let message = JSON.stringify(newLog);
        let logFormated = `${message}\n`;            
        let dir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            fs.chmodSync(dir, '0777');
        }
        let filePath = path.join(dir, `${dateFormated}.log`);
        fs.appendFile(filePath, logFormated, function (err) {
            if (err) throw err;
            fs.chmodSync(filePath, '0777');
        });            
    } catch (error) {
        console.error(error);
    }
}


function convertirAStringConFormatoJSON(valor) {
    if (valor instanceof Error) {
        const errorInfo = {
            name: valor.name,
            message: valor.message,
            stack: valor.stack
        };
        return JSON.stringify(errorInfo, null, 2);
    } else if (Array.isArray(valor)) {
        const arrayConvertido = valor.map(elemento => convertirAStringConFormatoJSON(elemento));
        return `[${arrayConvertido.join(', ')}]`;
    } else if (typeof valor === 'object' && valor !== null) {
        const objetoConvertido = Object.values(valor).map(elemento => convertirAStringConFormatoJSON(elemento));
        return `{${objetoConvertido.join(', ')}}`;
    } else if (typeof valor === 'string') {
        return `"${valor}"`;
    } else {
        return JSON.stringify(valor);
    }
}