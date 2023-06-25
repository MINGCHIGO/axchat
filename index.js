const firebaseConfig = {
  apiKey: "AIzaSyCWKnrOEbRCsgi01XUPr-ibuojqcnTLls4",
  authDomain: "axchat-90bce.firebaseapp.com",
  databaseURL: "https://axchat-90bce-default-rtdb.firebaseio.com",
  projectId: "axchat-90bce",
  storageBucket: "axchat-90bce.appspot.com",
  messagingSenderId: "306713597427",
  appId: "1:306713597427:web:2adfcf6a519c2635c52e86",
  measurementId: "G-DZ1X1VEMD3"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var username = "";
var pic = "";
var role = "";
var roleColor = "";
var viewedChat = "";
var viewedMessages = "";
var msgBox = document.getElementById("messageBox");
var topbar = document.getElementById("topbar");
var chatMsgs = document.getElementById("messages");
var gcMsgs;
var gcRef = database.ref('chats/');
var lastMessage;
var bottomScroll = "<div id='bottomScroll'></div>";
var gcSettingsOpen = false;
var settingsOpen = false;
var gcSettingsDiv = document.getElementById("gcSettings");
var settingsDiv = document.getElementById("settings");
var r = document.querySelector(":root");
var primaryTheme = "#ff1b2d";
var secondaryTheme = "#eb1527";
var theme = "dark";
var invitesOpen = 0;

setTimeout(initColors, 500);

setInterval(updateSettings, 500);
setInterval(updateColors, 500);
setInterval(checkGc, 1000);

database.ref('chats/' + viewedChat).on('child_changed', (snapshot) => {
  if (snapshot.child("lastmessage").val() != lastMessage) {
    lastMessage = snapshot.child("lastmessage").val();
    chatMsgs.innerHTML += snapshot.child("lastmessage").val();
    if (document.getElementById("messages").scrollHeight - document.getElementById("messages").scrollTop < 1000) {
      scrollDown();
    }
  }
});

msgBox.addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    send();
  }
});

document.getElementById("usernameInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    checkLogin();
  }
});

document.getElementById("pwdInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    checkLogin();
  }
});

document.querySelector("#sideButton").style.display = "none";
document.querySelector("#sidebar").style.display = "none";
document.querySelector("#settingsButton").style.display = "none";

function updateSettings() {
  document.querySelector(".settingsPfp").setAttribute("src", pic);
  document.querySelector("#settingsUsername").innerText = username;
}

function notif(html, length) {
  var notif = document.createElement("div");
  if (length == null) {
    length = 3000;
  }
  notif.setAttribute("class", "notif");
  notif.innerHTML = html;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = 1;
  }, 500)
  setTimeout(() => {
    notif.style.opacity = 0;
  }, length);
}

function toggleStartup() {
  if (document.querySelector("#loginHeader").innerText == "Log In") {
    document.querySelector('#loginHeader').innerText = 'Sign Up';
    document.querySelector('#accountToggle a').innerText = 'Log In!';
    document.querySelector('#accountToggle p').innerText = 'Have an account?';
    document.querySelector('#startup button').innerText = "Sign Up";
  } else {
    document.querySelector('#loginHeader').innerText = 'Log In';
    document.querySelector('#accountToggle a').innerText = 'Sign Up!';
    document.querySelector('#accountToggle p').innerText = 'No account?';
    document.querySelector('#startup button').innerText = "Log In";
  }
}

function checkLogin() {
  if (document.getElementById("usernameInput").value == "") {
    notif("Please enter a username!");
  } else {
    if (document.querySelector("#loginHeader").innerText == "Log In") {
      login(document.getElementById("usernameInput").value, document.getElementById("pwdInput").value);
    } else {
      signUp(document.getElementById("usernameInput").value, document.getElementById("pwdInput").value, "https://i.ibb.co/k9vWX7V/download-5.png");
    }
  }
}

if (localStorage.getItem("username") != null) {
  login(localStorage.getItem("username"), localStorage.getItem("password"));
}

function hideStartup() {
  document.getElementById("startup").style.opacity = 0;
  document.getElementById("chat").style.display = "block";
  setTimeout(() => {
    document.getElementById("chat").style.opacity = 1;
    document.getElementById("startup").style.display = "none";
  }, 500);
  document.querySelector("#sideButton").style.display = "block";
  document.querySelector("#sidebar").style.display = "block";
  document.querySelector("#settingsButton").style.display = "block";

}

