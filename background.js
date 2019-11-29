var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?etdr\.gov\.hu\/(RDProcessAction\/ProcessActionEdit|RDProcessByUser\/ProcessEdit|ProcessByOffice\/ProcessEdit|ProcessAction\/ProcessActionEdit)/;
var browserVersion = '';

// A function to use as callback
async function doStuffWithDom(jsonData) {

    var infos = JSON.parse(jsonData);

    // Set the folder name
    var downloadPrefix = infos.processNumber === "" ? "" : infos.processNumber + "/";

    // Iterate through elements and start the download
    for (i = 0; i < infos.loc.length; i++) {

        await dLoad(infos.loc[i].link, downloadPrefix + infos.loc[i].filename);
    }
}

// Download method
async function dLoad(url, fileName) {
    var downloading = await browser.downloads.download({
        url: url,
        filename: fileName,
        conflictAction: 'uniquify'
    });
}

// A function to send back the browser's version
function setBrowserVersion(browserInfo) {
    browserVersion = browserInfo.version.slice(0, 2);
}

// When the browser-action button is clicked...
browser.browserAction.onClicked.addListener(async function (tab) {

    // Check the browser's version if this is a working version.
    // From version 67 to 69 the API's download() function won't include cookies in the requests (https://bugzilla.mozilla.org/show_bug.cgi?id=1555591)
    var gettingInfo = browser.runtime.getBrowserInfo();

    await gettingInfo.then(setBrowserVersion);

    if (browserVersion === '67' || browserVersion === '68') {
        chrome.tabs.sendMessage(tab.id, { text: 'not_supported_browser_version' }, doStuffWithDom);
        return;
    }

    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDom);
    }
});