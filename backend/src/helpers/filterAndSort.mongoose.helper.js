import validator from 'validator';

export const getSortsAndFilters = (urlQuery) => {
    /*
    /api?campo[sort]=asc
    asc y desc (uso de minusculas)
    
    https://www.mongodb.com/docs/manual/reference/operator/query/#comparison
    /api?campo[gte]=10&campo[lte]=100
    [eq] Es igual a 
    [gt] Es mayor a 
    [lt] Es menor a 
    [gte] Es mayor o igual a
    [lte] Es menor o igual a
    [neq] Es diferente a
    [ct] Contiene
    [nct] No contiene
    [start] Inicia con
    [nstart] No inicia con
    [end] Termina con
    [nend] No termina con
    [empty] Esta vacio
    [nempty] No esta vacio
    [in] Esta en array (val1,val2,val3)
    [nin] No esta en array (val1,val2,val3)
    
    /api?limit=20
    
    /api?offset=100
    
    /api?maxRegistros=true
    El output data regresará vació, esto es para que el front-end determine en el output pagination[{ totalRegistros }] si puede manejar el filtrado y el sorts internamente, en caso que los registros sean altos el front-end determinará manejar el filtrado y el sorts desde la api
    */

    let sorts = {};
    let filters = {};
    for (var key in urlQuery) {
        //sort
        if (urlQuery[key].sort) sorts[validator.escape(validator.trim(key))] = validator.escape(validator.trim(urlQuery[key].sort));
        //filters
        if (urlQuery[key].eq) filters[validator.escape(validator.trim(key))] = { $eq: validator.escape(validator.trim(urlQuery[key].eq)) };
        if (urlQuery[key].gt) filters[validator.escape(validator.trim(key))] = { $gt: validator.escape(validator.trim(urlQuery[key].gt)) };
        if (urlQuery[key].gte) filters[validator.escape(validator.trim(key))] = { $gte: validator.escape(validator.trim(urlQuery[key].gte)) };
        if (urlQuery[key].in) filters[validator.escape(validator.trim(key))] = { $in: validator.escape(validator.trim(urlQuery[key].gte)) };
        if (urlQuery[key].lt) filters[validator.escape(validator.trim(key))] = { $lt: validator.escape(validator.trim(urlQuery[key].lt)) };
        if (urlQuery[key].lte) filters[validator.escape(validator.trim(key))] = { $lte: validator.escape(validator.trim(urlQuery[key].lte)) };
        if (urlQuery[key].ne) filters[validator.escape(validator.trim(key))] = { $ne: validator.escape(validator.trim(urlQuery[key].lte)) };
        if (urlQuery[key].nin) filters[validator.escape(validator.trim(key))] = { $nin: validator.escape(validator.trim(urlQuery[key].lte)) };        
        if (urlQuery[key].ct) filters[validator.escape(validator.trim(key))] = { $regex: validator.escape(validator.trim(urlQuery[key].ct)) };
    }
    return {sorts: sorts, filters: filters};
}