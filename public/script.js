const APPLICATION_ID = 100874;
const AUTH_KEY ="SPQ9xHeaYDXDPyr";
const AUTH_SECRET = "cTfJ5zMC2EtY4br";
const ACCOUNT_KEY = "Rh3yj3_WxyFti936KMKb";
const CONFIG = { debug: true };
QB.init(APPLICATION_ID, AUTH_KEY, AUTH_SECRET, ACCOUNT_KEY, CONFIG);
let searchInput = document.getElementById('search-input');
let searchResults = document.getElementById('search-results');
const users = [];
const chats = [];
var messages = [];
let ids ;
let idu ;
var dialogId = "";
var opponentId;
var chatname="";
$(document).ready(function() {
  $.ajax({
    url:"/chats",
    method:"get",
    success:function(response){
     if (JSON.stringify(response) !== JSON.stringify(chats)){
    
      let html = "";
      response.forEach((chat) => {
        html += `
          <a name="${chat.id}" id ="ch">
          <input type="hidden" id="oc" value="${chat.ouccup}"> 
            <div class="message">
              <div class="avatar">
                <img src="https://i.pravatar.cc/40?img=3" alt="John's Profile Picture">
              </div>
              <div class="message-content">
                <div class="sender">${chat.name}</div>
                <div class="content">${chat.lastMessage ? chat.lastMessage : "No messages"}</div>
              </div>
            </div>
          </a>
        `;
      });

      document.getElementById("chatContainer").innerHTML = html;
     }
    },
    error: function(error){
   
    }
   })
  $('.container').hide();
  $.ajax({
    url: '/us', 
    method: 'GET',
    success: function(response) {
   
      var userList = response.users;
      var userListElement = $('#user-list');
      userList.forEach(function(user) {
       pl={ name:user.user.full_name,id:user.user.id}
       users.push( pl );
                
      });
    
    },
    error: function(error) {
      console.error('Error retrieving user list:', error);
    }
  });
  $.ajax({
    url: "/sessinf",
    method: "GET",
    success: function(data) {
      messages = data.messages;
      const userCredentials = {
        userId: data.id,
        password: data.sessio
      };
      idu = data.id;
      QB.startSessionWithToken(data.sessio, function(err, mySession) {
        if (err) {
          console.log('Error in start session with token');
        } else {
          console.log('Session data:', mySession);
          QB.chat.connect(userCredentials, (error, result) => {
            if (error) {
              console.error("Error connecting to chat:", error);
            } else {
              console.log("Chat connection successful:", result);
               idu = userCredentials.userId;
           
            }
          });
        }
      });
    },
    error: function(error) {
      console.error("Error:", error);
    }
  });
  $.ajax({
    url:"/chats",
    method:"get",
    success:function(response){
     response.forEach((ele)=>{
      chats.push(ele);
     });
    },
    error: function(error){
      alert(error);
    }
   });
  
});
searchInput.addEventListener('input', handleSearch);

