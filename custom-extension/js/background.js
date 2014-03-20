// Set the initial app data information, local storage will control it from here on out

var appData = {
    apps: [
        {
            name: 'currently',
            isLocked: true
        },
        {
            name: 'forecast',
            isLocked: true
        },
        {
            name: 'gismeteo',
            isLocked: true
        }
    ]
}

var data = localStorage.getItem('extensionData');

if(!data){
    localStorage.setItem('extensionData', JSON.stringify(appData));
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    
    console.log(request);

    var data = JSON.parse(localStorage.getItem('extensionData'));

    var newApps = 0;

    if(data){
        data.apps.forEach(function(app){
            if(app.name == request.appName){
                app.isLocked = false;
                app.isNew = true;
                newApps++;
            } else if (app.isNew) {
                newApps++;
            }
        });
    }

    localStorage.setItem('extensionData', JSON.stringify(data));

    chrome.browserAction.setBadgeBackgroundColor({color: [78, 168, 234, 255]});
    chrome.browserAction.setBadgeText({text: newApps.toString() });

});