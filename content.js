// Listen for messages
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // ... call the specified callback, passing
        // the data back to the background page
        sendResponse(getDownloadInfo());
    }
});

// Get the info for download
function getDownloadInfo(){
	
    var links = document.querySelectorAll('#uploadedDocs_DXMainTable a');
    var infos = [];

    for (link of links) {
        let href = link.getAttribute('href');
        infos.push({ link: `https://teszt.etdr.gov.hu${href}` });
    }

    var text = document.querySelectorAll('#uploadedDocs_DXMainTable tr');

    var tt = [];

    for (i = 0; i < infos.length; i++) {

        let item = text[i + 1].cells[1].innerText;
        infos[i].filename = item
    }

    return infos;
}
