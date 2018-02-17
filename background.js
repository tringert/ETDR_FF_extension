var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?etdr\.gov\.hu/;

// A function to use as callback
function doStuffWithDom(infos) {

	for (i = 0; i < infos.length; i++) { 
		
		downloading = browser.downloads.download({
			url : infos[i].link,
			filename : infos[i].filename,
			conflictAction : 'uniquify'
		});
	}
}

// When the browser-action button is clicked...
browser.browserAction.onClicked.addListener(function (tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
    }
});