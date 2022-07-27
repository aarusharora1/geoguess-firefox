function listener(details) {
    console.log("peepee");
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = event => {
        let str = decoder.decode(event.data, { stream: true });
        // Just change any instance of Example in the HTTP response
        // to WebExtension Example.
        console.log(str);
 
    //    const newThing = str.substring(str.indexOf("(") + 1);
    //    console.log(newThing);
    //    const parsed = JSON.parse(newThing);
    //    console.log(parsed);
    //     if (str[1]) {
    //         if (str[1][0][5]) {
    //             console.log(str[1][0][5][0][1][0]);
    //         }
    //     }
        filter.write(encoder.encode(str));
        filter.close();
    }
    filter.close();

    return {};
}
browser.webRequest.onBeforeRequest.addListener(
    listener,
    { urls: ["*://*.maps.googleapis.com/*"], },
    ["blocking"]
);

console.log("dkjgd");