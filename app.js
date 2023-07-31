var QB=require("quickblox");
const express=require("express");
const fs = require('fs');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const { error } = require("console");
require('dotenv').config();

const app=express();
const APPLICATION_ID =process.env.Appud;
const AUTH_KEY = process.env.Auth;
const AUTH_SECRET = process.env.Secret;
const ACCOUNT_KEY = process.env.Accountkey;
const CONFIG = { debug: true };
const store = new session.MemoryStore();
const cookieParser = require('cookie-parser');
var mess=[];
app.use(fileUpload());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: store
  })
);

app.use((req, res, next) => {
  req.session.users = req.session.users || {};
  next();
});
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
QB.init(APPLICATION_ID, AUTH_KEY, AUTH_SECRET, ACCOUNT_KEY, CONFIG);
QB.createSession((error,result)=>{
})

app.get('/', (req, res) => {
  const sessionId = req.session.sessionId;
  if (!sessionId){
    res.sendFile(__dirname + '/sign-in.html');
  }
 else {
  res.redirect("/home");
 }
});
app.post("/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const params = { email, password };

  QB.createSession(params, (error, session) => {
    if (error) {
      res.send("<h1>Error</h1>");
    } else {
      const sessionId = session.token;
      req.session.sessionId = sessionId;
      req.session.users = req.session.users || {};
    let x=(session.user_id);
      req.session.users[sessionId] = {
        sessio:sessionId,
        id:x,
        chats:[],
        messages:[],
        ids:""
      };
   
      const user = req.session.users[sessionId];
    
      if (user) {
    
        const userCredentials = {
          userId: user.id,
          password: user.sessio
        };
    
        QB.chat.onDisconnectedListener = onDisconnectedListener;
    
        function onDisconnectedListener() {
          console.log("onDisconnected");
          connectToChat(userCredentials);
        }
    
        function connectToChat(userCredentials) {
          console.log(userCredentials);
       
        }
    
     
        var  chats=[];
        connectToChat(userCredentials);
        let params = {
          sort_desc: 'last_message_date_sent',
          limit: 10
        };
        
        QB.chat.dialog.list(params, function(error, dialogs) {
          let x=dialogs.items;
          console.log(x);
          x.forEach((ele)=>{
            let r={
              name:ele.name,
              id:ele._id,
              lastMessage:ele.last_message,
              ouccup:ele.occupants_ids
            }
            req.session.users[sessionId].chats.push(r);
          });
          let messages=user.messages;
          if (!messages){
           let  messages=[];
          }
          res.redirect("/home");
        });
    
       
     
      } else {
    res.redirect("/");
      }
    }
  });
});
app.get("/home",(req,res)=>{
  const sessionId = req.session.sessionId;
  const user = req.session.users[sessionId];
 
  if (!sessionId){
    res.sendFile(__dirname + '/sign-in.html');
  }
  if (user) {

    let messages=user.messages;
    if (!messages){
     let  messages=[];
    }
   
    res.render("home",{avatar:QB.content.privateUrl("0a2ad652d1c74c58a0e25532ed3305e600"),chats:req.session.users[sessionId].chats,messages:messages});
 
  } else {
res.redirect("/");
  }
});

