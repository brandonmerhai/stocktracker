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
const {exec} = require("child_process");

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
  
});

document.getElementById("logout").onclick = () => {
  authProcess.createLogoutWindow();
  remote.getCurrentWindow().close();
};

document.getElementById("search-stock-overview").onclick = () => {
  var inputData = document.getElementById("stock-input-name").value;
  var T = document.getElementById("stock-card");
  T.style.display = "block";

  console.log(inputData);
  document.getElementById("stock-overview-name-center").innerHTML = "Result for " + inputData + ":";

  const seed = "https://www.alphavantage.co/query?function=OVERVIEW&symbol="
  var query = seed + inputData + "==API_KEY=="
  var result_data;

  
  async function getData(){
    const response = await fetch(query)
    const data = await response.json()
    console.log(data)

    document.getElementById("stock-card-title").innerText=data["Name"]
    document.getElementById("stock-card-subtitle").innerText=data["Symbol"] + " | " + data["AssetType"] + " | " + data["Sector"]
    document.getElementById("stock-card-description").innerText=data["Description"]

  }

  getData()

  document.getElementById('add-tracker').onclick = () => {
    var inputData = document.getElementById("stock-input-name").value;
    stocks.add_stock(inputData);
  }

  var initiateTwint = document.createElement("button")
  document.getElementById("twitter").appendChild(initiateTwint)
  initiateTwint.id = "twint";
  initiateTwint.className = "btn btn-primary";
  initiateTwint.innerHTML = "Trending Tweets";

  document.getElementById("twint").onclick = () => {
    exec(`twint -s "${inputData}" --verified --limit 100 -o ${inputData}.txt -pt`, (error, stdout, stderr) => {
      if (error){
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr){
        console.log(`stderr: ${stderr}`);
      }

      listframe = document.createElement('ul')
      listframe.className = "list-group"
      document.getElementById("twitter").appendChild(listframe)

      var linereader = require('readline').createInterface({
        input: require('fs').createReadStream(`${inputData}.txt`)
      });

      linereader.on('line', function (line){
        console.log(line)
        let li = document.createElement('li')
        li.className = "list-group-item"
        listframe.appendChild(li)
        li.innerText += line
      })
    })

  }

};
