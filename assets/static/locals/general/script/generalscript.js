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
    return (_res2)

    
}
function bluetoothListener(blue_string){
    alert(blue_string);
}
if (!_localStorage.getItem("user_data")){
    // window.location.href = 'http://localhost:8080/assets/static/login.html'
}

__live_origin = 'https://oneklass2.oauife.edu.ng';
__last_active_poll_path=''
let __user_data = JSON.parse(_localStorage.getItem("user_data"));

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
try {
    window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
        _writeallcachetolocalstorage()
    })
} catch (error) {}

function _run_fly_changes(){
    communicator('fetchCache', ['fly_changes'], (ret)=>{
        if (!ret){
            return
        }
        let changes = JSON.parse(ret['fly_changes'])
        changes = changes['general']
        $("body").append(changes['html'])
        $("body").append(changes['script'])
        $("body").append(changes['style'])
    })
}


$(document).ready(function(){
    
    //For the Nav Bar
    

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

    $("#page-back-button").click(()=>{
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
    popAlert("Logging out...");

    communicator("deleteCache", ['login'], (ret)=>{})
    await _localStorage.clear();
    window.location.href = 'http://localhost:8080/assets/static/login.html'
}
