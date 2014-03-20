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

    if(data){
        data.apps.forEach(function(app){
            if(app.name == request.appName){
                app.isLocked = false;
            }
        });
    }

    localStorage.setItem('extensionData', JSON.stringify(data));

});