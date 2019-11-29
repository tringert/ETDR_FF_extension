// Listen for messages
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // ... call the specified callback, passing
        // the data back to the background page
        sendResponse(getDownloadInfo());
    }

    if (msg.text === 'not_supported_browser_version') {
        alert("A Firefox 67-es verziójától a 69-es verziójáig nem működik ez a kiegészítő, mert ezekben a verziókban a letöltéshez szükséges funkció hibás.");
    }
});

// Get the info for download
function getDownloadInfo() {

    var links = document.querySelectorAll('#uploadedDocs_DXMainTable a');
    var loc = [];
    var regex = new RegExp(/[\x00-\x1F\x7F-\x9F]/gu);
    var devUrlPrefix;

    // Set the url prefix
    if (window.location.href.match(/fejl\.etdr\.gov\.hu/)) {
        devUrlPrefix = "https://fejl.etdr.gov.hu";
    } else {
        devUrlPrefix = "https://www.etdr.gov.hu";
    }

    // Get hrefs and make the links
    for (link of links) {
        let href = link.getAttribute('href');
        if (href.match(/\/Document\/Download\//) || href.match(/\/RDDocument\/Download\//)) {
            loc.push({ link: `${devUrlPrefix + href}` });
        }
    }

    var text = document.querySelectorAll('#uploadedDocs_DXMainTable tr');

    // Filename position in table (it varies between the tables)
    var fpos = 1;
    if (window.location.href.match(/etdr\.gov\.hu\/RDProcessByUser\/ProcessEdit/) ||
        window.location.href.match(/etdr\.gov\.hu\/ProcessByOffice\/ProcessEdit/) ||
        window.location.href.match(/etdr\.gov\.hu\/ProcessAction\/ProcessActionEdit/)) {
        fpos = 3;
    }

    // Get the filenames
    for (i = 0; i < loc.length; i++) {

        let item = text[i + 1].children[fpos].firstChild.textContent.trim();
        loc[i].filename = item;
    }

    // Get the process number
    var procinfoSection = document.querySelector("#procinfo-section");
    var procNum = procinfoSection == null ? "" : procinfoSection.dataset.processnumber;

    // Generate the object
    var infosObject = JSON.stringify({ processNumber: procNum, loc });

    return infosObject;
}
