const socket = io('/');
const videoGird = document.getElementById('call');
const myPeer = new Peer(
    { iceServers: [{url:'stun:stun01.sipphone.com'},
    {url:'stun:stun.ekiga.net'},
    {url:'stun:stun.fwdnet.net'},
    {url:'stun:stun.ideasip.com'},
    {url:'stun:stun.iptel.org'},
    {url:'stun:stun.rixtelecom.se'},
    {url:'stun:stun.schlund.de'},
    {url:'stun:stun.l.google.com:19302'},
    {url:'stun:stun1.l.google.com:19302'},
    {url:'stun:stun2.l.google.com:19302'},
    {url:'stun:stun3.l.google.com:19302'},
    {url:'stun:stun4.l.google.com:19302'},
    {url:'stun:stunserver.org'},
    {url:'stun:stun.softjoys.com'},
    {url:'stun:stun.voiparound.com'},
    {url:'stun:stun.voipbuster.com'},
    {url:'stun:stun.voipstunt.com'},
    {url:'stun:stun.voxgratia.org'},
    {url:'stun:stun.xten.com'},
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
     },
    {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
     },
    {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
     }
    ]
    }
);
const peers = {};
const myVideo = document.createElement('video');
var localId ;

const config = { video: true, audio: true};
var localStream;

myPeer.on('open', id =>{
    $("#code").append('<span>'+ROOM_ID+'</span>');
    socket.emit('peerid', id);
});
socket.on('peerid', id =>{
    localId = id
})
socket.on('login-fail', () =>{
    alert("Đã có người sử dụng tên này")
})
socket.on("login-sucess", users =>{
    $('#chat-screen').show();
    $('#login').hide();
    socket.emit('join-room', ROOM_ID, localId);
    users.forEach(name => {
        $('#users').append('<div><span>'+name+'</span></div>')
    });
})
    
    navigator.mediaDevices.getUserMedia(config).then(stream =>{
        addVideoStream(myVideo, stream);
        localStream = stream;
        myPeer.on('call', call =>{
            console.log('answer');
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream =>{
                addVideoStream(video, userVideoStream);
            });
        });
        
        socket.on('user-connected', data =>{
            console.log("userId: "+data.userId)
            connectToNewUser(data.userId, stream);
            $('#users').html("");
            console.log(data.name);
            data.name.forEach(name => {
                $('#users').append('<div><span>'+name+'</span></div>')
            });
            
        });
    
        socket.on('user-disconnected', data =>{
            if(peers[data.userId]) peers[data.userId].close();
            $('#users').html("");
            data.name.forEach(name => {
                $('#users').append('<div><span>'+name+'</span></div>')
            });
        });
    });


function connectToNewUser(userId, stream){
    console.log('new user');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
     });
    call.on('close', ()=>{
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream){
    console.log('add');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () =>{
        video.play();
    });
    document.getElementById('call').append(video);
}

//chat
socket.on("serverSend", function(data){
	var d = new Date();
	$("#item").append("<div> <div class='user-name' id='user-name'> <b>"
		+ data.name +"</b> <p>"+ d.getHours()+":"+ d.getMinutes()+
			":"+d.getSeconds() +"</p> </div> <span class='content'>"+ data.mess +"</span>  </div>");
	});
	socket.on("receivePhoto", function(data){
		var d = new Date();
		$("#item").append("<div> <div class='user-name' id='user-name'> <b>"
		+ data.name +"</b> <p>"+ d.getHours()+":"+ d.getMinutes()+
			":"+d.getSeconds() +"</p> </div> <img class='img-mess' src='"+data.path+"'></div>");
	});
    socket.on();
    
    $(document).ready(function(){
        $('#chat-screen').hide();
        $('#login').show();
        
        $('#btnlogin').click(function(){
            socket.emit("login", $('#userName').val());
        })

        $("#btnsend").click(function(){
            if($("#text").val()!=""){
                socket.emit("sendMessage", $("#text").val());
                $("#text").val("");
                change();
                }
            if($("#fileSelector").val()!=""){
                //alert("send img");
                var selector = document.getElementById("fileSelector");
                var img = document.getElementById("review");
                var reader = new FileReader();
                reader.onload = function (e) {
                img.src = e.target.result;
                socket.emit("sendPhoto", {base64:e.target.result});
                    }
                 reader.readAsDataURL(selector.files[0]);
                 $("#fileSelector").val(null);
                 $("#divrev").hide();
                 $("#text").show();
                 change();
                }
                });
    
        $("#title-chat").click(function(){
            $("#chat").show();
            $("#online").hide();
        });	
        $("#title-online").click(function(){
            $("#online").show();
            $("#chat").hide();
        });	
    });

    window.onload = function() {
        document.getElementById("fileSelector").addEventListener("change", function(){
            submitImg();
        });
    };
    function submitImg(){
        var selector 	= document.getElementById("fileSelector");
        var img 	= document.getElementById("review");
        var reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
            }
        reader.readAsDataURL(selector.files[0]);
        document.getElementById("divrev").style.display = 'flex';
        $("#text").hide();
        document.getElementById("btnsend").style.cursor = 'pointer';
        document.getElementById("btnsend").style.opacity = '1';
    }

function setoff(){
    document.getElementById("on").style.display = 'none';
    document.getElementById("off").style.display = 'block';
    localStream.getVideoTracks()[0].enabled=false
    console.log(localStream.getVideoTracks()[0])
}
function seton(){
    document.getElementById("off").style.display = 'none';
    document.getElementById("on").style.display = 'block';
    localStream.getVideoTracks()[0].enabled=true
    console.log(localStream.getTracks()[0])
}
function micon(){
    document.getElementById("micon").style.display = 'none';
    document.getElementById("micoff").style.display = 'block';
    localStream.getAudioTracks()[0].enabled = false;
    console.log(localStream.getAudioTracks()[0])
}
function micoff(){
    document.getElementById("micoff").style.display = 'none';
    document.getElementById("micon").style.display = 'block';
   localStream.getAudioTracks()[0].enabled = true;
    console.log(localStream.getTracks()[0])
}
function change(){
    var text = document.getElementById("text").value;
    if (text != "") {
        document.getElementById("btnsend").style.cursor = 'pointer';
        document.getElementById("btnsend").style.opacity = '1';
    }
    else{
        document.getElementById("btnsend").style.cursor = 'not-allowed';
        document.getElementById("btnsend").style.opacity = '0.2';
    }
}
function chat(){
    $("#chat").show();
    $("#online").hide();
}
function online(){
    document.getElementById("online").style.display = 'block';
    document.getElementById("chat").style.display = 'none';
}