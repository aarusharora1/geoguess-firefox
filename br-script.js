function listener(details) {
    console.log("peepee");
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();
  
    filter.ondata = event => {
      let str = decoder.decode(event.data, {stream: true});
      // Just change any instance of Example in the HTTP response
      // to WebExtension Example.
        console.log(str);
        
      filter.close();
    }
    filter.close();
  
    return {};
  }
  browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://*.maps.googleapis.com/*"], },
    ["blocking"]
  );

  console.log("dkjgd");