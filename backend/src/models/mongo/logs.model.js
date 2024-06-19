import { Schema, model, Types } from 'mongoose';
import handleSchemaError from './handleSchemaError.mongoose';
import config from '@config/load.config';

const logSchema = new Schema({
    tipo: {
        type: String,
        enum: ['accion', 'evento', 'error', 'alerta'],
        required: [true, 'El tipo es obligatorio y debe ser "accion", "evento", "error", "alerta"'],
    },
    usuarioId: {
        ref: 'usuarios',
        type: Schema.Types.ObjectId,
        validate: {
            validator: async function (value) {
                if(!value) return true;
                if (Types.ObjectId.isValid(value)) {
                    const count = await this.model('usuarios').countDocuments({ _id: value });
                    return count > 0;
                }
                return false;
            },
            message: 'El Usuario no es válido o no existe.',
        },
    },
    seccion: {
        type: String,
        trim: true,
        required: [true, 'La sección es obligatoria'],
    },
    seccionId: {
        type: Schema.Types.ObjectId,
        validate: {
            validator: async function (value) {
                if(!value) return true;
                return Types.ObjectId.isValid(value);
            },
            message: 'La sección no es válida o no existe.',
        },
    },
    subSeccion: {
        type: String,
        trim: true,
    },
    subSeccionId: {
        type: Schema.Types.ObjectId,
        validate: {
            validator: async function (value) {
                if(!value) return true;
                return Types.ObjectId.isValid(value);
            },
            message: 'La sub-sección no es válida o no existe.',
        },
    },
    mensaje: {
        type: String,
        trim: true,
        required: [true, 'El mensaje es obligatorio'],
    },
    path: {
        type: String,
        trim: true
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: 'logs'
});

logSchema.post('save', handleSchemaError);
logSchema.post('update', handleSchemaError);
logSchema.post('findOneAndUpdate', handleSchemaError);
logSchema.post('insertMany', handleSchemaError);

const log = model('logs', logSchema);

//-!-  Comm-cbs-doc : Modo dev, rehace los indices, se debe quitar para prd  [Besmit-23052022]
if(config.SERVER.MODE_DEBUG) log.syncIndexes();

export default log;
