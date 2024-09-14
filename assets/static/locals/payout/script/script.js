$(document).ready(function(){

    let user_data = JSON.parse(_localStorage.getItem("user_data"));
    let user_code = user_data.user_code;
    let paycode = '';
    let myAlert = '';
    let verify_called = true;
    let product_data = {};
    let paydata = {
        name:"Ojo John", 
        user_code:"user_code",
        status:"1", // 1 is completed, 0 is stillpaying
        total_paid:"2000",
        total_left:"2322",
        last_paid_date:"23th Jan",
        is_attended_to:0, //1 if user has collected package, 0 if user has not
        pay_milestone:[
            {
                amount_paid:120,
                date:"12th May 2020",
                amount_left:1200,
            },
            {
                amount_paid:20,
                date:"12th Jan 2020",
                amount_left:1180,
            },
            {
                amount_paid:120,
                date:"12th Jan 2020",
                amount_left:1060,
            },
            {
                amount_paid:1060,
                date:"13th Jan 2020",
                amount_left:0,
            }

        ]  
    }

    
    setPageUp();
    check_hasoutstanding();

    
    $(".swipe-control").click(function(){
        toggleswipe();
    })
    $("#viewrecords").click(()=>{window.location.href = window.location.origin+"/paychannel_data/"+paycode})
    
    $("#clearoutstanding").click(function(){
        popAlert("Clearing Outstanding");
        axios({
            method: 'POST',
            url: window.location.origin + '/api/paychannel/clear_outstanding',
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
                popAlert('Outstanding cleared!!!');                
            }else{
                popAlert(response.Message)
            }
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        }).catch(error => console.error(error))  
    })
    $("#updatedata").click(()=>{
        window.location.href = '/createreceipt/'+paycode
    })
    $("#validatereceipt").click(()=>{
        window.location.href = '/validatereceipt'
    })
    $("#withdrawpay").click(()=>{
        window.location.href = window.location.origin + '/withdrawpay/' + paycode
    })
    $("#copyaddress").click(()=>{
        writeToClipboard(window.location.origin + "/join-channel/" + paycode, "Channel address copied to clipboard") //THIS IS DEFINED IN static/general/script/generalscript
    })
    $("#copyscode").click(()=>{
        let code = $("#codehold").text()
        writeToClipboard(code, 'Short code written to clipboard.')
    })
    $("#invitegroups").click(()=>{
        window.location.href = window.location.origin + '/update_channel_invites/' + paycode
    })
    $("#pauseaccepting").click(()=>{
        confirmChoice({
            head:"Pause payment?",
            text:"This will stop accepting payments until you resume. Sure to proceed?",
            positiveCallback:()=>{
                requestHandle({
                    url:'/api/paychannel/update',
                    data:{
                        fetchpair:{
                            'channel_code':paycode
                        },
                        updates:{
                            "status":0,
                        }
                    },
                    callback:(data)=>{
                        console.log(data);
                        alert("All changes have been made");
                        location.reload()
                    }
                })
            },
            negativeCallback:()=>{}
        })
    })
    $("#resumeaccepting").click(()=>{
        confirmChoice({
            head:"Resume payments?",
            text:"This will continue accepting payments until you pause or deadline reached. Sure to proceed?",
            positiveCallback:()=>{
                requestHandle({
                    url:'/api/paychannel/update',
                    data:{
                        fetchpair:{
                            'channel_code':paycode
                        },
                        updates:{
                            "status":1,
                        }
                    },
                    callback:(data)=>{
                        alert("All changes have been made");
                        location.reload()
                    }
                })
            },
            negativeCallback:()=>{}
        })
    })
    $("#changedate").click(()=>{
        $("#datecollecthold").css("display",'flex');
        $("#datecollecthold .proceed" ).click(()=>{
            let time = $("#starttime").val();
            if (time == ''){
                popAlert("Kindly select a time")
                return
            }
            let delta = new Date(time) - (new Date()) ;
            const min_10 = 10*60*1000
            if (delta < min_10){
                popAlert("The due should be at least 10mins from now.")
                return
            }
            console.log(time)
            $("#datecollecthold").css("display",'none');
            popAlert("Updating channel's due date...")

            requestHandle({
                url:'/api/paychannel/update',
                data:{
                    fetchpair:{
                        'channel_code':paycode
                    },
                    updates:{
                        "deadline_text":time,
                        "deadline_digit":new Date(time)/1,
                        "has_deadline":"1"
                    }
                },
                callback:(data)=>{
                    console.log(data);
                    alert("All changes have been made");
                    location.reload()
                }
            })
        
            


        })
        $("#datecollecthold .cancel" ).click(()=>{
            $("#datecollecthold").css("display",'none');
        })
    })


    $(".invitecontrol .reject").click(function(){
        confirmChoice({
            head:"Reject Invite?",
            text:"Sure to reject this payment channel?",
            positiveCallback:()=>{
                requestHandle({
                    url:"/api/paychannel/reject_accept_exit",
                    data:{
                        channel_code:paycode,
                        type:"reject"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have blacklisted the payment channel")
                            setTimeout(() => {
                                location.reload()
                            }, 1001);
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
            text:"Sure to accept this payment channel?",
            positiveCallback:()=>{
                
                requestHandle({
                    url:"/api/paychannel/reject_accept_exit",
                    data:{
                        channel_code:paycode,
                        type:"accept"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have been added to the payment channel")
                            setTimeout(() => {
                                location.reload()
                            }, 1001);
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
            text:"Sure to exit this payment channel?",
            positiveCallback:()=>{
                
                requestHandle({
                    url:"/api/paychannel/reject_accept_exit",
                    data:{
                        channel_code:paycode,
                        type:"exit"
                    },
                    callback:(resp)=>{
                        if (resp.passed){
                            popAlert("You have been exited from the payment channel")
                            window.location.href = window.location.origin + "/dashboard";
                        }
                    },
                })
            },
            negativeCallback:()=>{}
        })
    })


    $("#addpayment").click(function(){
        let req = (data)=>{
            popAlert("Adding payment, please wait...", true)
            requestHandle({
                url:"/api/paychannel/manual_add_user_payment",
                data:data,
                callback:(response)=>{
                    if (response['not_added']){
                        let data2 = {
                            head:"Add user?",
                            text:`${data.email} is not a member of this channel yet. Would you like to add them?`,
                            positiveCallback:()=>{
                                data['add_unfound'] = true
                                req(data);
                            },
                            negativeCallback:()=>{}
                        }
                        confirmChoice(data2)
                        return
                    }

                    popAlert(response.Message)
                    console.log(response);
                },
            })
        }
        let data = { 
            entryset:[
                {name:"Email", required:true, keyname:"email", placeholder:"User email", type:"email"},
                {name:"Amount", required:true, keyname:"amount", placeholder:"Amount to Add", type:"number"},
                {name:"Password", required:true, keyname:"password", placeholder:"Enter your password", type:"password"},
            ],
            positiveCallback:(data)=>{
                console.log(data)
                data['channel_code'] = paycode
                let data2 = {
                    head:"Sure to add",
                    text:`#${data.amount} will be added to ${data.email}'s payment. Since it is a local payment, the system will treat the amount as withdrawn.`,
                    positiveCallback:()=>{
                        req(data);
                    },
                    negativeCallback:()=>{}
                }
                confirmChoice(data2)
            },
            negativeCallback:()=>{},
            head:"Add Payment",
            headtext:"This will manually add the user's payment to the record base",
        }
        dataCollect(data);
    })
    

    $("#deletedata").click(()=>{
        //This should create a delete poll such that everyone that has paid has to accept its deletion before it is successfully deleted.
        popAlert("Creating deletion racks. Will delete when all is accepted by payers.")
        return 
        requestHandle({
            url:"/api/paychannel/delete_channels",
            data:{
                channel_code:paycode
            },
            callback:(response)=>{
                console.log(response);
                if (response.passed){
                    popAlert("Channel successfully deleted");
                    setTimeout(() => {
                        window.location.href = window.location.origin + "/dashboard"
                    }, 1000);
                }
                
            },
        })
    })


    function setPageUp(){
        let curl = window.location.href;
        let curl_split = curl.split("/")
        paycode = curl_split[curl_split.length - 1];
        console.log("Paycode", paycode);

        requestHandle({
            url:"/api/paychannel/fetch",
            data:{
                fetchpair:{channel_code:paycode},
                fetchset:['price','imageset','status', 'has_deadline', 'deadline_digit', 'paydata__'+user_data.user_code, 'users']
            },
            callback:(response)=>{
                console.log("rRRRRR", response.queryset[0]);
                // return
                let data = response.queryset[0]

                //CHECK AND SET UP IF USER HAS JOINED OR NOT
                if (data['users'].includes(user_code)){
                    $(".exit").css("display", "block")
                }else{
                    $(".accept").css("display", "block")
                    $(".reject").css("display", "block")
                }
                //CHECK AND SET UP THE DEADLINE STUFFS
                if (data['has_deadline'] == 1){
                    if (data['deadline_digit'] < new Date()/1){
                        $("#payout").unbind('click');
                        $("#payout").css({"background-color":"#aeaeae"}).click(()=>{popAlert("Payment is due and no longer accepting payments.")})
                        loadPayoutClick = ()=>{}
                    }
                }
                

                //CHECK STATUS
                if (data['status'] == 0){
                    $("#payout").unbind('click');
                    $("#payout").css({"background-color":"#aeaeae"}).click(()=>{popAlert("Payment is PAUSED and currently not accepting payments")})
                    loadPayoutClick = ()=>{}
                    $("#resumeacceptingsuper").css("display", 'flex')
                }else{
                    $("#pauseacceptingsuper").css("display", 'flex')
                }

                //SET IMAGE DATA
                imageset = data['imageset']
                if (imageset[0] == '-'){
                    // collapsed to no image
                    $(".swipe-control").attr("status", 0);
                    toggleswipe()
                }else{
                    img_htm = '';
                    imageset.forEach(img => {
                        img_htm += `<div class="slideitem"><img src="${img}" alt=""></div>`
                    });
                    $(".gallerysuper .slideitemhold").html(img_htm)
                    setTimeout(() => {
                        setSliderTable();
                    }, 1000);
                    
                }

                //SET OTHER DATA
                product_data['price'] = data['price']
                paydata = data['paydata__'+user_data.user_code]
                console.log("paydata", paydata)
                $(".innerscroll .price").css("display","block").html(`<b>#${data.price}</b>`)
                if (paydata){
                    $(".innerscroll .price").css("display","block").html(`<b>#${paydata.total_left}</b><span> | #${data.price}</span>`)
                    if (paydata.total_left == 0){
                        $("#payout").unbind('click');
                        $("#payout").css({"background-color":"#aeaeae"}).click(()=>{popAlert("Payment has been completed.")})
                    }else{
                        loadPayoutClick()
                    }
                }else{
                    loadPayoutClick()
                }

                loadmilestone();
            },
        })
        let has_d = $(".deadline_data .head").attr("bio");
        if (has_d == 1){
            let vhold = $(".deadline_data .value");
            let tdata = vhold.attr("bio");
            tdata = new Date(tdata).toGMTString();
            vhold.text(tdata);
        }
        
        $(".stylehold").html('<style>.'+paycode+'{display:none}</style>')

        $(".limited").each(function(){
            let to = $(this).attr("to");            
            if(!to.split(" ").includes(user_data.user_type)){
                $(this).remove();
            }
        })
        
    }
    // $("#payout").click DEFINED WITHIN ;)
    function loadPayoutClick(){
        $("#payout").click(()=>{
            dataCollect({
                entryset:[
                    {name:"Amount", required:false, keyname:"amount", type:"number", placeholder:"Enter amount here"},
                ],
                positiveCallback:(retdata)=>{
                    console.log(retdata);
                    let amount = retdata.amount;
                    let reduced = false
                    
                    if (amount == ''){
                        if (paydata){
                            amount = paydata.total_left
                        }else{
                            amount = product_data.price
                        }
                        if (amount > 2000){
                            reduced = true;
                            amount = 2000
                        }
                    }
                    
                    amount = Number.parseFloat(amount)
                    if (!(amount>0)){
                        popAlert("The amount must be a value greater than zero.")
                        return
                    }
                    // if (amount>2000){
                    //     popAlert("We are sorry, you can not pay more than #2000 at once for now.")
                    //     return
                    // }
                    if (paydata){
                        if (amount > paydata.total_left){
                            popAlert("You can not pay more than you have left to balance.")
                            return
                        }
                    }else{
                        if (amount > product_data.price){
                            popAlert("You can not pay more than the item price!")
                            return
                        }
                    }
    
                    let charges = 0;
                    // if (amount>=2500){
                    //     charges = 100
                    //     return
                    // }
                    let text =  ''
                    if (reduced){
                        text = `You will be paying #${amount}. This transaction will 
                        cost a total charge of #${charges}.00 only.`
                    }else{
                        text = `You are making a total payment of #${amount}. This transaction will 
                        cost a total charge of #${charges}.00 only.`
                    }
                    amount = amount + charges;
                    confirmChoice({
                        head:"Proceed to pay?",
                        text:text,
                        positiveCallback:function(){
                            continuePayment(amount)
                        },
                        negativeCallback:()=>{}
                    })                
                },
                negativeCallback:()=>{},
                head:"How much to pay?",
                headtext:`You can pay just a part now. Leave the amount blank and proceed if you want the system to decide pay on the ${paydata?'#'+paydata.total_left:"total"} remaining.`
                // headtext:`You can pay just a part now. We advice you pay in parts of #2500 to avoid charges`
            })
        })
    }
    function loadmilestone(){
        let p_str = ''
        // console.log(paydata);
        if (!paydata){
            $("#pay_milestone .mile-hold").append("No payment has been made yet.");
            return
        }
        paydata.pay_milestone.forEach(day_data => {

            p_str += day_data.amount_left == 0 ? 
                    `<div class="mile-item" item_key=${day_data.pay_address} >
                        <div>
                            <svg  fill="#7b22e8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M374.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7 86.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z"/></svg>
                        </div>
                        <div  style="color: #7b22e8;">Balanced <b>#${day_data.amount_paid}</b> on ${new Date(day_data.date).toLocaleString()} </div>
                    </div>`
                    :
                    `<div class="mile-item" item_key=${day_data.pay_address}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                        </div>
                        <div>Paid  <b>#${day_data.amount_paid}</b> on ${new Date(day_data.date).toLocaleString()} - remaining <b>#${day_data.amount_left}</b> </div>
                    </div> `;
        });
        $("#pay_milestone .mile-hold").append(p_str);
        $("#pay_milestone .mile-item").click(function(){
            window.location.href = window.location.origin + '/viewreceipt/' + $(this).attr('item_key');
        })
    }
    function continuePayment(amount){
        myAlert = popAlert("Initiating payment...", true)
        //Register transaction on home server and get a reference code for the transaction 
        get_reference_code((ref_code)=>{
            verify_called = false;           
            window.Korapay.initialize({
                key: "pk_test_G4mn3gp8yr5FM9foeq7jp6dZBGXSnH34SAMZt9VK",
                reference: ref_code,
                amount: amount, 
                currency: "NGN",
                customer: {
                    name: user_data['name'],
                    email: user_data['email']
                },
                onClose: function (err) {
                    popAlert("Checking status and clearing window...")
                    setTimeout(() => {
                        verify_add({reference:ref_code})
                    }, 1000);
                },
                onSuccess: function (data) {                    
                    myAlert.kill();     
                    myAlert = popAlert("Completing payment...", true);
                    setTimeout(() => {
                        verify_add({reference:ref_code})
                    }, 1000);
                },
                onFailed: function (data) {
                    popAlert("Checking status and clearing window...")
                    setTimeout(() => {
                        verify_add({reference:ref_code})
                    }, 1000);
                }
            });
    
        
        })
        
    }
    function verify_add(response){
        if (verify_called){return}
        verify_called = true
        axios({
            method: 'POST',
            url: window.location.origin + '/api/paychannel/verify_add',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                reference:response.reference,
                pay_code:paycode,
            }
        }).then(response => {
            console.log(response);
            myAlert.kill();
            response = response.data;
            if (response.passed){
                setTimeout(() => {
                    popAlert("Transaction Complete");
                    setTimeout(() => {
                        location.reload()
                    }, 600);
                    location.reload();
                }, 800);                
            }else{
                setTimeout(() => {
                    popAlert(response.Message)
                }, 800);                
            }
        }).catch(error => console.error(error))  

    }
    function get_reference_code(func){
        axios({
            method: 'POST',
            url: window.location.origin + '/api/paychannel/startpayment',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                item_code:paycode,
            }
        }).then(response => {
            response = response.data;
            console.log(response);
            if (response.passed){
                func(response.reference_code)
            }else{
                myAlert.kill();
                setTimeout(() => {
                    popAlert(response.Message);
                }, 700);
                
            }
        }).catch(error => console.error(error))  
    }
    function check_hasoutstanding(){
        axios({
            method: 'POST',
            url: window.location.origin + '/api/paychannel/has_outstanding',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {}
        }).then(response => {
            response = response.data;
            if (response.has_outstanding){
                $(".standing").css("display", "block");
            }
        }).catch(error => console.error(error))  
    }
    function toggleswipe(){
        console.log("The clicker");
        
        if ($(".swipe-control").attr('status') == 0){    
            $(".itembiosuper").css({
                "top":"20vh",
                "height":"80vh"
            })
            
            $(".swipe-control").css({
                "transform": "rotate(180deg)"
            }).attr("status", 1);
        }else{
            $(".itembiosuper").css({
                "top":"75vh",
                "height":"25vh"
            })
            $(".swipe-control").css({
                "transform": "rotate(0deg)"
            }).attr("status", 0);
        }
    }


    function setSliderTable(){

        let childnum = $(".gallerysuper .slideitemhold").children().length
        $(".gallerysuper .sliderhold .slider").css({'width':(100*childnum)+"%"})
        let holdwidth = 0
        let propor = 0
        let leftkeep = {}
        let spacing = 0;
        let clength = 0;
        if (childnum > 1){
            spacing =  (5/(childnum-1)) 
        }else{ 
            spacing = 0
        } 

        function calc(){
            setTimeout(() => {
                clength = ($(".gallerysuper .slideitemhold").width())
                holdwidth = clength*(childnum-1)

                propor = 5/holdwidth
                $(".gallerysuper .slideitemhold .slideitem").each(function(i){
                    let scale = 1-(spacing/20)*i;//This is the starting scale of each
                    $(this).css({'margin-left': 10+spacing*(i) + "%", 'z-index':-i, 'transform': 'scaleY('+scale+')'}).attr('c-index', i);
                    const min = clength* (i)
                    const max = clength*(i + 1)
                    leftkeep[i] = [(parseFloat($(this).css('margin-left'))/$(this).parent().width())*100, scale, [min,max]];

                })
            }, 300);

        }
        calc();

        let active = 0
        let activeindex = 0
        let scmin = 0;
        let scmax = clength+1;
        let popped = 0;

        function arrange(scrollLeft){
            $(".gallerysuper .slideitemhold .slideitem").each(function(i){
                const data = leftkeep[i]
                const mleft = data[0]
                let mscale = data[1]
                const min = data[2][0]
                const max = data[2][1]
                const range = max-min
                let zind = -1*i;

                if (scrollLeft > (min - range/2) && scrollLeft < (min + range/2)){
                    zind = i
                    active = min
                    activeindex = i;
                }else{
                    zind = -i
                }
                if (scrollLeft > min){
                    mscale = 1 - (propor*(scrollLeft - min)/20)
                    zind = i;
                }else{
                    mscale = mscale+propor*scrollLeft/20
                }

                $(this).css({'margin-left': (mleft-propor*scrollLeft)+"%", 'transform': 'scaleY('+(mscale)+')', 'z-index':zind})
            })

        }

        function set_to_pos(active){
            // This will help move the closest to the top when sliding
            if (active >= 0 && active < clength*childnum ){
                arrange(active);
                $(".gallerysuper .sliderhold").scrollLeft(active)
                let bound = parseInt(active/clength);
                scmin = clength * (bound - 1);
                scmax = clength * (bound + 1);
                clearTimeout(t);
            }else{
                console.log("NEG| " + active);
            }
        }
        function popout(){
            clearTimeout(t);
            let obj = $(".gallerysuper .slideitemhold > :nth-child("+(activeindex+1)+")");
            let parobjH = $(".gallerysuper").height();
            let parobjW = $(".gallerysuper").width();

            if (popped == 0){
                // Opening the object
                popped = 1;
                $(".gallerysuper .dir").css({
                    'display':'none'
                })
                obj.css({
                    'height': parobjH,
                    'width':parobjW,
                    'margin-left':'0px',
                    'top':'calc(-5% - 3px)',
                    'transition': 'transform 0.3s ease, height 0.4s ease, width 0.3s ease, top 0.5s ease',
                })
            }else{
                // closing the obj in
                popped = 0;
                $(".gallerysuper .dir").css({
                    'display':'flex'
                });
                obj.css({
                    'height': '100%',
                    'width':'80%',
                    'top':'0',
                    'transition': 'margin 0.1s ease',
                    'margin-left':'10%',
                });
                // setTimeout(() => {
                //     obj.css({
                //         'transition': 'inherit',
                //     });                            
                // }, 200);
            }
            
        }  

        // This t is used to instanciate the time variable that's used in different functio
        let t = setTimeout(() => {}, 500);

        $(".gallerysuper .sliderhold").click(function(){
            popout();
        })

        $(".gallerysuper .sliderhold").on('scroll', function(e){
            if (popped == 0){
                let scrollLeft = $(this).scrollLeft()
                arrange(scrollLeft);
                clearTimeout(t);
                if (e.originalEvent){
                    t = setTimeout(() => {
                        set_to_pos(active)
                    }, 1000);
                }
            }
        })

        $(window).resize(function(){
            calc();
        })

        $(".gallerysuper .dir").click(function(){
            let sign = 1;
            if ($(this).attr('dir') == 'left'){
                sign = -1;
            }
            set_to_pos(active + sign*clength);
        })

        $(".gallerysuper .enlarge").click(function(){
            popout();
        })
    }
    
})
