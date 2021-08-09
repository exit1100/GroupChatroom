// server.js

// include module 
const express = require('express');
const app = express();
const http = require('http').Server(app); 
const io = require('socket.io')(http);
var path = require('path');
const session = require('express-session');
const routes = require('./routes');
const logger = require('morgan');
const con = require('./config');

const port = 7707;

//real time
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);


var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

  //get방식 경로 포트 이후 '/backdoor'로 아래 파일 띄우기
app.get('/backdoor',function(req, res){  
  //url 
  res.sendFile(__dirname + '/views/client.html');
});


// login
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log(req.url);
  if (username && password) {
    con.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          //req.session.loggedin = true;
          //req.session.username = username;
          res.sendFile(__dirname + '/views/client.html');
        } else {              
          res.send('<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); document.location.href="/";</script>'); 
        }            
    });
  } else {        
    res.send('<script type="text/javascript">alert("username과 password를 입력하세요!"); document.location.href="/";</script>');    
    res.end();
  }
});

// non_account_login
app.post('/non_account_login', function(req, res) {
  var non_ID_password = req.body.non_ID_password;
  console.log(req.url);
  if (non_ID_password==8965){
    res.sendFile(__dirname + '/views/client.html');
  }else {              
    res.send('<script type="text/javascript">alert("password가 일치하지 않습니다."); document.location.href="/non_account_login";</script>'); 
    res.end();
  }    
});






// 로그아웃
app.get('/logout', function(request, response) {
  request.session.loggedin = false;
  response.send('<script type="text/javascript">alert("성공적으로 로그아웃 되었습니다."); document.location.href="/";</script>');    
  response.end();
});
/*
//backdoor라고 붙이지 않으면 모두 4o4 error
app.all('*',function(req,res){
  res.status(404)
});*/



//users list
var users = new Array();
//users counter
var connectCounter=0;
//anonymous id
var count=1;
//user_name_list
var userOf_IP = {
  //'127.0.0.1' : 'myself',
};
// dynamic user dictionary
// userOf_IP['127.0.0.1'] = 'my-self';


io.on('connection', function(socket){ 
  var connect_time = moment().format('YYYY-MM-DD HH:mm');
  var user_info = socket.handshake.address;   // 형식 ->> ::ffff:[userIP]
  var user_ip = user_info.slice(user_info.indexOf(":",3)+1);
  
  connectCounter++; //users count ++

  if (Object.keys(userOf_IP).includes(user_ip)){    //객체 안의 key가 포함되어있는가?
    var name = `${userOf_IP[user_ip]}`;
  }
  else{
    var name = `anonymous${count++}`; 
  }

  console.log(`${connect_time} | ${user_ip}\t | ${name}\t | connected!`); 
  io.emit('user update', `${name}님이 접속하셨습니다!`);
  
  //console.log(socket.id);
  
  users.push({
    socket : socket.id  // 생성된 socket.id
    , ip : user_ip  // 접속한 유저의 IP
    , name : name   // 접속자의 유저의 NAME
  });
  //console.log(users);
  
  io.to(socket.id).emit('change name', name);  
  io.emit('update', users, connectCounter);


  socket.on('disconnect', function(){
    var disconnect_time = moment().format('YYYY-MM-DD HH:mm');
	console.log(`${disconnect_time} | ${user_ip}\t | ${name}\t | disconnected!`);
    io.sockets.emit('user update', `${name}님이 나가셨습니다!`);
    connectCounter--;
    for(var user in users) {
     //소켓아이디 찾아서 삭제
      if(users[user]['socket'] == socket.id){
	  // users 해당 순서의 값을 삭제한다.
      users.splice(user, 1);
      }
    }
    //console.log(users);
    io.emit('update',users,connectCounter);
  });

  
  socket.on('send message', function(name,text){
    var msg_time = moment().format('YYYY-MM-DD HH:mm');
    console.log(`${msg_time} | ${user_ip}\t | ${name}\t | ${text}`);
    msg_time=moment().format('HH:mm');
    socket.broadcast.emit('receive message', name, text);

    var sql = "INSERT INTO comments (commenter, comment) VALUES (1, '"+ text +"')";
    con.query(sql,function(err,rows,fields) {
      if(err){
        console.log(err);
      }else{
        console.log('rows',rows);
        //console.log('fields',fields);
      }
    });

  });


  socket.on('login', function(passwd){
	console.log(passwd);
    if(passwd == '8965'){ 
		io.to(socket.id).emit('login ok', '정답');
		res.sendFile(__dirname + '/client.html');
 
	}
  });
  
});








http.listen(port, function(){
  var serverOn_time=moment().format('YYYY-MM-DD HH:mm');
  console.log(`${serverOn_time} | server on!`);
});