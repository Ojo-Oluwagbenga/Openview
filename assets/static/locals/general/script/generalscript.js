__APP_VERSION = "1.0.0";
class _localStorage {

    static is_mobile(){
        return true
    }
    static getItem(key){
        return localStorage.getItem(key)
    }
    static async setItem(key, value){
        localStorage.setItem(key, value)
        let ret = await async_communicator('fetchCache', ['localStorage'])
        let lstore = {}
        if (ret){
            lstore = JSON.parse(ret['localStorage'])
        }
        lstore[key] = value;
        ret = await async_communicator('writeCache',
            [
                ['localStorage', JSON.stringify(lstore)]
            ], (ret)=>{}
        );
        return null;
    }
    static async removeItem(key){
        localStorage.removeItem(key)
        let ret = await async_communicator('fetchCache', ['localStorage'])
        let lstore = {}
        if (ret){
            lstore = JSON.parse(ret['localStorage'])
        }
        if (lstore[key]){
            delete lstore[key]
        }
        ret = await async_communicator('writeCache',
            [
                ['localStorage', JSON.stringify(lstore)]
            ], (ret)=>{}
        );
        return null
    }
    static async clear(){
        await async_communicator('writeCache',
            [
                ['localStorage',JSON.stringify({'platform':'mobile'})]
            ], (ret)=>{}
        );
        return localStorage.clear()
    }
}
async function _axios(data){
    
    let base_url = __live_origin +"/" + data.url
    // let base_url = "http://192.168.207.172:8000/" + data.url
    data.data['platform'] = 'mobile'
    data.data['pub_api_key'] = _localStorage.getItem("pub_api_key")
    
    let subdata = [
        {
            "requestName":"req_name",
            "data":data.data,
            "url": base_url,
            "protocol":'https',
            "method":data.method,
        }
    ]

    let _res = await window.flutter_inappwebview.callHandler("requestHandle", subdata)
    let _res2 ={}
    _res2["data"] = JSON.parse(_res)
    try {
        if (_res2['data']['invalid_key']){
            confirmChoice({
                head:"Verification Required",
                text:`It seems your access key is stale. You will be required to securely login again.`,
                negativeCallback:()=>{
                    logout()
                },
                positiveCallback:()=>{
                    logout()
                }
            })
            return
        }
        if (_res2['data']['destroyed']){
            confirmChoice({
                head:"New Device Detected",
                text:`You logged in with a different device. You will be required to log into this device again`,
                negativeCallback:()=>{
                    logout()
                },
                positiveCallback:()=>{
                    logout()
                }
            })
            return
        }  
    } catch (error) {}                                                   
    return (_res2)

    
}
// async function _check_app_update(){
//     let ret = await async_communicator('fetchCache', ['VERSION_UPDATE'])
//     if (!ret){
//         return
//     }
//     let VERSION_UPDATE = JSON.parse(ret['VERSION_UPDATE']);

