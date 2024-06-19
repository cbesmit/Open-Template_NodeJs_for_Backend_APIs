import { Schema, model, Types } from 'mongoose';
import handleSchemaError from './handleSchemaError.mongoose';
import config from '@config/load.config';

const notificacionesSchema = new Schema({
    titulo: {
        type: String,
        trim: true,
        required: [true, 'El título es obligatorio'],
    },
    subTitulo: {
        type: String,
        trim: true
    },
    body: {
        type: String,
        trim: true,
        required: [true, 'El mensaje es obligatorio'],
    },
    visto: {
        type: Boolean,
        default: false,
    },
    usuarioId: {
        required: [true, 'El usuario es obligatorio'],
        ref: 'usuarios',
        type: Schema.Types.ObjectId,
        validate: {
            validator: async function (value) {
                if (!Types.ObjectId.isValid(value)) {
                    return false;
                }
                const count = await this.model('usuarios').countDocuments({ _id: value });
                return count > 0;
            },
            message: 'El usuario no es válido o no existe.',
        },
    },


}, {
    timestamps: true,
    versionKey: false,
    collection: 'notificaciones'
});

notificacionesSchema.post('save', handleSchemaError);
notificacionesSchema.post('update', handleSchemaError);
notificacionesSchema.post('findOneAndUpdate', handleSchemaError);
notificacionesSchema.post('insertMany', handleSchemaError);

const notificaciones = model('notificaciones', notificacionesSchema);

//-!-  Comm-cbs-doc : Modo dev, rehace los indices, se debe quitar para prd  [Besmit-23052022]
if(config.SERVER.MODE_DEBUG) notificaciones.syncIndexes();

export default notificaciones;