function signUp(user, password, pic) {
  database.ref("users/" + user).get().then((snapshot) => {
    if (snapshot.exists()) {
      notif("That name is in use!");
    } else {
      database.ref("users/" + user).set({
        username: user,
        password: password,
        role: "",
        roleColor: "#ffffff",
        profilePicture: pic,
        primaryTheme: "#ff1b2d",
        secondaryTheme: "#eb1527",
        theme: "dark"
      });
      notif("Sign up complete!");
      login(user, password);
      viewedChat = "AxChat Info";
      inviteUser(user, false);
    }
  });
}

function login(user, password) {
  database.ref().child("users").child(user).get().then((snapshot) => {
    if (snapshot.exists()) {
      if (snapshot.child("password").val() == password) {
        username = snapshot.child("username").val();
        pic = snapshot.child("profilePicture").val();
        role = snapshot.child("role").val();
        roleColor = snapshot.child("roleColor").val();
        primaryTheme = snapshot.child("primaryTheme").val();
        secondaryTheme = snapshot.child("secondaryTheme").val();
        theme = snapshot.child("theme").val();
        localStorage.setItem("username", username);
        localStorage.setItem("password", snapshot.child("password").val());
        hideStartup();
      } else {
        notif("Password Incorrect!");
      }
    } else {
      notif("User not found!");
    }
  }).catch((error) => {
    console.error(error);
  });
}

function newGc(name, pic) {
  database.ref("chats/" + name).get().then((snapshot) => {
    if (snapshot.exists()) {
      notif("Chat with that name already exists!");
    } else {
      database.ref("chats/" + name).set({
        name: name,
        users: [username],
        picture: pic,
        messages: [""]
      });
    }
  })
}

function sendMsg(message) {
  database.ref("chats/" + viewedChat + "/messages").get().then((msgs) => {
    viewedMessages = msgs.val();
    viewedMessages.push(message);
    database.ref("chats/" + viewedChat + "/messages").set(viewedMessages);
  });
  database.ref("chats/" + viewedChat + "/lastmessage").set(message);
}

function send() {
  var msg = msgBox.value;
  if (msg != "") {
    var date = new Date();
    var hr = date.getHours();
    var min = date.getMinutes();
    if (date.getHours() < 10) {
      hr = "0" + date.getHours();
    }
    if (date.getMinutes() < 10) {
      min = "0" + date.getMinutes();
    }
    var time = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + hr + ":" + min;
    var fullMsg = "<div class='msg'><img class='pfp' src='" + pic + "'><div class='msgTop'><div class='msgName'><span class='role' style='color:" + roleColor + "; text-shadow: 0px 0px 5px " + roleColor + "'>" + role + "</span> " + username + "</div><div class='msgTime'>" + time + "</div></div><div class='msgContent'>" + msg + "</div></div>";
    if (lastMessage != undefined) {
      if (lastMessage.includes("<img class='pfp' src='" + pic + "'><div class='msgTop'><div class='msgName'><span class='role' style='color:" + roleColor + "; text-shadow: 0px 0px 5px " + roleColor + "'>" + role + "</span> " + username + "</div><div class='msgTime'>" + time + "</div></div>") || lastMessage.includes("<copied " + username + ">")) {
        fullMsg = "<div class='msg repeated'><div class='msgContent'>" + msg + "</div></div><copied " + username + ">";
      }
    }
    if (fullMsg != lastMessage) {
      sendMsg(fullMsg);
    }
    msgBox.value = "";
  }
}

function scrollDown() {
  if (document.getElementById("bottomScroll") != null) {
    document.getElementById("bottomScroll").remove();
  }
  chatMsgs.innerHTML += bottomScroll;
  document.getElementById("bottomScroll").scrollIntoView({
    behavior: "smooth"
  });
}

function gcClicked(name) {
  chatMsgs.style.opacity = 0;
  topbar.style.opacity = 0;
  setTimeout(() => {
    chatMsgs.style.opacity = 0;
    topbar.style.opacity = 0;
    viewedChat = name;
    database.ref().child("chats").child(name).child("messages").get().then((snapshot) => {
      topbar.innerHTML = name;
      chatMsgs.innerHTML = "";
      for (i = 0; i < snapshot.val().length; i++) {
        chatMsgs.innerHTML += snapshot.val()[i];
      }
      scrollDown();
    });
  }, 500);

  setTimeout(() => {
    chatMsgs.style.opacity = 1;
    topbar.style.opacity = 1;
  }, 500);
}

function checkGc() {
  gcRef.on('child_added', (snapshot) => {
    const gcName = snapshot.val().name;
    const gcPic = snapshot.val().picture;
    if (snapshot.val().users.includes(username)) {

      var gcImg = document.createElement("div");
      gcImg.innerHTML = "<img src='" + gcPic + "' class='gcImg'><p>" + gcName + "</p>";
      gcImg.classList = "gcImgDiv";
      gcImg.setAttribute("onclick", "gcClicked('" + gcName + "')");
      var oldHTML = document.getElementById("sidebar").innerHTML;
      if (document.getElementById("sidebar").innerHTML.includes(gcImg.innerHTML)) {} else {
        if (oldHTML == "") {
          gcClicked(gcName);
        }
        document.getElementById("sidebar").appendChild(gcImg);
      }
    }
  });
}

