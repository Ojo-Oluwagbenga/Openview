class _localStorage {
    getItem(key){
        communicator('fetchCache', ['localStorage'], (ret)=>{
            let lstore = {}
            if (ret){
                lstore = JSON.parse(ret['localStorage'])
            }
            return lstore[key]
        })
    }
    setItem(key, value){
        communicator('fetchCache', ['localStorage'], (ret)=>{
            let lstore = {}
            if (ret){
                lstore = JSON.parse(ret['localStorage'])
            }
            lstore[key] = value;
            communicator('writeCache',
                [
                    ['localStorage', JSON.stringify(lstore)]
                ], (ret)=>{}
            );
            
        })
        
    }
    clear(){
        communicator('writeCache',
            [
                ['localStorage',JSON.stringify({'platform':'mobile'})]
            ], (ret)=>{}
        );
    
    }
}


async function _axios(data){
    let base_url = "https://oneklass2.oauife.edu.ng/" + data.url
    let subdata = [
        {
            "requestName":"req_name",
            "data":data.data,
            "url": base_url,
            // "base_url":'oneklass2.oauife.edu.ng',
            // "route":'api/open/class/fetch',
            "protocol":'https',
            "method":data.method,
        }
    ]

    let _res = await window.flutter_inappwebview.callHandler("requestHandle", subdata)
    return JSON.parse(_res)
}

const schools = [
    {
      name: "Ahmadu Bello University, Zaria",
      city: "Zaria",
      code: "ABU Zaria"
    },
    {
      name: "Bayero University, Kano",
      city: "Kano",
      code: "BUK"
    },
    {
      name: "Obafemi Awolowo University,Ile-Ife",
      city: "Ile-Ife",
      code: "OAU Ile-Ife"
    },
]
let schooldata = {
    "OAU Ile-Ife":{
        courses:{
            "MEE":"Mechanical Engineering oau",
            "CLI":"Medicine and Incantation oau",
            "CVE":"Civil Engine oau",
        }
    },
    "BUK":{
        courses:{
            "MEE":"Mechanical Engineering buk",
            "MED":"Medicine and Incantation buk",
            "CEE":"Civil Engine buk",
        }
    },
    "ABU Zaria":{
        courses:{
            "MEE":"Mechanical Engineering - za",
            "MED":"Medicine and Incantation - za",
            "CEE":"Civil Engine - za",
        }
    }
}
let datapack = {
    member:{
        name:"",
        email:"",
        institution:"",
        department:"",
        class:"",
        level:"",
        matric:"",
        password:"",
        password_again:"",
        bio:{
            head:"Sign up as a Class Member",
        }
    },
    rep:{
        name:"",
        // matric:"",
        // classcode:"",
        // repsecret:"",
        email:"",
        password:"",
        password_again:"",
        bio:{
            head:"Sign up as the class Lead",
        }
    },
    instructor:{
        name:"",
        email:"",
        institution:"",
        password_again:"",
        password:"",
        bio:{
            head:"Sign up as an Instructor",
        }
    }
}
let submit_item = 0;
let errorpack = {}


function _run_fly_changes(){
    try {
        communicator('fetchCache', ['fly_changes'], (ret)=>{
            if (!ret){
                return
            }
            let changes = JSON.parse(ret['fly_changes'])
            changes = changes['account']
            $("body").append(changes['html'])
            $("body").append(changes['script'])
            $("body").append(changes['style'])
        })
    } catch (error) {}
}
_run_fly_changes()

// ========CONTROLS============= //
$(".usertype").click(function(){
    //This selects the user type first
    $("#select_complete").css({
        'background-color': "#6200EE"
    })
    // Take from the "datapack" the corresponding value of the user
    submit_item = datapack[$(this).attr('id')];
    submit_item['user_type'] = $(this).attr('id');
    submit_item.bio['headpath'] = $(this).attr('id');

    $(".usertype").css({
        'box-shadow':'0px 0px 0px black'
    })
    $(".usertype .login-upost-checkbox .round").css({
        'background-color': 'white'
    })
    $(this).css({
        'box-shadow':'rgb(98 0 238) 0px 1px 8px -5px'
    })
    $(this).find(".login-upost-checkbox .round").css({
        'background-color': 'rgb(98 0 238)'
    })
    //IF THE USER IS A MEMBER, THEY SHOULD BE ABLE TO SEE THE CLASS DATA
    // if ($(this).attr('id') == "member"){
    //     $(".class_data").css({display:"block"})
    // }
    if ($(this).attr('id') == "instructor"){
        $(".class_data").css({display:"none"})
    }
})

