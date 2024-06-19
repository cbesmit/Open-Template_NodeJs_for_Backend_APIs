var handleSchemaError = function (error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next({
            msg : "Se tiene una llave duplicada",
            param: error.keyValue
        });
    } if (error.name === 'ValidationError') {
        next({
            msg : "Error de validación",
            detail: error.message
        });

    } else {
        next();
    }
};

export default handleSchemaError;