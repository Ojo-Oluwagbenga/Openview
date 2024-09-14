$(document).ready(function(){

    $("#create .hold").click(function(){
        popAlert("Creating channel, Please wait...");
        let payload = {
            "name":"",
            "price":"",
            "description":$("#mpEditorCont #editor .ql-editor").html(),
            "has_deadline":"",
            "deadline_text":$("#deadline").val(),
            "deadline_digit":"--",
            "imageset":Object.values(selstate),
        }
        let error = 0 

        // let owners = Object.keys(selected_classes) 
        // if (owners.length == 0){
        //     popAlert("Kindly select at least a group or class");
        //     return;
        // }
        payload['owners'] = [''];

        for (key in payload){
            if (key == 'name'){
                const name = $("#name").val();
                if (name.length > 4){
                    payload['name'] = name;
                }else{
                    popAlert("Name cannot be shorter than 4 character");
                    error = 1;                    
                    break;
                }
            }
            if (key == 'price'){
                const prc = $("#price").val();
                if (prc > 0){
                    payload['price'] = prc;
                }else{
                    popAlert("Price cannot be negative");
                    error = 1;                    
                    break;
                }
            }
            if (key == 'has_deadline'){
                payload['has_deadline'] = $("#activatetime").is(":checked") ? "1" : "0";
            }
            
        }
        if (payload['has_deadline'] == 1){
            try {
                payload['deadline_digit'] = new Date(payload['deadline_text'])/1
                const min_10 = 10*60*1000
                if (payload['deadline_digit'] - new Date()/1 < min_10){
                    popAlert("Deadline should be at least 10minutes from now");
                    return
                }
            } catch (error) {
                popAlert("Date is not properly set")
                return
            }
            
        }

        console.log(payload);
        if (error == 0){      
            axios({
                method: 'POST',
                url: './api/paychannel/create',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    payload: payload             
                }
            }).then(response => {
                response = response.data;
                console.log(response);

                if (response.passed){
                    popAlert("Channel created, redirecting...");
                    setTimeout(() => {
                        location.replace('/payout/' + response.response.channel_code);
                    }, 1200);
                }else{
                    popAlert("Unable to create channel. Check Entries");
                }

            })
            .catch(error => console.error(error))
        }

        //submit
    });
})