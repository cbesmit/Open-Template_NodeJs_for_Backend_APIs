class fetchServer {
    // constructor() { }

    static async call(callUrl = '', method = 'GET', token = '', data = {}) {

        const settings = {
            method: method,
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
        };

        if (data.constructor === Object && Object.keys(data).length !== 0) {
            settings.body = JSON.stringify(data);
        }

        if (data.constructor === FormData) {
            settings.body = data;
            delete settings.headers;
            settings.headers = new Headers({
                'Authorization': 'Bearer ' + token,
            });
        }

        return await fetch(callUrl, settings)
            .then(res => {
                return res.text().then(function (text) {
                    return { 'data': text, 'status': res.status, 'ok': res.ok }
                });
            })
            .then(
                (result) => {
                    try {
                        return JSON.parse(result.data);
                    } catch (er) {
                        const resultReturn = { ...result };
                        resultReturn['error'] = !result.ok;
                        return resultReturn;
                    }
                },
                (error) => {
                    throw new Error(error);
                }
            );
    }

    static getErrorMessage(obj, customMessage) {
        try {
            if (typeof obj === 'string') {
                if (obj.trim() === '') {
                    return customMessage;
                } else {
                    return obj;
                }
            } else if (obj.message && typeof obj.message === 'string') {
                if (obj.message.trim() === '') {
                    return customMessage;
                } else {
                    return obj.message;
                }

            }
            if (obj && obj.msg) {
                if (typeof obj.msg === 'string') {
                    if (obj.msg.trim() === '') {
                        return customMessage;
                    } else {
                        return obj.msg;
                    }
                } else if (obj.msg.params) {
                    const params = obj.msg.params;
                    if (typeof params === 'string') {
                        if (params.trim() === '') {
                            return customMessage;
                        } else {
                            return params;
                        }
                    } else if (Array.isArray(params)) {
                        if (params.length === 0) {
                            return customMessage;
                        } else {
                            const errorMessages = params.map(param => `${param.param} ${param.msg}`);

                            return errorMessages.join(' y ');
                        }
                    }
                }
            } else if (obj.constructor === Object && Object.keys(obj).length !== 0) {

                return JSON.stringify(obj);
            }

            return customMessage;
        } catch (e) {
            return customMessage;
        }
    }
}

export default fetchServer;
