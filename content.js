// Listen for messages
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // ... call the specified callback, passing
        // the data back to the background page
        sendResponse(getAllHrefs());
    }
});

// Get the info for download
function getAllHrefs(){
	
	var links = document.querySelectorAll('#uploadedDocs_DXMainTable a');
	var hrefs = [];

	for(link of links){
		let href = link.getAttribute('href');
		hrefs.push(`https://teszt.etdr.gov.hu${href}`);
	}
	return hrefs;
}
