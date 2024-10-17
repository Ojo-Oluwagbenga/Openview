$(document).ready(function(){ 
    let attd_code = $("#attendance_code").val();
    $("#url-copy").click(function(){
        let code = $("#attendance_code").val();
        writeToClipboard(window.location.origin + "/join-attendance/" + code, "Attendance url copied to clipboard") //THIS IS DEFINED IN static/general/script/generalscript
    })
    $(".initiateattendance .close").blur(function(){
        console.log("sxejdb")
    });


    $(".invitecontrol .reject").click(function(){
        confirmChoice({
            head:"Reject Invite?",
            text:"Sure to reject this attendance poll?",
            positiveCallback:()=>{
                requestHandle({
                    url:"/api/attendance/reject_accept_exit",
                    data:{
                        attendance_code:attd_code,
                        type:"reject"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have blacklisted the attendance poll")
                            window.location.href = window.location.origin + "/dashboard";
                        }
                    },
                })
            },
            negativeCallback:()=>{}
        })
    })
    $(".invitecontrol .accept").click(function(){
        confirmChoice({
            head:"Accept Invite?",
            text:"Sure to accept this attendance poll?",
            positiveCallback:()=>{
                
                requestHandle({
                    url:"/api/attendance/reject_accept_exit",
                    data:{
                        attendance_code:attd_code,
                        type:"accept"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have been added to the attendance poll")
                            window.location.href = window.location.origin + "/dashboard";
                        }
                    },
                })
            },
            negativeCallback:()=>{}
        })
    })
    $(".invitecontrol .exit").click(function(){
        confirmChoice({
            head:"Exit Poll?",
            text:"Sure to exit this attendance poll? Attendance' owner will still have your records if you have ever marked.",
            positiveCallback:()=>{
                
                requestHandle({
                    url:"/api/attendance/reject_accept_exit",
                    data:{
                        attendance_code:attd_code,
                        type:"exit"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have been exited from the attendance poll")
                            window.location.href = window.location.origin + "/dashboard";
                        }
                    },
                })
            },
            negativeCallback:()=>{}
        })
    })


})