app.get("/messages/:did",async (req,res)=>{


  const sessionId = req.session.sessionId;
  const user = req.session.users[sessionId];
  const sessionToken=sessionId;

  QB.startSessionWithToken(sessionToken, function(err, mySession){
    if (err){
        console.log('Error in start session with token');
    } else {
        console.log('session data: ', mySession);
    }
});
  const userCredentials = {
    userId: user.id,
    password: user.sessio
  };
  console.log(user.id);

let dialogId=req.params.did;
req.session.users[sessionId].ids=dialogId;
user.ids=dialogId;
console.log(dialogId);
var params = {
  chat_dialog_id: dialogId,
  sort_desc: 'date_sent',
  limit: 100,
  skip: 0
};
var  msg=[];
var sendrec=[];
QB.chat.message.list(params, function(error, messages) {

  for (let i = 0; i < messages.items.length; i++) {
let m=messages.items[i].message;
console.log(m);
if (req.session.user===messages.items[i].sender_id){
  sendrec.push(1);
}
else{ sendrec.push(0);}
msg.push(m);

console.log(msg);
  }
  user.messages=msg;
  console.log(msg);
  res.redirect("/home");
});
});
app.get("/cr/:id",(req,res)=>{
let x=req.params.id;
console.log(x);
var params = {
  type: 3,
  occupants_ids: [x]
};

QB.chat.dialog.create(params, function(error, dialog) {

});
res.redirect("/home");
});
app.get("/sessinf",(req,res)=>{
  const sessionId = req.session.sessionId;
  const user = req.session.users[sessionId];
  res.send(user);
});
app.get("/chats",(req,res)=>{
  const sessionId = req.session.sessionId;
  const user = req.session.users[sessionId];
  const sessionToken=sessionId;
  QB.startSessionWithToken(sessionToken, function(err, mySession){
    if (err){
        console.log('Error in start session with token');
    } else {
        console.log('session data: ', mySession);
    }
});
  let params = {
  
   sort_desc: 'last_message_date_sent',
    limit: 10
  };
  var  y=[];
  QB.chat.dialog.list(params, function(error, dialogs) {
    let x=dialogs.items;
   
    x.forEach((ele)=>{
      let r={
        name:ele.name,
        id:ele._id,
        lastMessage:ele.last_message,
        ouccup:ele.occupants_ids
      }
      y.push(r);
    });
    res.send(y);
  });
 
});
app.get("/msgs/:x",(req,res)=>{
  const sessionId = req.session.sessionId;
  const user = req.session.users[sessionId];
  const sessionToken=sessionId;
 
  QB.startSessionWithToken(sessionToken, function(err, mySession){
    if (err){
        console.log('Error in start session with token');
    } else {
        console.log('session data: ', mySession);
    }
});
  const dialogId=req.params.x;  
var params = {
  chat_dialog_id: dialogId,
  sort_desc: 'date_sent',
  limit: 100,
  skip: 0
};

QB.chat.message.list(params, function(error, messages) {
  if (messages){


  
   const r=messages.items;
   let s=[];
   r.forEach((ele)=>{
s.push({msg:ele.message,send:ele.sender_id});
   });
   res.send(s);
}
else res.send([]);
});
});
app.get("/us",(req,res)=>{
  var params = {
    filter: {
      field: "created_at",
      param: 'between',
      value: '2023-01-01, 2024-05-06'
    },
    order: {
      field: 'created_at',
      sort: 'asc'
    },
    page: 1,
    per_page: 50 
  };
  
   QB.users.listUsers(params, function(error, result) {
    if (error) {
      console.error('Error retrieving user list:', error);
      res.status(500).json({ error: 'Failed to retrieve user list' });
    } else {
      console.log(result.items.user);
      res.json({ users: result.items });
    }
  });

});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  const userId = req.session.user.user_id;
  const params = { filter: { field: 'id', param: 'in', value: [userId] } };

  QB.users.listUsers(params, function (error, result) {
    if (error || !result.items || result.items.length === 0) {
      res.send('<h1>Error retrieving user profile</h1>');
    } else {
      res.render('profile', {
        avatar:   QB.content.privateUrl("0a2ad652d1c74c58a0e25532ed3305e600"),
        fn: result.items[0].user.full_name,
        em: result.items[0].user.email
      });
    }
  });
});
app.get("/signup",(req,res)=>{
  const sessionId = req.session.sessionId;
  if (!sessionId){
    res.sendFile(__dirname+"/sign-up.html");
  }
else{
  res.redirect("/home");
}

});
app.post("/signup",(req,res)=>{
  var params = {
    login: req.body.email,
    password: req.body.password,
    email:req.body.email,
    full_name: req.body.username
  };
  
  QB.users.create(params, function(error, result) {
    if (error) {
      res.sendFile(__dirname+"/failure.html");
    } else {
      res.sendFile(__dirname+"/success.html");
      
    }
  });

});
app.get("/resetpassword",(req,res)=>{
res.sendFile(__dirname+"/resetpass.html");

});
app.post("/resetpassword",(req,res)=>{
  var searchParams = {email: "yassine@gmail.com"};
    
  QB.users.get(searchParams, function(error, user) {
      console.log(user);
  });

});

app.get("/logout",(req,res)=>{
  req.session.sessionId=null;
 res.redirect("/");
});

app.get("*",(req,res)=>{
  res.send("Error 404 Page Not Found");
})
app.listen("3000",()=>{
  console.log("working in port 3000");
})