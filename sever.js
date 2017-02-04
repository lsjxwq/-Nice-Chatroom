
//引入核心模块
var http=require('http');
var path=require('path');
var express=require('express');
var fs=require('fs');

var app=express();
var html='';
//处理静态资源请求
var urlPath=path.resolve(__dirname,'public');
app.use(express.static(urlPath));

var httpServer=http.createServer(app);
var socketIO=require('socket.io');

var socketServer=socketIO.listen(httpServer);
//创建服务器并监听
httpServer.listen(8080,function(){
    console.log('服务器正运行在8080端口...')
});
var people=0;
/*
setInterval(function(){
    var now = new Date().toLocaleString();
    socketServer.sockets.send(now);//发送默认叫做message消息
},1000);*/
console.log('有新的客户端连接');
socketServer.on('connect',function(socket){//有连接事件  这个参数是个用户对象
    socket.emit('hello','欢迎新朋友');//emit发送自定义名称消息


    socket.on('message',function(data){//接收事件  data是接收的内容  此内容是一个对象
        var type=data.type;

        switch(type) {
            case '101':
                handleUserLogin(socket,data);//handle处理 user用户 login登录
                break;
            case '201':
                handleUserMsg(socket,data);//handle处理 user用户 login登录
                break;
        }
    });
    //用户列表
    socket.on('userListing',function(data){
        if(people<7){
            html=html+data;
            var content={
                html:html,
                nickname:socket.nickname
            };
            socket.emit('userListing',content);
            socket.broadcast.emit('userListing',content);
        }else{
            people=6;
        }

    });
    socket.on('userListingLeave',function(data){
        var content={
            html:data
        };
        socket.emit('userListing',content);
        socket.broadcast.emit('userListing',content);
    });

    socket.on('disconnect',function(){//接收离开信息
        var content={
            type:'102',
            nickname:socket.nickname
        };
        --people;
        socket.broadcast.send(content);
        socket.broadcast.emit('people',people);
        if(people<=0){
            people=0;
            html='';
        }
        socket.broadcast.emit('userListingLeave',content);
    });
});
function handleUserMsg(socket,data) {
    var content={
        type:'201',
        nickname:socket.nickname,
        content:data.content,
        Private:data.Private,

    };
        console.log(data.Private);
        socket.broadcast.send(content);

        content.type='200';
        socket.send(content);




}


function handleUserLogin(socket,data){
    ++people;
    if(people<7){
        socket.nickname=data.nickname;

        var content = {
            type:'101',
            nickname:data.nickname,
            sex:data.sex
        };

        socket.broadcast.send(content);
        socket.broadcast.emit('people',people);
        content.type='100';
        socket.send(content);
        socket.emit('people',people);
    }


}


