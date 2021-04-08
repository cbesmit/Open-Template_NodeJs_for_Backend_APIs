export const verifyAccess = (access) => {
    return function(req, res, next) {

        let foundModule = req.user.rol.access.find(mod => mod.modulo == access.modulo);
        if (!foundModule) {
            return res.status(401).json({ status: 'error', result: { msg: 'No se tiene acceso al Módulo' } });
        }

        const foundPermiso = access.permisos.some(r => foundModule.permisos.includes(r))

        if (!foundPermiso) {
            return res.status(401).json({ status: 'error', result: { msg: 'No se tiene los permisos adecuados' } });
        }

        next();
    }
}