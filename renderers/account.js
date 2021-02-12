const { remote } = require("electron");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';
const axios = require("axios");
const authService = remote.require("./services/auth-service");
const authProcess = remote.require("./main/auth-process");
let $ = require('jquery');
const { sheets } = require("googleapis/build/src/apis/sheets");
const TrackedStocks = require('./TrackedStocks.js');
const cron = require('cron').CronJob;

const webContents = remote.getCurrentWebContents();

const stocks = new TrackedStocks({
  configName: 'user-preferences',
  defaults: {
    windowBounds: {width: 800, height: 600}
  }
})

webContents.on("dom-ready", () => {
  const profile = authService.getProfile();
  document.getElementById("picture").src = profile.picture;
  document.getElementById("name").innerText = profile.name;
  const tracked_stocks = stocks.get("stocks");
  
  function generateOptions(){
    options = ''
    tracked_stocks.forEach(function (item){
      options += "<option value='"+item+"'>"+item+"</option>";
    }); return options;
  }
  var newDiv = document.createElement('div')
  var html = '<select id="ticker_options">', options = generateOptions();
  html += options;
  html += '</select>';
  newDiv.innerHTML = html
  document.getElementById("email-alerts").appendChild(newDiv);

  var set_alert_button = document.createElement("button")
  set_alert_button.className = "btn btn-outline-primary"
  set_alert_button.id = "set-alert-button"
  set_alert_button.innerHTML = "Create Alert"

  document.getElementById("email-alerts").appendChild(set_alert_button)

  document.getElementById('set-alert-button').onclick = () => {
    var inputData = document.getElementById("alert-input").value;
    var ticker = document.getElementById("ticker_options")
    var selected = ticker.options[ticker.selectedIndex].text
    console.log(selected)

    var SCOPES = [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send'
  ];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';
    
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), sendMessage);
    });

    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
      
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getNewToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });
      }

      function makeBody(to, from, subject, message) {
        var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", to, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message
        ].join('');
    
        var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
            return encodedMail;
    }
    
    function sendMessage(auth) {
        var raw = makeBody('==RECIPIENT EMAIL==', '==SENDER EMAIL==', selected, `You are receiving this email because you set an alert for ${selected}.`);
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                raw: raw
            }
        
        }, function(err, response) {
            return(err || response)
        });
    }
    
    
}
});

document.getElementById("logout").onclick = () => {
    authProcess.createLogoutWindow();
    remote.getCurrentWindow().close();
  };

document.getElementById('authorize-alerts-button').onclick = () => {
    var inputData = document.getElementById("alert-input").value;

    var SCOPES = [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send'
  ];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';
    
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), sendMessage);
    });

    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
      
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getNewToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });

        oAuth2Client.getToken(inputData, (err, token) => {
            if (err) {
              console.log(err);
              return console.error('Error retrieving access token', err);
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) {
                console.log(err);
                return console.error(err);
              }
              console.log('Token stored to', TOKEN_PATH);
              console.log("Successful")
            });
            callback(oAuth2Client);
          });

          
      }

      function makeBody(to, from, subject, message) {
        var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", to, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message
        ].join('');
    
        var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
            return encodedMail;
    }
    
    function sendMessage(auth) {
        var raw = makeBody('==RECIPIENT EMAIL==', '==SENDER EMAIL==', '==SUBJECT==', '==BODY==');
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                raw: raw
            }
        
        }, function(err, response) {
            return(err || response)
        });
    }
    
    
}

document.getElementById('signup-alerts-button').onclick = () => {
    // If modifying these scopes, delete token.json.
    var SCOPES = [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send'
  ];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';
    
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), sendMessage);
    });
    
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);
    
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
      });
    }
    
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getNewToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      require('electron').shell.openExternal(authUrl);
    }

    function makeBody(to, from, subject, message) {
      var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
          "MIME-Version: 1.0\n",
          "Content-Transfer-Encoding: 7bit\n",
          "to: ", to, "\n",
          "from: ", from, "\n",
          "subject: ", subject, "\n\n",
          message
      ].join('');
  
      var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
          return encodedMail;
  }
  
  function sendMessage(auth) {
      var raw = makeBody('==RECIPIENT EMAIL==', '==SENDER EMAIL==', '==SUBJECT==', '==BODY==');
      const gmail = google.gmail({version: 'v1', auth});
      gmail.users.messages.send({
          auth: auth,
          userId: 'me',
          resource: {
              raw: raw
          }
      
      }, function(err, response) {
          return(err || response)
      });
  }

    
}
    