import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    access: [{
        modulo: {
            type: String,
            trim: true
        },
        permisos: [{
            type: String,
            trim: true
        }]
    }]
}, {
    timestamps: true,
    versionKey: false
});

export default model('Role', roleSchema);