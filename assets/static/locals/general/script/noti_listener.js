
$(document).ready(function(){
    //Load at end
    let user_data = JSON.parse(sessionStorage.getItem("user_data"));
    let __is_dashboard = typeof(page__is_dashboard) != 'undefined';
    if (__is_dashboard){
        load_unread();
    }
    $(".first .status .count-hold").css("display", "none");
    
    
    setUpNotiSocket();

    function setUpNotiSocket(){
        let class_code = user_data.class_code;
        let user_code = user_data.user_code;

        let url = `ws://${window.location.host}:8001/ws/notification/subscribe/${class_code}/${user_code}`;


        let noti_wsConnect = new WebSocket(url);

        noti_wsConnect.onclose = function (event) {
            var reason;
            // See https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
            if (event.code == 1000)
                reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            else if(event.code == 1001)
                reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            else if(event.code == 1002)
                reason = "An endpoint is terminating the connection due to a protocol error";
            else if(event.code == 1003)
                reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            else if(event.code == 1004)
                reason = "Reserved. The specific meaning might be defined in the future.";
            else if(event.code == 1005)
                reason = "No status code was actually present.";
            else if(event.code == 1006)
               reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            else if(event.code == 1007)
                reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [https://www.rfc-editor.org/rfc/rfc3629] data within a text message).";
            else if(event.code == 1008)
                reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            else if(event.code == 1009)
               reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            else if(event.code == 1011)
                reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            else if(event.code == 1015)
                reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
            else
                reason = "Unknown reason";

            popAlert(reason)
            
            
            setTimeout(() => {
                setUpNotiSocket();       
            }, 2000);    
            // $("#thingsThatHappened").html($("#thingsThatHappened").html() + "<br />" + "The connection was closed for reason: " + reason);
        };

        noti_wsConnect.onopen = function(){
            popAlert("Stream connected");
        }

        
        // noti_wsConnect.onclose = function (event) {
        //     popAlert("Reconnecting...");
        //     setTimeout(() => {
        //         setUpNotiSocket();       
        //     }, 300);                 
        // };        
        
        noti_wsConnect.onmessage = function(e){            
            let response = (JSON.parse(e.data))          
            console.log(response);

            user_data['unread_notice_count'] += 1;
            sessionStorage.setItem("user_data", JSON.stringify(user_data))

            let sendertext = '';
            if (response.otherdata['creator_name']){
                sendertext = "from " + response.otherdata.creator_name
            }
            
            h_text = `
                <div id="noti_alert_box">
                    <b>Notification received ${sendertext}</b>
                    <br><br>
                    <span>${response.text}</span>
                </div>    
                <script>
                    $("#noti_alert_box").click(function(){
                        window.location.href = window.location.origin + "/notifications";
                    })
                </script>        
            `;
            let pa = popAlert(h_text, true);
            setTimeout(()=>{
                pa.kill()
            }, 2000)

            if (__is_dashboard){
                load_unread();
            }

            
        }
    }
    
    function load_unread(){
        // Checks if user is in a class and checks if they have unread message
        axios({
            method: 'POST',
            url: window.location.origin+"/api/user/get_status",
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {}
        }).then(response => {
            response = response.data;
            if (response.passed){
                if (response.callrefresh){
                    location.reload();
                }
                user_data.unread_notice_count = response.unread_notice_count;
                user_data.accept_status = response.accept_status;
                user_data.user_type = response.user_type;
                sessionStorage.setItem("user_data", JSON.stringify(user_data));
                if (user_data.unread_notice_count != 0){
                    $(".first .status .count-hold").css("display", "flex").text(user_data.unread_notice_count);
                }else{
                    $(".first .status .count-hold").css("display", "none");
                }
            }
        })
        .catch(error => console.error(error))        
        
    }

})