var QB=require("quickblox");
const express=require("express");
const fs = require('fs');
const session = require('express-session');
const bodyParser = require("body-parser");
const { error } = require("console");
const app=express();
const APPLICATION_ID = 100874;
const AUTH_KEY = 'SPQ9xHeaYDXDPyr';
const AUTH_SECRET = 'cTfJ5zMC2EtY4br';
const ACCOUNT_KEY = 'Rh3yj3_WxyFti936KMKb';
const CONFIG = { debug: true };
const store = new session.MemoryStore();
var mess=[];
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: store
  })
);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
QB.init(APPLICATION_ID, AUTH_KEY, AUTH_SECRET, ACCOUNT_KEY, CONFIG);
QB.createSession((error,result)=>{
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/sign-in.html');
});

app.post('/', (req, res) => {
  const x = req.body.email;
  const y = req.body.password;
  const params = { email: x, password: y };
  QB.createSession(params, function (error, result) {
    if (error) {
      res.send('<h1>Error</h1>');
    } else {
      QB.login(params, function (error, result) {});
      QB.getSession((error, session) => {
        req.session.user = session.session;
        var userCredentials = {
          userId: req.session.user.user_id,
        password: y
        };
        req.session.userCr=userCredentials;
       console.log(req.session.userCr);
       
        res.redirect('/home');
      });
    }
  });
});

app.get('/home', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  res.sendFile(__dirname + '/home.html');
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
        avatar: null,
        fn: result.items[0].user.full_name,
        em: result.items[0].user.email
      });
    }
  });
});
app.get("/set_avatar",(req,res)=>{

  if (!req.session.user) {
    res.redirect('/');
    return;
  }
     
    res.sendFile(__dirname+"/set_avatar.html");

});


app.post('/set_avatar', (req, res) => {
// Assuming the file data is passed in the request body

  if (!inputFile) {
    res.status(400).send('No file uploaded');
    return;
  }

  
});

var did="";

app.get("/dialog", (req, res) => {
  userCredentials=req.session.userCr;
  QB.chat.disconnect();
  QB.chat.connect(userCredentials, function(error, contactList) {});


  let chats = [];

  if (!req.session.user) {
    res.redirect('/');
    return;
  }
    userId =req.session.user.user_id;
    if (userId===0){
      res.redirect("/");
    }
    else{
      console.log(userId);

      let params = {
        created_at: {
          lt: Date.now() / 1000
        },
        sort_desc: 'created_at',
        limit: 10
      };
    QB.chat.dialog.list(params, function (error, dialogs) {
      for (let i = 0; i < dialogs.items.length; i++) {
        const item = dialogs.items[i];
        did=dialogs.items[i]._id;
        console.log(did);
      
        const name = item.name;
        const lastMessage = item.last_message;

        let chat = {
          name: name,
          lastMessage: lastMessage
        };
        
        chats.push(chat);
       
      }
      

      res.render("chat", { chats });
    });
    }
   

  });




app.get("/sendchat",(req,res,id)=>{
  console.log(did);
  QB.getSession(function (error, session) {
    var userId = session.session.user_id;
  var message = {
    type: "chat",
    body: "cc",
    extension: {
      save_to_history: 1,
      dialog_id:did
    },
    markable: 1
  };
  
  var opponentId = 137592330;
  try {
    message.id = QB.chat.send(opponentId, message);
  } catch (e) {
    if (e.name === 'ChatNotConnectedError') {
      // not connected to chat
    }
  }
  
  //...
  
  QB.chat.onMessageListener = onMessage;
  
  function onMessage(userId, message) {
    console.log("message send");
  }
});
});
app.get("/img",(req,res)=>{
 

var imagePath = __dirname + "/dog.jpg";

fs.stat(imagePath, function (statError, stats) {
  if (statError) {
    throw statError;
  }
  fs.readFile(imagePath, function (readError, data) {
    if (readError) {
      throw readError;
    }
    var fileParams = {
      file: data,
      name: "image.jpg",
      type: "image/jpeg",
      size: stats.size,
    };

    // upload
    // ...
  });
});
});
app.get("/message",(req,res)=>{
let di="6480a68f4067a22a0e000001";
var params = {
  chat_dialog_id: di,
  sort_desc: 'date_sent',
  limit: 100,
  skip: 0
};

QB.chat.message.list(params, function(error, messages) {
  
console.log(messages);
   

});
res.render("messages",{mess:mess });
});
 
app.get("/signup",(req,res)=>{
res.sendFile(__dirname+"/sign-up.html");

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
      done.fail("Create user error: " + JSON.stringify(error));
    } else {
    }
  });

});



app.listen("3000",()=>{
  console.log("working in port 3000");
})