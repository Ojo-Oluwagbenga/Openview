//THIS HANDLES THE DB INTERACTION WITH THE MOBILE DEVICE

let retry_communicator = 0;
async function async_communicator(handler, data, callback){
    //THIS COMMUNICATOR WORKS FOR MEMORY INTERACTION FOLLOWING SPECIMEN 1 DESIGN
    try {
        //== MODEL AGAINST THE MISPROPER IN DB ASSIGNMENT
        if (handler=='writeCache'){
            let retdata = await write_intermid(data)
            let stat = await window.flutter_inappwebview.callHandler(handler, ...retdata)

            return fap_interpreter(stat)
        }else{
            let retdata = window.flutter_inappwebview.callHandler(handler, ...data)
            return fap_interpreter(retdata)
        }
        
    } catch (error) {
        if (retry_communicator < 5){
            retry_communicator++
            setTimeout(() => {
                communicator(handler, data, callback)
            }, 200);
        }else{
            return false
        }        
    }
}
async function async_write_intermid(_initial){
    //BASICALLY THIS IS HAPPENING BECAUSE DATA CAN ONLY BE WRITTEN ONCE
    let stat = await window.flutter_inappwebview.callHandler("fetchCache", ...['rows'])
    let ret = fap_interpreter(stat)
    let rows = []
    if (ret){
        rows = JSON.parse(ret['rows'])
    }
    
    let initial_data = {}
    let newrows = []
    _initial.forEach(entry => {
        initial_data[entry[0]]=entry[1]
        newrows.push(entry[0])            
    });

    stat = await window.flutter_inappwebview.callHandler("fetchCache", ...rows)
    ret = fap_interpreter(stat)
    for (const rowname in ret) {
        if (!initial_data[rowname]){//ADD THOSE VALUES IF THEY WERE NOT IN THE REAL VALUES
            _initial.push([rowname,ret[rowname]])   
        }
        if (ret[rowname]){
            if (!newrows.includes(rowname)){
                newrows.push(rowname)
            }
        }          
    }
    _initial.push(['rows', JSON.stringify(newrows)])
    return _initial;
}

function fap_interpreter(rets){
    retjson = {}
    try{
        rets.map((retitem)=>{
            if (retitem){
                retjson[retitem[0]['type']] = retitem[0]['packet']
            }
        })
        if (Object.keys(retjson).length == 0){
            return false
        }
        return retjson;
    }catch (error) {
        return false;
    }
}



function _communicator(handler, data, callback){
    try {
        if (handler == 'writeCache'){
            let db = localStorage.getItem("handlerModel")
            console.log(db)
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)

            data.forEach(packet => {
                db[packet[0]] = packet[1]
            });
            localStorage.setItem("handlerModel", JSON.stringify(db));
            callback(null);
        }
        if (handler == 'fetchCache'){
            let db = localStorage.getItem("handlerModel")
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)
            let ret = {}
            data.forEach(key => {
                if (Object.keys(db).includes(key)){
                    ret[key] = db[key]
                }else{
                    ret = null;
                }
            });
            callback(ret);
        }
        if (handler == 'deleteCache'){
            let db = localStorage.getItem("handlerModel")
            console.log(db)
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)

            data.forEach(ky => {
                delete db[ky];
            });
            localStorage.setItem("handlerModel", JSON.stringify(db));
            callback(null);
        }   
    } catch (error) {
        console.log(error)
        callback(false)
    }
}
