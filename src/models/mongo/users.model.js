import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new Schema({
    username: {
        type: String,
        required: [true, 'El usuario es obligatorio'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'La contraseña es obligatoria']
    },
    secret: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        unique: true,
        trim: true
    },
    rol: {
        ref: 'Role',
        type: Schema.Types.ObjectId
    }
}, {
    timestamps: true,
    versionKey: false
});

usuarioSchema.statics.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

usuarioSchema.statics.comparePassword = async(password, recivedPassword) => {
    return await bcrypt.compare(password, recivedPassword);
};

export default model('Usuario', usuarioSchema);