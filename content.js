// Listen for messages
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // Temporary solution until Mozilla fixes the download API error (https://bugzilla.mozilla.org/show_bug.cgi?id=1555591)
	alert("A kiegészítő a Firefox 67-es verziójától fennálló hibája miatt nem működik. A hibabejelentés a Mozilla felé megtörtént, a kijavítás idejéig ez a felirat olvasható. Chrome böngészőre is elérhető ez a kiegészítő, mely ott működőképes.");
	return;
	
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
	var regex = new RegExp(/[\x00-\x1F\x7F-\x9F]/gu);

    for (link of links) {
        let href = link.getAttribute('href');
        if (href.match(/\/Document\/Download\//) || href.match(/\/RDDocument\/Download\//)) {
			infos.push({ link: `https://www.etdr.gov.hu${href}` });
		}
    }

    var text = document.querySelectorAll('#uploadedDocs_DXMainTable tr');
    // Filename position in table
    var fpos = 1;
    if (window.location.href.match(/etdr\.gov\.hu\/RDProcessByUser\/ProcessEdit/) ||
        window.location.href.match(/etdr\.gov\.hu\/ProcessByOffice\/ProcessEdit/) ||
        window.location.href.match(/etdr\.gov\.hu\/ProcessAction\/ProcessActionEdit/)) {
        fpos = 3;
    }

    for (i = 0; i < infos.length; i++) {

        let item = text[i + 1].children[fpos].firstChild.textContent.trim();
        infos[i].filename = item;
    }

    return infos;
}
