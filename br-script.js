var gameLobbyIdCurrent = "";
function addSecondListener(str) {
  var parsed = {};
  try {
    parsed = JSON.parse(str);
    console.log(parsed);
  }
  catch {
    console.log(str);
    console.error("error parsing");
  }
  try {
    if (parsed["gameLobbyId"]) {
      console.log(parsed["gameLobbyId"]);
      gameLobbyIdCurrent = parsed["gameLobbyId"];
      browser.webRequest.onBeforeRequest.removeListener(listenerTwo);
      browser.webRequest.onBeforeRequest.addListener(
        listenerTwo,
        {
          urls: [
            "*://game-server.geoguessr.com/api/battle-royale/" +
              parsed["gameLobbyId"] +
              "/*",
          ],
        },
        ["blocking"]
      );
    }
  }
  catch {
    
    console.error("error not parsing");
  }
   
}



function listener(details) {
  console.log("peepee");
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = (event) => {
    let str = decoder.decode(event.data, { stream: true });

    addSecondListener(str);

    filter.write(encoder.encode(str));
    filter.close();
  };
  filter.close();

  return {};
}

async function storeThings(parsed) {
  const key2 = await import("./apiKey.js");
  const key = key2["default"];
  //console.log(key);
  const request = new XMLHttpRequest();
  request.open(
    "POST",
    "https://data.mongodb-api.com/app/data-ttjwi/endpoint/data/v1/action/updateOne"
  );
  request.setRequestHeader("Content-Type", "application/json");
  //request.setRequestHeader("Access-Control-Request-Headers", "*");
  request.setRequestHeader("api-key", key);
  //console.log(key);

  const objectToStore = {
    "gameid": gameLobbyIdCurrent,
  };
  objectToStore[gameLobbyIdCurrent] = parsed["rounds"];

  const objectToSend = {
    dataSource: "Cluster0",
    database: "geoguessr",
    collection: "games",
    filter: { "gameid": gameLobbyIdCurrent },
    update: {
      $set: {
        document: objectToStore,
      },
    },
    upsert: true,
  };
  request.send(JSON.stringify(objectToSend));
}

function listenerTwo(details) {
  console.log("loaded listener");
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = (event) => {
    let str = decoder.decode(event.data, { stream: true });
    //console.log(str);
    try {
      const parsed = JSON.parse(str);
      //console.log(parsed);
      if (parsed["rounds"]) {
        storeThings(parsed);
        //console.log(parsed["rounds"]);
        const currentRound = parsed["rounds"][parsed["rounds"].length - 1];
        if (currentRound) {
          //console.log(currentRound);
          console.log(currentRound["lat"]);
          console.log(currentRound["lng"]);
          const gMapsString =
            "https://www.google.com/maps/search/" +
            currentRound["lat"] +
            "," +
            currentRound["lng"];
          console.log(gMapsString);
        }
      }
    } catch {
      console.log(str);
      console.error("error parsing");
    }
    filter.write(encoder.encode(str));
    filter.close();
  };
  filter.close();
}
browser.webRequest.onBeforeRequest.addListener(
  listener,
  { urls: ["*://game-server.geoguessr.com/api/lobby/join-random*"] },
  ["blocking"]
);

console.log("loaded");