function handleSearch() {
  searchResults.innerHTML = '';

  const searchQuery = searchInput.value.trim().toLowerCase();

  if (searchQuery.length >= 3) {
    
    const filteredUsers= users.filter(user => user.name.toLowerCase().includes(searchQuery));

    filteredUsers.forEach(user => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '/cr/' + user.id;
      a.textContent = user.name;
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }
}
let x;

  QB.chat.onMessageListener = function(idu, message) {
    $.ajax({
      url:"/chats",
      method:"get",
      success:function(response){
       if (JSON.stringify(response) !== JSON.stringify(chats)){
      
        let html = "";
        response.forEach((chat) => {
          html += `
            <a name="${chat.id}" id ="ch">
            <input type="hidden" id="oc" value="${chat.ouccup}"> 
              <div class="message">
                <div class="avatar">
                  <img src="https://i.pravatar.cc/40?img=3" alt="John's Profile Picture">
                </div>
                <div class="message-content">
                  <div class="sender">${chat.name}</div>
                  <div class="content">${chat.lastMessage ? chat.lastMessage : "No messages"}</div>
                </div>
              </div>
            </a>
          `;
        });
  
        document.getElementById("chatContainer").innerHTML = html;
       }
      },
      error: function(error){
     
      }
     })
     $.ajax({
      url:"/msgs/"+x,
      method:"get",
      success: function(response) {
        response.forEach((ele) => {
          console.log(ele.msg)
          messages.push(ele.msg);
        });
        console.log(messages);
      
        let html = "";
        response.forEach((message) => {
          if (message.send===idu){
            html += 
           `
            <div class="message message-content">
              <div class="message-content">${message.msg}</div>
            </div>
          `;
          }
          else { html += 
            `          <div class="receiver message-content">
            <div class="message-content">${message.msg}</div>
          </div>`
          }
         
  
        
        });
       
        document.getElementById("msgs").innerHTML = html;
      },
      error: function(error){
        alert(error);
      }
     })
}

$(document).on('click', '.chat a', function() {
  x = $(this).attr('name');
  ids = $(this).find("#oc").val().split(",");
  chatname=$(this).find('.sender').text();

 $(".conversation-name").text(chatname);
  if (Number(ids[0]) === idu) {
    opponentId = Number(ids[1]);
  } else {
    opponentId = Number(ids[0]);
  }
  
  $.ajax({
    url: "/msgs/" + x,
    method: "get",
    success: function(response) {
      response.forEach((ele) => {
        messages.push(ele.msg);
      });
     
      $('.container').show();
      let html = "";
      response.forEach((message) => {
        if (message.send===idu){
          html += 
         `
          <div class="message message-content">
            <div class="message-content">${message.msg}</div>
          </div>
        `;
        }
        else { html += 
          `          <div class="receiver message-content">
          <div class="message-content">${message.msg}</div>
        </div>`
        }
       

      
      });
      
      document.getElementById("msgs").innerHTML = html;
    },
    error: function(error) {
      alert(error);
    }
  });
});


$("#bt").on("click", function() {
 let y=$("#ss").val();
    if (y.length !== 0 && (x)) {
      var message = {
        type: "chat",
        body: y,
        extension: {
          save_to_history: 1,
          dialog_id: x
        },
        markable: 1
      };
     
    
     
      
      try {
        message.id = QB.chat.send(opponentId, message);
        $.ajax({
          url:"/chats",
          method:"get",
          success:function(response){
           if (JSON.stringify(response) !== JSON.stringify(chats)){
          
            let html = "";
            response.forEach((chat) => {
             
              html += `
              <a name="${chat.id}" id ="ch">
              <input type="hidden" id="oc" value="${chat.ouccup}"> 
                  <div class="message">
                    <div class="avatar">
                      <img src="https://i.pravatar.cc/40?img=3" alt="John's Profile Picture">
                    </div>
                    <div class="message-content">
                      <div class="sender">${chat.name}</div>
                      <div class="content">${chat.lastMessage ? chat.lastMessage : "No messages"}</div>
                    </div>
                  </div>
                </a>
              `;
            });
      
            document.getElementById("chatContainer").innerHTML = html;
            $("#ss").val("");
            $.ajax({
              url:"/msgs/"+x,
              method:"get",
              success: function(response) {
                response.forEach((ele) => {
                  messages.push(ele.msg);
                });
                console.log(messages);
               
                let html = "";
                response.forEach((message) => {
                  if (message.send===idu){
                    html+=
                   `
                    <div class="message message-content">
                      <div class="message-content">${message.msg}</div>
                    </div>
                  `;
                  }
                  else { html += 
                    `          <div class="receiver message-content">
                    <div class="message-content">${message.msg}</div>
                  </div>`
                  }
                 
        
                
                });
              
                document.getElementById("msgs").innerHTML = html;
              },
              error: function(error){
                alert(error);
              }
             })
           }
          },
          error: function(error){
         
          }
         })
      } catch (e) {
        if (e.name === 'ChatNotConnectedError') {
         
        }
      }
    
    } else {
      alert("No dialogId selected");
    }

});

$("#lg").on("click",()=>{
  QB.logout(function(error) {
    QB.destroySession(function(error) {
      
    });
    window.location.href=("/logout");
  });
});