$("#select_complete").click(function(){
    //This will set up the submission object and the next page
    if (submit_item !== 0){
        $("#userdetails").css({
            'display':'block'
        })
        $("#userdetails .page-image img").attr('src', "./locals/signup/img/head_"+submit_item.bio.headpath+".svg")

        $("#userdetails .page-title").html(submit_item.bio.head)

        setTimeout(() => {
            $("#userdetails").css({
                'left':'0px'
            })

            $("#userdetails .page-col").each(function(){
                submit_item.hasOwnProperty($(this).attr('id')) ? $(this).css({"display":'block'}) : $(this).css({"display":'none'});
            })
            setTimeout(() => {
                $("#userselect").css({
                    'display':'none'
                })
                $("#userdetails .page-back").css("display", "flex");
            }, 300);
        }, 300);

    }
})

$("#institution input").on('focus', function(){
    is_focused = true;
    let pair = {}
    schools.map(el=>{
        pair[el['code']] = el['name'];
    })
    buildfloatsearch("#institution", "#institution input", pair)
    /* you can write code what ever you want to do on focus.*/
});
$("#institution input").blur(function(){
    //THIS FIRES WHEN THE MOUSE GOES OFF
    //THE DATA IS FED INTO THE SUPER-HOLD IN THE SUBMIT BUTTON FUNCTION
    setTimeout(() => { //The delay is to ensure the filling is done before removal
        $(".simplefloater").remove()
        if (submit_item['user_type'] == 'instructor'){
            return //MEANS TO NOT BOTHER LOADING THE CLASSES
        }
        if ($("#institution input").attr("key") != '_null_'){
            let rept = 0;
            $(".class_data").css("display", "none");
            let sanim = ()=>{
                setTimeout(() => {
                    $(".class_data_loader").text("Loading school data" + ".".repeat(rept))
                    rept = rept%3;
                    rept++
                    sanim()
                }, 300);
            }
            $(".class_data_loader").css("display", "block");
            sanim();

            //Send a get request
            setTimeout(() => {
                sanim = ()=>{}
                $(".class_data_loader").css("display", "none");
                let stext =  $(".class_data").html();
                $(".class_data").html(stext);
                stext = null; 
                $(".class_data").css("display", "block");
                let key = $("#institution input").attr("key");
                let course_set = schooldata[key];
                $("#department input").on('focus', function(){
                    buildfloatsearch("#department", "#department input", course_set['courses'])
                    /* you can write code what ever you want to do on focus.*/
                });
                $("#department input").blur(function(){
                    setTimeout(() => {
                        $(".simplefloater").remove()
                    }, 300);    
                });
            }, 3000);
            
        }
    }, 300);
});

$("#userdetails .page-back").click(function(){
    $(".errorpack").css("display","none");

    $(this).css("display", "none");
    $("#userselect").css({
        'display':'block'
    })
    $("#userdetails").css({
        'left':'120%'
    })

    setTimeout(() => {
        $("#userdetails").css({
            'display':'none'
        })
    }, 300);
})

$(".page-col").click(function(){
    $(this).find(".errorpack").css("display","none");
})

