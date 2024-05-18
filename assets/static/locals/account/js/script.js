$(document).ready(function(){
    let user_data = JSON.parse(_localStorage.getItem("user_data"));
    let user_class_data = user_data.class_data;
    let new_rep_matric = '' //Incase the rep wants to leave ;)
    console.log(user_class_data);
    let origin = 'https://oneklass2.oauife.edu.ng'

    function pageSetup(){
        //PUT THE NAMES EMAIL AND OTHER IN THEIR PLACES
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");
            if ($(this).attr("type") == 'text'){
                $(this).val(user_data[toload]);
                return;
            }
            $(this).text(user_data[toload])
        })
        $(".__class_to_load").each(function(){
            const toload  = $(this).attr("item");
            if ($(this).attr("type") == 'text'){
                $(this).val(user_data[toload]);
                return;
            }
            $(this).text(user_class_data[toload])
        })
        //REMOVE THE LIMITED VIEWS
        $(".limited").each(function(){
            let to = $(this).attr("to");
            if(!to.split(" ").includes(user_data.user_type)){
                $(this).remove();
            }
        })
    }
    pageSetup();


    $(".profileEdit .cancel").click(function(){
        popAlert("Operation Cancelled");
        $(".profileEdit-super").css("display", "none");
    })
    $(".profileEdit .proceed").click(function(){
        let data = {
            head:"Edit profile?",
            text:"Are you sure you want to save all changes? \n\n You will be required to login again after updates.",
            negativeCallback:()=>{},
            positiveCallback:saveEditProfile
        }
        confirmChoice(data)
    })
    function saveEditProfile(){
        popAlert("Checking password...");
        let upds = {};
        $("#profile-Update .entries input").each(function(){
            if ($(this).val() != ""){
                upds[$(this).attr("id")] = $(this).val();
            }
        });
        if (!upds['old_password']){
            popAlert("Enter old password to proceed with updates");
            return;
        }
        if (!upds['old_email']){
            popAlert("Enter the old email address to proceed.");
            return;
        }

        console.log(upds);
        _axios({
            method: 'POST',
            url: 'api/user/update',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                validation_set:{
                    password: upds.old_password,
                    uniqueid: upds.old_email,
                },
                updates:{
                    ...upds
                },
                fetchpair:{
                    email:upds.old_email
                },
            }
        }).then(response => {
            response = response.data;
            console.log(response);

            if (response.passed){
                $(".profileEdit-super").css("display", "none");
                popAlert("Details updated successfully! Re-authorizing...")

                setTimeout(() => {
                    location.reload();
                }, 1000);
                //
            }else{
                popAlert(response.Message)
            }
        }).catch(error => console.error(error))

    }

    $("#editprofile").click(function(){
        $(".profileEdit-super").css({
            'display':"block",
        })
    })
    $("#fingerauth").click(function(){
        window.location.href = origin + "/fingersetup"
    })
    $("#tellafriend").click(function(){
        popAlert("Send an invite!");
    })

    $("#promotions").click(function(){
        popAlert("Coming soon...");
    })
    $("#deleteaccount").click(function(){
        if (user_data.class_data.class_code){
          popAlert("Please leave all classes and groups to proceed")
          return
        }
        popAlert("Currently can not delete. Hang around, feature coming soon...");
    })
    $("#logout").click(function(){
        confirmChoice({
            head:"Log Out",
            text:"Are you sure you want clear cache and log out?",
            negativeCallback:()=>{},
            positiveCallback:logout
        })
    })
    function logout(){
        popAlert("Logging out...");        
        communicator("deleteCache", ['login'], (ret)=>{})
        _axios({
            method: 'POST',
            url: 'api/user/logout',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {}
        }).then(response => {

            response = response.data;
            console.log(response);

            if (response.passed){
                _localStorage.clear()
                setTimeout(() => {
                    location.reload();
                }, 300);
            }else{
                popAlert("Unable to destroy session")
            }
        }).catch(error => console.error(error))

    }
})
