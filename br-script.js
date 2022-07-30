
var gameLobbyIdCurrent = "";
function listener(details) {
  console.log("peepee");
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = (event) => {
    let str = decoder.decode(event.data, { stream: true });

    try {
      const parsed = JSON.parse(str);
      console.log(parsed);
      if (parsed["gameLobbyId"]) {
        console.log(parsed["gameLobbyId"]);
        gameLobbyIdCurrent = parsed["gameLobbyId"];
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
    } catch {
      console.error("error parsing");
    }

    filter.write(encoder.encode(str));
    filter.close();
  };
  filter.close();

  return {};
}

function storeThings(parsed) {
  const objectToStore = {};
  objectToStore[gameLobbyIdCurrent] = parsed["rounds"];
  return objectToStore;
}


function listenerTwo(details) {
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
        
        browser.storage.local.set(storeThings(parsed));
        //console.log(parsed["rounds"]);
        const currentRound = parsed["rounds"][parsed["rounds"].length - 1];
        if (currentRound) {
          //console.log(currentRound);
          console.log(currentRound["lat"]);
          console.log(currentRound["lng"]);
          const gMapsString = "https://www.google.com/maps/search/"+ currentRound["lat"] + ","+ currentRound["lng"];
          console.log(gMapsString);
        }
      }
    } catch {
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
