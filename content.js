// Listen for messages
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // ... call the specified callback, passing
        // the data back to the background page
        sendResponse(document.querySelector("#document-list-for-download").dataset.dloadObject);
    }

    if (msg.text === 'download_not_available') {
        alert("A letöltés csak az ÉTDR \"Dokumentumok\" vagy \"Mellékletek\" lapjának megjelenítését követően érhető el.");
    }

    if (msg.text === 'not_supported_browser_version') {
        alert("A Firefox 67-es verziójától a 69-es verziójáig nem működik ez a kiegészítő, mert ezekben a verziókban a letöltéshez szükséges funkció hibás.");
    }
});
