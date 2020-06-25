var urlRegex = /\/(RDProcessAction\/ProcessActionEdit|RDProcessByUser\/ProcessEdit|ProcessByOffice\/ProcessEdit|ProcessAction\/ProcessActionEdit)/;
var urlRegexETDR = /\/(etdr.gov.hu|localhost:59057)/;
var browserVersion = '';

// When the browser-action button is clicked...
browser.browserAction.onClicked.addListener(async function (tab) {

    // Check the browser's version if this is a working version.
    // From version 67 to 69 the API's download() function won't include cookies in the requests (https://bugzilla.mozilla.org/show_bug.cgi?id=1555591)
    var gettingInfo = browser.runtime.getBrowserInfo();

    await gettingInfo.then(setBrowserVersion);

    if (browserVersion === '67' || browserVersion === '68') {
        chrome.tabs.sendMessage(tab.id, { text: 'not_supported_browser_version' }, doStuffWithDom);
    }

    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback to do the download
        chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDom);
    } else if (!urlRegex.test(tab.url) && urlRegexETDR.test(tab.url)) {
        // ...if not on the required page, then notify the user, that the download isn't available
        chrome.tabs.sendMessage(tab.id, { text: 'download_not_available' });
    }
});

// A function to use as callback
async function doStuffWithDom(jsonData) {
    var infos = JSON.parse(jsonData);

    // Set the folder name
    var downloadFolder = "# Letöltött ÉTDR dokumentumok/";
    var downloadPrefix = infos.processNumber === ""
        ? downloadFolder + currentDateTimeAsFolderName()
        : `${downloadFolder}${infos.processNumber.replace("/", "_")}_${currentDateTimeAsFolderName()}`;

    // Iterate through elements and start the download
    for (var i = 0; i < infos.docList.length; i++) {
        await dLoad(infos.docList[i][1], downloadPrefix + infos.docList[i][0]);
    }

    // Get the local storage to determine if a new install or an update occured
    var gettingItem = browser.storage.local.get();
    gettingItem.then((res) => {
        detectVersionChange(res.ETDR_ExtVersion, res.ETDR_ShowChangeLog);
    });
}

// Download method
async function dLoad(url, fileName) {
    var downloading = await browser.downloads.download({
        url: url,
        filename: fileName,
        conflictAction: 'uniquify'
    });
}

// When a new install or an update occured, show a changelog page to the user
function detectVersionChange(storedVersion, showChangelog) {
    // Get the extensions actual version from the manifest file
    var extVersion = browser.runtime.getManifest().version.replace(/\./g, "");

    // Check if the extension's version is stored in the local storage and if it is older than the current one. If yes, then store it and set to show the changelog.
    if (storedVersion === undefined || storedVersion < extVersion) {
        storeCurrentVersion(extVersion);
        storeShowChangelog(true);
        showChangelog = true;
    }

    // If the showing the changelog window isn't stored in the local storage, then store it and set it to show
    if (showChangelog === undefined) {
        storeShowChangelog(true);
        showChangelog = true;
    }

    // Show the changelog if necessary and store that next time the changelog window won't be displayed
    if (showChangelog) {
        openChangelog();
        storeShowChangelog(false);
    }
}

// Changelog window show value store
function storeShowChangelog(value) {
    browser.storage.local.set({
        ETDR_ShowChangeLog: value
    });
}

// Current extension's version store
function storeCurrentVersion(value) {
    browser.storage.local.set({
        ETDR_ExtVersion: value
    });
}

function currentDateTimeAsFolderName() {
    var dt = new Date();
    var year = ('0' + dt.getFullYear().toString()).slice(-4);
    var month = ('0' + (dt.getMonth() + 1).toString()).slice(-2);
    var day = ('0' + dt.getDate().toString()).slice(-2);
    var hour = ('0' + dt.getHours().toString()).slice(-2);
    var minutes = ('0' + dt.getMinutes().toString()).slice(-2);
    var seconds = ('0' + dt.getSeconds().toString()).slice(-2);

    return `${year} ${month} ${day}_${hour + minutes + seconds}/`;
}

function openChangelog() {
    let page = {
        type: "detached_panel",
        url: "backgroundpage.html",
        width: 800,
        height: 400
    };

    let creating = browser.windows.create(page);
}

// A function to send back the browser's version
function setBrowserVersion(browserInfo) {
    browserVersion = browserInfo.version.slice(0, 2);
}

