/*
   "CBS_DOC_Funcion" : "bs_isSetNoEmpty",
   "desc" : "Función para determinar si el valor dado esta definido y no esta vacio",
   "param": {
       "val" : "valor a revisar"
   },
    "return" : "true o false"
*/
function bs_isSetNoEmpty(val: string | null | undefined): boolean {
    if (val === undefined) return false;
    if (val === null) return false;
    if (val === '') return false;
    if (val.length === 0) return false;
    if (val.constructor === Object && Object.keys(val).length === 0) return false;

    return true;
}

/*
   "CBS_DOC_Funcion" : "bs_isNoSetOrEmpty",
   "desc" : "Determina si el valor dado esta vacio o no esta definido",
   "param": {
       "val" : "valor a revisar"
   },
    "return" : "true o false"
*/
function bs_isNoSetOrEmpty(val: string | null | undefined): boolean {
    if (val === undefined) return true;
    if (val === null) return true;
    if (val === '') return true;
    if (val.length === 0) return true;
    if (val.constructor === Object && Object.keys(val).length === 0) return true;

    return false;
}

/*-------------------Control de inputs-----------------------*/

//-!-  Fun-cbs-doc : processPathInputChange  [Besmit-28012022]
//---  d:Procesa la ruta para el cambio de los inputs, se aplica para los inputs controlables (es una función de uso general)
//---  p:val : Valor del input
//---  p:objDatToChange : Objeto donde se guardará el valor
//---  p:positionsPath : ruta a donde debe guardar el valor dentro de objDatToChange
//---  r:Objeto modificado donde se guardaro el valor
function bs_inputChangeData(val: any, objDatToChange: any, positionsPath: string[]): any {
    let obDat = objDatToChange;
    positionsPath.forEach(function (pos, idx, array) {
        let idxPos: string | null = null;

        //si la posición es un array, se separa la cadena de la posición y el indice
        if (pos.indexOf('[') !== -1) {
            idxPos = pos.split('[')[1].split(']')[0];
            pos = pos.split('[')[0];
        }

        if (idx < array.length - 1) {
            if (idxPos !== null) {
                //es un array
                if (obDat[pos] === undefined) {
                    obDat[pos] = [];
                    obDat[pos][idxPos] = {};
                }
                if (!Array.isArray(obDat[pos])) {
                    obDat[pos] = [];
                }
                if (obDat[pos][idxPos] === undefined) {
                    obDat[pos][idxPos] = {};
                }
                obDat = obDat[pos][idxPos];
            }
            else {
                if (obDat[pos] === undefined) {
                    obDat[pos] = {};
                }
                obDat = obDat[pos];
            }
        }
        else {
            if (idxPos !== null) {
                if (obDat[pos] === undefined) {
                    obDat[pos] = [];
                }
                if (!Array.isArray(obDat[pos])) {
                    obDat[pos] = [];
                }
                obDat[pos][idxPos] = val;
            } else {
                obDat[pos] = val;
            }
        }
    });

    return objDatToChange;
}

//-!-  Fun-cbs-doc : bs_inputShowValue  [Besmit-28012022]
//---  d:Sirve para el parametro value de los inputs, verifica que exista el valor y lo retorna, si no existe retorna un string vacio
//---  p:path : ruta a donde debe buscar el valor, se separa por '.', es un string y debe ser la ruta a la propiedad, ejemplo: 'elem.elem.elem.elem' o permite elementos de array [0] (unidimencional) 'elem.elem[1].elem.elem[3]'
//---  p:objToExplore : objeto donde se buscará el valor
//---  r:valor de la ruta en el objeto a exporar o cadena vacia ''
function bs_inputShowValue(path: string, objToExplore: any): string {
    const positionsPath = path.split('.');
    let obDat = objToExplore;
    let valToReturn = '';
    try {
        positionsPath.forEach(function (pos: string, idx: any, array: any) {
            let idxPos: string | null = null;

            //si la posición es un array, se separa la cadena de la posición y el indice
            if (pos.indexOf('[') !== -1) {
                idxPos = pos.split('[')[1].split(']')[0];
                pos = pos.split('[')[0];
            }
            if (obDat[pos] === undefined) {
                throw 'Valor [' + pos + '] undefined';
            }
            if (idxPos !== null) {
                if (obDat[pos][idxPos] === undefined) {
                    throw 'Valor [' + pos + '] con indice [' + idxPos + '] undefined';
                }
                else {
                    obDat = obDat[pos][idxPos];
                }
            }
            else {
                obDat = obDat[pos];
            }
        });
        valToReturn = obDat;
    } catch (e) {
        valToReturn = '';

        //console.log(e);
    }

    return valToReturn;
}

function bs_validateYupSchema(data: any, schema: any): { [key: string]: string } {
    const newData = Object.keys(data).reduce((acc: any, key: string) => {
        return {
            ...acc,
            [key]: data[key].val,
        };
    }, {});
    try {
        schema.validateSync(newData, { abortEarly: false });
    } catch (err: any) {
        const errors: { [key: string]: string } = {};
        err.inner.forEach((error: any) => {
            errors[error.path] = error.message;
        });
        
        return errors;
    }

    return {};
}

function bs_updateErrorsForm(data: any, yupSchema: any) {
    if (!yupSchema) return;
    let hasErrors = false;
    const errors = bs_validateYupSchema(data, yupSchema);
    for (const field in data) {
      data[field].err = '';
    }
    if (Object.keys(errors).length > 0) {
      for (const campo in errors) {
        hasErrors = true;
        data[campo].err = errors[campo];
      }
    }

    return { dataR: data, error: hasErrors };
  };

export {
    bs_updateErrorsForm,
    bs_validateYupSchema,
    bs_inputChangeData,
    bs_inputShowValue,
    bs_isSetNoEmpty,
    bs_isNoSetOrEmpty,
};
