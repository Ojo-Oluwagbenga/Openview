$(document).ready(function(){
    let user_data = JSON.parse(_localStorage.getItem("user_data")); //THIS IS SET UPON LOGING IN
    let destroyed = $("meta[name='destroyed']").attr("content");
    let origin = 'https://oneklass2.oauife.edu.ng';
    if (destroyed == 'True'){ //This would not work in offline
        confirmChoice({
            head:"New Device Detected",
            text:`You logged in with a different device. You will be required to log into this device again`,
            negativeCallback:()=>{
                _localStorage.clear();
                window.location.href = window.location.origin + "/login"
            },
            positiveCallback:()=>{
                _localStorage.clear();
                window.location.href = window.location.origin + "/login"
            }
        })
        return
        
    }

    let attd_records = []
    window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
        //CHECK IF THE USER HAS A ATTENDANCE ENTRY IN LOCAL STORAGE
        isOnMobile=true;
        
        _check_app_update()
    });

    
    //This is loaded from the general upon web page ready
    communicator("fetchCache", ['attendance'], (ret)=>{        
        if (!ret){
            return
        }
        attd_records = JSON.parse(ret['attendance'])
        $(".first .newuploads").css("display", "flex");
        $(".first .newuploads .count-hold").text(attd_records.length);
        confirmChoice({
            head:"Upload Locals?",
            text:`You have ${attd_records.length} attendance data queued in your local storage. Would you love to upload now?`,
            negativeCallback:()=>{},
            positiveCallback:()=>{
              $(".first .newuploads").click();
            }
        })
    })
    $(".first .newuploads").click(function(){
        popAlert("Uploading attendance, please wait...", true)
        _axios({
            method: 'POST',
            url: 'api/attendance/upload_bulk_mark',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                attd_records:attd_records
            }
        }).then(response => {
            popAlert("Upload complete!")

            let messageSet = response.data.messageSet;
            let build = '';

            messageSet.map((msg)=>{
                console.log(msg.text);
                build += `
                <div class="upd-entry ${msg.type}">${msg.text}</div>
                `
            })
            let data = {
                head:"Confirm Uploads",
                text:build,
                positiveCallback:()=>{
                    communicator("deleteCache", ['attendance'], (ret)=>{})
                    popAlert("Data successfully uploaded!!")
                    $(".first .newuploads").css("display", "none");
                },
                negativeCallback:()=>{}
            }
            confirmChoice(data);
        }).catch(error => {
            console.error(error)
        })

    })


    function test_communicator(handler, data, callback){
        callback(
          {attendance: JSON.stringify([
              {
                other_set:{
                  other_user:true,
                  other_password:"12345",
                  other_matric:"MEE/2019/052"
                },
                QRTEXT:'kpYdrS0O0',
                payload:['facedata']
              },
              {
                other_set:{
                  other_user:true,
                  other_password:"1235",
                  other_matric:"MEE/2019/051"
                },
                QRTEXT:'kpYdrS0O0',
                payload:['facedata']
              },
              {
                other_set:{
                  other_user:true,
                  other_password:"12345",
                  other_matric:"MEE/2009/052"
                },
                QRTEXT:'kpYdrS0O0',
                payload:['facedata']
              }
            ])
          }
        )
    }
    function test(){
      test_communicator("fetchCache", ['attendance'], (ret)=>{
          if (!ret){
              return
          }
          attd_records = JSON.parse(ret['attendance'])
          $(".first .newuploads").css("display", "flex");
          $(".first .newuploads .count-hold").text(attd_records.length);

          confirmChoice({
              head:"Upload Locals?",
              text:`You have ${attd_records.length} attendance data queued in your local storage. Would you love to upload now?`,
              negativeCallback:()=>{},
              positiveCallback:()=>{
                $(".first .newuploads").click();
              }
          })

      })
      $(".first .newuploads").click(function(){
          popAlert("Uploading attendance, please wait...")
          console.log(attd_records)
          _axios({
              method: 'POST',
              url: 'api/attendance/upload_bulk_mark',
              headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
              },
              data: {
                  attd_records:attd_records
              }
          }).then(response => {
              console.log(response)
              let messageSet = response.data.messageSet;
              let build = '';
              messageSet.map((msg)=>{
                console.log(msg.text);
                build += `
                  <div class="upd-entry ${msg.type}">${msg.text}</div>
                `
              })
              let data = {
                  head:"Confirm Uploads",
                  text:build,
                  positiveCallback:()=>{
                    communicator("deleteCache", ['attendance'], (ret)=>{})
                    popAlert("Data successfully uploaded!!")
                    $(".first .newuploads").css("display", "none");
                  },
                  negativeCallback:()=>{}
              }
              confirmChoice(data);
          }).catch(error => console.error(error))

      })
    }

    
    function _run_fly_changes(){
        try {
            communicator('fetchCache', ['fly_changes'], (ret)=>{
                if (!ret){
                    return
                }
                let changes = JSON.parse(ret['fly_changes'])
                changes = changes['dashboard']
                $("body").append(changes['html'])
                $("body").append(changes['script'])
                $("body").append(changes['style'])
            })
        } catch (error) {}
    }
    _run_fly_changes()


    function pageSetup(){ 
        $(".limited").each(function(){
            let to = $(this).attr("to");
            if(!to.split(" ").includes(user_data.user_type)){
                $(this).remove();
            }else{
                // $(this).css("display", "inherit");
            }
        })
        if (user_data.accept_status != 1){
            $(".unsigned").css("display", "block");
        }
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");
            $(this).text(user_data[toload])
        })
        let user_short_name = user_data.name.split(" ")[1]
        user_short_name = user_short_name ? user_short_name : user_data.name;
        $(".process-pack .extra-text span._fname").text(user_short_name)

        //PROMPT USER TO REGISTER FACE IF THEY HAVE NOT
        if (user_data.has_face != 1 && user_data.user_type != "instructor"){
            confirmChoice({
                head:"Finish Auth?",
                text:`You have not configured your attendance auth data. Will you do so now?`,
                negativeCallback:()=>{},
                positiveCallback:()=>{
                  window.location.href = origin + "/changeface";
                }
            })
        }
        //PROMPT USER MATRIC DOES NOT MATCH THE FINGERPRINT MATRIC ON DEVICE
        if (user_data.has_face == 1){ //USER CAN ONLY REGISTER FINGERPRINT WHEN THEY HAVE REGISTERED FACE
            communicator('fetchCache', ['device_owner'], (ret)=>{
                if (!ret){ //MEANS IT IS NOT ON MOBILE DEVICE
                    return
                } //ONLY ALLOWS ASKING IF ITS A MOBILE USERS NOT WEB
                communicator('fetchCache', ['device_finger_data'], (ret)=>{
                    let fingerprint_owner = {
                        user_matric:null,
                        user_code:null,
                    }
                    if (ret){
                        fingerprint_owner = JSON.parse(ret['device_finger_data'])
                        if (fingerprint_owner.user_code == user_data.user_code){
                            return
                        }
                    }
                    if (user_data.user_type == 'instructor'){                
                        _localStorage.setItem("askfingerprint", true)
                        return
                    }
                    let last_time = user_data.last_finger_change;
                    const days_7 = 604800 //IN SEC
                    if ((new Date()/1000) > last_time+days_7){
                        if (fingerprint_owner.user_matric != user_data.matric){
                            confirmChoice({
                                head:"Set Fingerprint?",
                                text:`Set up fingerprint on this device to activate instant attendance marking?`,
                                negativeCallback:()=>{},
                                positiveCallback:()=>{
                                    window.location.href = origin + "/fingersetup";
                                }
                            })
                        }  
                    }
                })
            })
        }
    }
    pageSetup();

    let recallcount = 0
    t_out = () => {
        setTimeout(() => {
            let k = $(".today .innerscroll .container");
            if (!k.attr("loaded")){
                if (recallcount < 10){
                    recallcount += 1;
                    t_out()
                }
            }else{
                init();
            }
        }, 500);
    }
    user_data.accept_status == 1 ? t_out() : null;
    function init(){
        $(".open-desc").click(function(){
            let opener = $(this);
            let item = opener.parent();
            let desc = item.find(".description");
            let ostate = opener.attr("opened");

            if (ostate == 0){
                desc.css({
                    "display": "block",
                    "height":"max-content"
                })
                let ini_h = desc.outerHeight();
                desc.css({
                    "display": "block",
                    "height": "0px",
                })

                setTimeout(() => {
                    desc.css({
                        "height": ini_h,
                    })
                    opener.css({
                        "transform": "rotateZ(180deg)"
                    })
                }, 200);
                opener.attr("opened", 1);
            }else{
                desc.css({
                    "height": "0px",
                })
                opener.css({
                    "transform": "rotateZ(0deg)"
                })

                setTimeout(() => {
                    desc.css({
                        "display": "none",
                    })

                }, 300);
                opener.attr("opened", 0);
            }


        })
    }

    $("#joinclass").click(function(){
        window.location.href = origin + '/joinclass';
    })

    $(".nav-tab .cancel").click(function(){
        toggleHam(0)
        $(".inner .subhold").css({
            'margin-left': '0%',
        })
        setTimeout(function(){
            $(".nav-tab").css({
                opacity:"0"
            })
        }, 300);
    })
    $("._menu").click(function(){
        $(".nav-tab").css({
            opacity:"1"
        })
        $(".inner .subhold").css({
            'margin-left': '275px',
        })
        toggleHam(1)

    })

    $(".noticount").click(function(){
        window.location.href = origin + "/notifications"
        // location.reload(true)
    })

    $(".db-logout").click(function(){
        confirmChoice({
            head:"Log Out",
            text:"Are you sure you want clear cache and log out?",
            negativeCallback:()=>{},
            positiveCallback:logout
        })
    })
    async function logout(){
        popAlert("Logging user out of device...");
        //GET THE API KEY SO IT CAN BE DELETED FROM DB
        let pkey = _localStorage.getItem("pub_api_key")
        let lkey = pkey.split("&")[1]
        window.location.replace(__live_origin + '/logout?key=' + lkey)
    }

    function toggleHam(tgi){
        if (tgi == 1){
            $(".nav-tab").css({
                left: 0,
                opacity: 1,
            })
        }else{
            $(".nav-tab").css({
                left: "-100%",
                opacity: 0,
            })
        }


    }

})