//     if (VERSION_UPDATE["__LATEST_APP_VERSION"] != __APP_VERSION){ // __APP_VERSION IS STATICALLY SET ON THE LOCAL GENERALSCRIPT
//         let vtime = VERSION_UPDATE['__APP_DATA']['max_date']
//         let stime = (new Date()/1000)
//         if (vtime > stime){
//             //SHOW THE USER THE WARNING FOR TERMINATION
//             let days = (Math.floor((vtime - stime)/(86400)))
//             let text = ""
//             if (days > 1){
//                 text = "in " + days + " days time"
//             }
//             if (days == 1){
//                 text = "by tommorrow"
//             }
//             if (days == 0){
//                 text = "in a few moment"
//             }
//             confirmChoice({
//                 head:"Version Update!",
//                 text:"An update of the app is now available on playstore. This version will no longer be supported " + text,
//                 positiveCallback:async ()=>{
//                     //DIRECT THEM TO PLAYSTORE
//                     await window.flutter_inappwebview.callHandler("openStore", '')
//                 },
//                 negativeCallback:()=>{}
//             })
//         }else{
//             //SHOW THE USER THAT THE APP IS NO LONGER USABLE
//             confirmChoice({
//                 head:"Version Outdated!",
//                 text:"An update of the app is now available on playstore. This version is no longer supported.",
//                 positiveCallback:async ()=>{
//                     //DIRECT THEM TO PLAYSTORE
//                     await window.flutter_inappwebview.callHandler("openStore", '')
//                 },
//                 prevent_cancel:true,
//                 negativeCallback:()=>{
//                     popAlert("Please get the new version now")
//                 }
//             })
//         }
//     }
// }
async function _check_app_update(){ //GETS CALLED IN THE LOCAL DASHBOARD SCRIPT
    let ret = await async_communicator('fetchCache', ['VERSION_UPDATE'])
    if (!ret){
        return
    }
    let VERSION_UPDATE = JSON.parse(ret['VERSION_UPDATE']);

    if (VERSION_UPDATE["__LATEST_APP_VERSION"] != __APP_VERSION){ // __APP_VERSION IS STATICALLY SET ON THE LOCAL GENERALSCRIPT
        let vtime = VERSION_UPDATE['__APP_DATA']['max_date']
        let stime = (new Date()/1000)
        if (vtime > stime){
            //SHOW THE USER THE WARNING FOR TERMINATION
            let days = (Math.floor((vtime - stime)/(86400)))
            let text = ""
            if (days > 1){
                text = "in " + days + " days time"
            }
            if (days == 1){
                text = "by tommorrow"
            }
            if (days == 0){
                text = "in a few moment"
            }
            confirmChoice({
                head:"Version Update!",
                text:"An update of the app is now available on Oneklass's website. This version will no longer be supported " + text,
                positiveCallback:async ()=>{
                    //DIRECT THEM TO THE WEBSITE
                    let url = __live_origin + '/getapp';
                    window.flutter_inappwebview.callHandler("openExternal", url).then(stat=>{});
                },
                negativeCallback:()=>{}
            })
        }else{
            //SHOW THE USER THAT THE APP IS NO LONGER USABLE
            confirmChoice({
                head:"Version Outdated!",
                text:"An update of the app is now available on Oneklass's website. This version is no longer supported.",
                positiveCallback:async ()=>{
                    //DIRECT THEM TO THE WEBSITE
                    let url = __live_origin + '/getapp';
                    window.flutter_inappwebview.callHandler("openExternal", url).then(stat=>{});
                },
                prevent_cancel:true,
                negativeCallback:()=>{
                    popAlert("Please get the new version now")
                }
            })
        }
    }
}

function _run_fly_changes(){
    communicator('fetchCache', ['__UPDATE_HOTDATA'], (ret)=>{
        if (!ret){
            return
        }
        let changes = JSON.parse(ret['__UPDATE_HOTDATA'])
        changes = changes['general']
        $("body").append(changes['html'])
        $("body").append(changes['script'])
        $("body").append(changes['style'])
    })
}
async function _writeallcachetolocalstorage(){
    let ret = await async_communicator('fetchCache', ['localStorage'])
    if (!ret){
        _localStorage.clear()// THIS ALSO CLEARS THE LOCALSTORAGE
        window.location.href = 'http://localhost:8080/assets/static/login.html'
    }
    let lstore = JSON.parse(ret['localStorage'])
    if (!lstore['user_data']){
        _localStorage.clear()// THIS ALSO CLEARS THE LOCALSTORAGE
        window.location.href = 'http://localhost:8080/assets/static/login.html'
    }
    for (const key in lstore) {
        localStorage.setItem(key, lstore[key])            
    }
}
function redirectToWeb(subaddress){
    confirmChoice({
        head:"Open Browser?",
        text:"You will be redirected to the browser for a better view and download experience.",
        negativeCallback:()=>{},
        positiveCallback:()=>{
            let url = window.location.href;
            if (subaddress){
                url = __live_origin + subaddress; //SUBADDRESS CAN BE /account or so
            }
            window.flutter_inappwebview.callHandler("openExternal", url).then(stat=>{});
        }
    })
    
}
try {
    window.addEventListener("flutterInAppWebViewPlatformReady", async function(event) {
        await _writeallcachetolocalstorage()
    })
} catch (error) {}

