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

  const tracked_stocks = stocks.get("stocks")
  ul = document.createElement('ul');
  document.getElementById('stock-list').appendChild(ul);

  tracked_stocks.forEach(function (item) {
      console.log(item)
      let li = document.createElement('li')
      ul.appendChild(li);
      li.innerHTML += item;
  });

});

document.getElementById("logout").onclick = () => {
    authProcess.createLogoutWindow();
    remote.getCurrentWindow().close();
  };