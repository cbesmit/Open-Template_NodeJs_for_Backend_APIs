import { Store } from 'redux';
import { AppState } from '../store/Store';

const baseUrl = 'http://localhost:1981/api/v1/';
const baseUrlBackgSys = 'http://localhost:1975/api/v1/';

// Declara una variable global 'store' para almacenar la instancia de la tienda de Redux.
let store: Store;

// Define una función llamada 'configureFetchServer' que se utiliza para configurar 'fetchServer' con la instancia de la tienda de Redux.
export function configureFetchServer(reduxStore: Store) {
  // Asigna la instancia de la tienda de Redux pasada como argumento a la variable 'store'.
  store = reduxStore;
}

export default class fetchServer {
    //constructor() { }

    static async call(url = '', method = 'GET', data:any = {}) {
        const token = store.getState().loginReducer.token;
        const callUrl = baseUrl + url;

        const settings:RequestInit = {
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
                        const resultReturn:any = {... result};
                        resultReturn['error'] = !result.ok;
                        return resultReturn;
                    }
                },
                (error) => {
                    throw new Error(error);
                }
            );
    }

    static async callBackgSys(url = '', method = 'GET', data = {}) {
        const token = store.getState().loginReducer.token;
        const callUrl = baseUrlBackgSys + url;

        const settings:RequestInit = {
            method: method,
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
        };
        if (data.constructor === Object && Object.keys(data).length !== 0) {
            settings.body = JSON.stringify(data);
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
                        return result;
                    }
                },
                (error) => {
                    throw new Error(error);
                }
            );
    }

    static getErrorMessage(obj: any, customMessage: string): string {
        try {
            if (typeof obj === 'string') {
                if (obj.trim() === '') {
                    return customMessage;
                } else {
                    return obj;
                }
            } else if (obj.message && typeof obj.message === 'string'){
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