function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
	location.reload();
}

function gcSettings() {
  if (gcSettingsOpen) {
    gcSettingsDiv.style.width = "0";
    gcSettingsDiv.style.height = "0";
    document.querySelector("#sideText").style.transform = "rotate(0)";
    gcSettingsOpen = false;
  } else {
    gcSettingsDiv.style.width = "100%";
    gcSettingsDiv.style.height = "calc(100% - 57px)";
    document.querySelector("#sideText").style.transform = "rotate(45deg)";
    gcSettingsOpen = true;
    settingsDiv.style.width = "0";
    settingsDiv.style.height = "0";
    document.querySelector("#settingsButton").style.transform = "rotate(0)";
    settingsOpen = false;
  }
}

function settings() {
  if (settingsOpen) {
    settingsDiv.style.width = "0";
    settingsDiv.style.height = "0";
    document.querySelector("#settingsButton").style.transform = "rotate(0)";
    settingsOpen = false;
  } else {
    settingsDiv.style.width = "100%";
    settingsDiv.style.height = "calc(100% - 57px)";
    document.querySelector("#settingsButton").style.transform = "rotate(90deg)";
    settingsOpen = true;
    gcSettingsDiv.style.width = "0";
    gcSettingsDiv.style.height = "0";
    document.querySelector("#sideText").style.transform = "rotate(0)";
    gcSettingsOpen = false;
  }
}

function updateColors() {
  r.style.setProperty('--primary', primaryTheme);
  r.style.setProperty('--secondary', secondaryTheme);
  if (theme == "dark") {
    r.style.setProperty('--dark', "#1d1d1d");
    r.style.setProperty('--darker', "#151515");
    r.style.setProperty('--light', "#dddddd");
    r.style.setProperty('--white', "#eeeeee");
    r.style.setProperty('--black', "#111111");
  } else {
    r.style.setProperty('--light', "#1d1d1d");
    r.style.setProperty('--darker', "#e5e5e5");
    r.style.setProperty('--dark', "#dddddd");
    r.style.setProperty('--black', "#eeeeee");
    r.style.setProperty('--white', "#111111");
  }
}

function saveTheme() {
  primaryTheme = document.querySelector("#primaryColorPick").value;
  secondaryTheme = document.querySelector("#secondaryColorPick").value;
  if (document.querySelector(".checkbox").checked) {
    theme = "light";
  } else {
    theme = "dark";
  }
  database.ref('users/' + username + "/primaryTheme").set(primaryTheme);
  database.ref('users/' + username + "/secondaryTheme").set(secondaryTheme);
  database.ref('users/' + username + "/theme").set(theme);
}

function saveProfile() {
  if (document.querySelector("#changePfp").value != "") {
    pic = document.querySelector("#changePfp").value;
    database.ref('users/' + username + "/profilePicture").set(pic);
    notif("Changes saved!");
  }
  database.ref('users/' + username + "/password").set(document.querySelector("#changePwd").value);
  localStorage.setItem("password", document.querySelector("#changePwd").value);
  document.querySelector("#changePfp").value = "";
  document.querySelector("#changePwd").value = "";
  notif("Changes saved!");
}

function newChat() {
  if (document.querySelector("#gcName").value != "") {
    newGc(document.querySelector("#gcName").value, document.querySelector("#gcPic").value);
    notif("Chat created!");
  } else {
    notif("Please enter a name!");
  }
  document.querySelector("#gcName").value = "";
  document.querySelector("#gcPic").value = "";
}

function initColors() {
  document.querySelector("#primaryColorPick").value = primaryTheme;
  document.querySelector("#secondaryColorPick").value = secondaryTheme;
  document.querySelector(".checkbox").checked = (theme == "light");
}

function inviteSettings() {
  document.querySelector("#inviteSettings").style.opacity = invitesOpen;
  if (invitesOpen == 1) {
    invitesOpen = 0;
  } else {
    invitesOpen = 1;
  }
}

function inviteUser(user, msg) {
  database.ref('chats/' + viewedChat + "/users").get().then((data) => {
    var users = data.val()
    if (users.includes(user)) {
      notif("User already in this chat!");
    } else {
      users.push(user);
      database.ref('chats/' + viewedChat + "/users").set(users);
      if (msg) {
        notif("User added!");
      }
    }
    document.querySelector("#inviteUsername").value = "";
  });
}
