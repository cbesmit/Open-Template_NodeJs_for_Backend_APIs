export const isset = (val) =>{return typeof val !== "undefined" && val !== null}

export const issetNotEmpty = (val) => {
    if(!isset(val)) return false;
    if(val === "") return false;
    if(Array.isArray(val) && val.length === 0) return false;
    if(typeof val === 'object' &&  Object.keys(val).length === 0) return false;
    return true;    
}