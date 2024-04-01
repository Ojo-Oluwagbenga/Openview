
isOnMobile = false;
window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
    isOnMobile = true;
});


function communicator(handler, data, callback){
    try {
        window.flutter_inappwebview.callHandler(handler, ...data).then(stat=>{
            callback(fap_interpreter(stat))
        });
    } catch (error) {
        callback(error)
    }
}
function fap_interpreter(rets){
    retjson = {}
    try{
        rets.map((retitem)=>{
            retjson[retitem[0]['type']] = retitem[0]['packet']
        })
        return retjson;
    }catch (error) {
        return false;
    }
}