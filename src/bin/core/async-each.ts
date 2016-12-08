/**
 * async-each.ts
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 * @description Permite loop em array ou objeto de forma assíncrona
 * @example
    asyncEach([1,2,3])
        .item((value, index, array)=>{
            //entra aqui para cada item do array, de forma assíncrona 
            console.log(value)
        })
        .done(()=>{
            //entra aqui quando encerrar o loop
            console.log('end loop')
        });
    //saída
    //1 2 3 end loop
    
    //exemplo com Promise
    asyncEach([1,2,3])
        .item((value, index, array)=>{
            //o próximo item será chamado após a Promise for resolvida ou rejeitada
            //se rejeitada, encerra o loop
            return new Promise((resolve, reject)=>{
                if (value==2) reject()
                else resolve();
            });
        })
        .done(()=>{
            //entra aqui quando encerrar o loop
            console.log('end loop')
        });
    //saída 1 2 end loop
*/

export default (arrayOrObject) => {
    if (!Array.isArray(arrayOrObject)){
        return eachObj(arrayOrObject);
    }

    let index=-1;
    let next=()=>{};
    let instance = {
        item: (fn) => {
            setTimeout(()=>{nextItem(fn)},10);
            return instance;
        },
        done: (fn) => {
            next = fn;
        }
    }
    function nextItem (fn) {
        let r;
        
        index++;

        if (index<arrayOrObject.length){
            r = fn(arrayOrObject[index], index, arrayOrObject)
            
            //se é Promise, aguarda reject ou resolve
            if (r && r.then){
                return r.then(()=>{
                    setTimeout(()=>{nextItem(fn)},10);
                })
                .catch(()=>{
                    next();
                })
            }

            return setTimeout(()=>{nextItem(fn)},10);
        }

        next();
    }

    return instance;
}

function eachObj (object){
    let keys = Object.keys(object);
    let index= -1;
    let next=()=>{};
    let instance = {
        item: (fn) => {
            setTimeout(()=>{nextItem(fn)},10);
            return instance;
        },
        done: fn => {
            next = fn;
        }
    }

    function nextItem(fn) {
        let k, r;

        index++;
        k = keys[index]; 
        
        if (k){
            r = fn(object[k], k, object);
            
            //se é Promise, aguarda reject ou resolve
            if (r && r.then){
                return r.then(()=>{
                    setTimeout(()=>{nextItem(fn)},10);
                })
                .catch(()=>{
                    next();
                });
            }
            
            return setTimeout(()=>{nextItem(fn)},10);
        }

        next();
    }

    return instance;
}
