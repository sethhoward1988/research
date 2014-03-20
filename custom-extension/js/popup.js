
$('.delete').on('click', function (evt) {
    var name = $(evt.target).parent().attr('id');

    var data = JSON.parse(localStorage.getItem('extensionData'));

    if(data){
        data.apps.forEach(function(app){
            if(app.name == name){
                app.isLocked = true;
            }
        });
    }

    localStorage.setItem('extensionData', JSON.stringify(data));

    showApps();
});

function showApps () {
    chrome.browserAction.setBadgeText({text:''})
    var data = localStorage.getItem('extensionData');
    data = JSON.parse(data);

    var anyUnlocked = false;

    for(var i = 0; i < data.apps.length; i++){
        var app = data.apps[i];
        app.isNew = false;
        if(app.isLocked){
            $('#' + app.name).hide();
        } else {
            $('#' + app.name).show();
            anyUnlocked = true;
        }
    }

    if(anyUnlocked){
        $('.no-apps').hide();
    } else {
        $('.no-apps').show();
    }
}

showApps();