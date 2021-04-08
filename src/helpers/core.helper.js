import Role from '../models/mongo/roles.model'

export const initCreateRoles = async() => {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count > 0) return;
        const values = await Promise.all([
            new Role({ name: 'admin', description: 'Permisos de administrador', access: [{ modulo: 'rol', permisos: ['ver', 'editar', 'crear'] }] }).save(),
            new Role({ name: 'visitante', description: 'Permisos para visitantes y usuarios recién creados', access: [{ modulo: 'visit', permisos: ['ver'] }] }).save()
        ]);
        console.log(values);
    } catch (error) {
        console.log(error);
    }
}