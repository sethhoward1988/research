
// ID's

// 1: Currently (Rainfall Site)
// 2: Forecast
// 3: Gismeteo

console.log('security warnings running')

$('.install-button').on('click', function (evt) {

    var id = parseInt($(evt.target).attr('id'));

    var appName;

    switch(id){
        case 1: 
            appName = 'currently'; 
            break;
        case 2: 
            appName = 'forecast'; 
            break;
        case 3: 
            appName = 'gismeteo'; 
            break;
    }

    chrome.runtime.sendMessage({ 
        appName: appName 
    });

});