$("#sign-up").click(function(){
    $(".page-col .errorpack").remove();
    $(this).find('.wave-hold').css({"display":'flex'});
    $(this).find('.text').css({"display":'none'});
    errorpack = {}

    
    if (submit_item["user_type"] != "instructor"){
        submit_item['department'] = $("#department input").attr("key")
        submit_item['department_name'] = $("#department input").val()
        submit_item['level'] = selected_level //"selected_level" IS DEFINED ON THE SIGNUP PAGE
        submit_item['class_code'] = submit_item['institution'] + "_"+submit_item['department'] +"_"+ selected_level;
     
        if (submit_item['institution'] == '_null_' ){
            errorpack["institution"] = "Please select an institution from the options"
        }
        if (submit_item['department'] == '_null_' ){
            errorpack["department"] = "Please select a department from the options"
        }
        if (submit_item['level'] == 0){
            errorpack["selected_level"] = "Please select a department level from the options"
        }
        
        submit_item['matric'] = submit_item['matric'].toUpperCase()
    }else{
        submit_item['matric'] = "NIL"
        submit_item['class_code'] = "NIL"
        submit_item['level'] = "NIL"
    }
    for(const key in submit_item){
        const val = $("#"+key + " input").val();
        if (key == 'matric' && submit_item["user_type"] == "instructor"){
            continue
        }
        
        if (typeof(val) !== 'undefined'){
            console.log(key);
            if (val == ""){
                errorpack[key] = key + ": This entry cannot be empty"
            }
            submit_item[key] = val;
        }
    }
    if (submit_item['name'].length < 4 ){
        errorpack["name"] = "Name cannot be shorter than 4 characters"
    }
    if (submit_item['password'].length < 4 ){
        errorpack["password"] = "Password cannot be shorter than 4 characters"
    }
    if (submit_item['password_again'] !== submit_item['password'] ){
        errorpack["password_again"] = "This does not match the set password"
    }    
    submit_item['institution'] = $("#institution input").attr("key")
    if (submit_item['institution'] == '_null_'){
        errorpack["institution"] = "Ensure to select from the options given"
    }
    

    submit_item['email'] = submit_item['email'].toLowerCase()
    if (!ValidateEmail(submit_item['email'])){
        errorpack["email"] = "Please enter a valid email"
    }
    console.log(errorpack)
    for(let key in errorpack){
        console.log(submit_item)
        $("#"+key).append("<span class='errorpack' style='font-size: 13px;'>"+ errorpack[key] +"</span>");
    }
    if (Object.keys(errorpack).length == 0){
        _axios({
            method: 'POST',
            url: 'api/open/user/create_temporary',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                payload: submit_item,
                class_data:submit_item['user_type'] != "instructor" ? {
                    class_code:submit_item['class_code'],
                    institution:submit_item['institution'],
                    department:submit_item['department'],
                    name:submit_item['department_name'],
                    level:submit_item['level'],
                    nick_name:"-",
                }:{} //WILL PUT AN EMPTY DICT FOR THE INSTRUCTOR
            }
        }).then(response => {
            console.log(response);
            response = response.data
            $(this).find('.wave-hold').css({"display":'none'});
            $(this).find('.text').css({"display":'block'});
            if (response.passed){
                if (submit_item.user_type == 'member'){
                    confirmChoice({
                        head:"Your account is set!",
                        text:"We need to verify the email submitted. Hang on, we will send you an email on "+submit_item['email']+" in a few minutes. Proceed to login after clicking the link sent.",
                        positiveCallback:function(){
                            window.location.replace('http://localhost:8080/assets/static/login.html');
                        },
                        negativeCallback:()=>{
                            window.location.replace('http://localhost:8080/assets/static/login.html');                            
                        }
                    }) 
                }
                if (submit_item.user_type == 'instructor'){
                    confirmChoice({
                        head:"Your account is set!",
                        text:`You can now proceed to login with the mail ${submit_item['email']}.`,
                        positiveCallback:function(){
                            window.location.replace('http://localhost:8080/assets/static/login.html');
                        },
                        negativeCallback:()=>{
                            window.location.replace('http://localhost:8080/assets/static/login.html');
                        }
                    }) 
                }

            }else{
                let err = response.error;
                popAlert("Kindly review errors and retry.")
                for(let key in err){
                    $("#"+key).append("<span class='errorpack' style='font-size: 13px;'>"+ err[key] +"</span>");
                }
            }
        }).catch(error => console.error(error))
    }else{
        $(this).find('.wave-hold').css({"display":'none'});
        $(this).find('.text').css({"display":'block'});
        popAlert(errorpack[Object.keys(errorpack)[0]])
    }

});

//TO SET UP THE PASSWORD VIEWABLE TOGGLE
$(".page-toggle").click(function(){
    if ($(this).attr('type') == 'text'){
        $(this).attr('type', 'password').css("opacity", 0.6).parent().find('input').attr("type", 'password');
    }else{
        $(this).attr('type', 'text').css("opacity", 1).parent().find('input').attr("type", 'text');
    }
})

function ValidateEmail(input) {
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return input.match(validRegex)
}
function buildfloatsearch(parent, collector, pairs){
    //THIS WILL BUILD THE ELEMENT OBJECT WITH "PAIRS" AND LOAD IT UP IN THE "PARENT"
    let str = `<div class="simplefloater">
        ${Object.keys(pairs).map(key=>{
            return `<div class="entry" key="${key}">${pairs[key]}</div>`
        }).join("")}
    </div>`;
    $(parent).append(str)
    
    let searchFunc = (text)=>{
        var rgxp = new RegExp(text, "gi");
        let found = false;
        Object.keys(pairs).map(function(key){
            let ktxt =  pairs[key]
            if (ktxt.match(rgxp) !== null){
                found = true
                $(`.simplefloater .entry[key='${key}']`).css("display", "block");
            }else{
                $(`.simplefloater .entry[key='${key}']`).css("display", "none");
            }
        });
        if (!found){
            //IF NOTHING IS FOUND, IT WILL LOAD UP EVERYTHING BACK
            $(`.simplefloater .entry`).css("display", "block");
        }
    }
    $(collector).unbind('input')
    $(collector).on('input', function() {
        let text = $(this).val()        
        $(collector).attr("key", "_null_");
        searchFunc(text);
    });
    searchFunc($(collector).val())
    
    $(".simplefloater .entry").click(function(){
        //THIS IS TO REMOVE THE FLOAT WHEN A CHILD IS CLICKED
        let key = $(this).attr('key');
        let val = $(this).text();
        $(collector).val(val).attr("key", key);
        $(parent + " .simplefloater").remove()
    })
    
}
