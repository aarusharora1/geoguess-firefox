function listener(details) {
  console.log("peepee");
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = (event) => {
    let str = decoder.decode(event.data, { stream: true });
    // Just change any instance of Example in the HTTP response
    // to WebExtension Example.
    //console.log(str);
    const newString = str.substring(str.indexOf("(") + 1, str.length-1);
    //console.log(newString);
    const parsed = JSON.parse(newString);
    console.log(parsed);
    if (parsed) {
        if (parsed[1]) {
            
        }
    }
    filter.close();
  };
  filter.close();

  return {};
}
browser.webRequest.onBeforeRequest.addListener(
  listener,
  { urls: ["*://*.maps.googleapis.com/maps/api/js*"] },
  ["blocking"]
);

console.log("dkjgd");