function preload(link, pagetype="", headvalue="Page Loading..."){
    let redir = encodeURIComponent(link)
    if (pagetype == 'payout'){
        window.location.href = `http://localhost:8080/assets/static/preloads/payout.html?redir=${redir}`; 
        return
    }
    if (pagetype == 'initiateattendance'){
        window.location.href = `http://localhost:8080/assets/static/preloads/initiateattendance.html?redir=${redir}`; 
        return
    }
    if (pagetype == ""){
        window.location.href =  `http://localhost:8080/assets/static/preloads/generalpreload.html?headvalue=${headvalue}&redir=${redir}`;
    }
}
__live_origin = 'https://oneklass.com.ng';
__last_active_poll_path='';
let __user_data = JSON.parse(_localStorage.getItem("user_data"));


$(document).ready(function(){
    
    function pageSetup(){
        let curl = window.location.href;
        let curl_split = curl.split("/")
        let acode = curl_split[curl_split.length - 1];
        console.log("----", acode);
        $(`[redir="/${acode}"]`).css({color:"#711dd8", fill:"#711dd8"});
    
        //LIMIT USER TO THEIR SPECIFICS
        $(".limited").each(function(){
            let to = $(this).attr("to");
            if(!to.split(" ").includes(__user_data.user_type)){
                $(this).remove();
            }
        })
    
        //Prevent User from seeing stuff if they have not joined a class
        if (__user_data.accept_status != 1){
            $(".unsigned").css("display", "block");
        }
    
        //Fill up the values in each item placeholders
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");
            $(this).text(__user_data[toload]);
        })
        //FILL THE LETTER PROFILE PICS
        $(".userpack .initial-hold").text(__user_data.name.charAt(0).toUpperCase())
        //Listen for click in the side bar head bix
        $(".userpack .details-hold").click(function(){
            window.location.href = 'http://localhost:8080/assets/static/account.html'
        })
    
    }
    pageSetup();

    $("#page_back_button").click(()=>{
        history.back();
    })
    $("footer ._dashboard").click(()=>{
        if (localStorage.getItem("platform") == 'web'){
            window.location.href = window.location.origin + "/dashboard"
        }else{
            window.location.href = 'http://localhost:8080/assets/static/dashboard.html'
        }
    })
    $("footer ._attendance").click(function(){
        if (__last_active_poll_path == ''){
            popAlert("You have no active attendance")
        }else{
            window.location.href = __last_active_poll_path;
        }
    })
    $("footer ._account").click(()=>{
        if (localStorage.getItem("platform") == 'web'){
            window.location.href = window.location.origin + "/account"
        }else{
            window.location.href = 'http://localhost:8080/assets/static/account.html'
        }
    })
    
    $(".nav-item").click(function(){
        let redir = $(this).attr('redir');
        if ( typeof(redir) != 'undefined'){
            popAlert("Directing, please wait...");
            const localdir = ['/account', '/dashboard']
            if (localdir.includes(redir)){
                if (redir == '/account'){
                    window.location.href = 'http://localhost:8080/assets/static/account.html'
                }
                if (redir == '/dashboard'){
                    window.location.href = 'http://localhost:8080/assets/static/dashboard.html'
                }
                return
    
            }
            window.location.href = __live_origin + redir;
        }
    })
    
    $("#db-logout").click(function(){
        confirmChoice({
            head:"Log Out",
            text:"Are you sure you want clear cache and log out?",
            negativeCallback:()=>{},
            positiveCallback:logout
        })
    })
    _run_fly_changes()
})

function writeToClipboard(text, prompt) {
    const type = "text/plain";
    let blob = new Blob([text], {type});
    let data  = [new ClipboardItem({[blob.type] : blob})]
    navigator.clipboard.write(data); 
    popAlert(prompt?prompt:"Copied to clipboard!")
}

async function logout(){
    popAlert("Logging user out of device...", true);
    //GET THE API KEY SO IT CAN BE DELETED FROM DB
    let pkey = _localStorage.getItem("pub_api_key")
    let lkey = pkey.split("&")[1]
    window.location.replace(__live_origin + '/logout?key=' + lkey)
}
