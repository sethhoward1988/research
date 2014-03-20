
$('#install').on('click', function (evt) {
    chrome.runtime.sendMessage({ 
        appName: $(evt.target).val()
    });
});
