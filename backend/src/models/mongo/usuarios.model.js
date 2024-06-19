import { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import handleSchemaError from './handleSchemaError.mongoose';
import config from '@config/load.config';

const usuarioSchema = new Schema({
    usuario: {
        type: String,
        required: [true, 'El usuario es obligatorio'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'La contraseña es obligatoria']
    },
    nombre: {
        type: String,
        trim: true,
        required: [true, 'El nombre es obligatorio'],
    },
    correo: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, 'Es obligatorio el correo'],
    },
    clienteSAP: {
        type: String,
        trim: true,
    },


    secret: {
        type: String,
        required: [true, 'El Secret es obligatoria'],
        unique: true,
        trim: true
    },
    resetPass: {
        type: Number,
        trim: true
    },
    resetPassExpire: {
        type: Date
    },
    admin: {
        type: Boolean,
        default: false,
    },
    activo: {
        type: Boolean,
        default: true,
    },

}, {
    timestamps: true,
    versionKey: false,
    collection: 'usuarios'
});

usuarioSchema.statics.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

usuarioSchema.statics.comparePassword = async (password, recivedPassword) => {
    return await bcrypt.compare(password, recivedPassword);
};

usuarioSchema.post('save', handleSchemaError);
usuarioSchema.post('update', handleSchemaError);
usuarioSchema.post('findOneAndUpdate', handleSchemaError);
usuarioSchema.post('insertMany', handleSchemaError);

const usuarios = model('usuarios', usuarioSchema);

//-!-  Comm-cbs-doc : Modo dev, rehace los indices, se debe quitar para prd  [Besmit-23052022]
if (config.SERVER.MODE_DEBUG) usuarios.syncIndexes();

export default usuarios;
//export default model('usuarios', usuarioSchema);