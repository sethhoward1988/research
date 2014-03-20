
// Warning Window Generator

// Every page has a     #button-installer
// and a                #button-warning


// ID's

// 1: Currently (Rainfall Site)
// 2: Forecast
// 3: Gismeteo

$(function () {

    $('.button-warning').on('click', function (evt) {
        var appName = $(evt.target).attr('id');
        var modal = createWindow(appName);
        $('body').append(modal);
        openModal(modal);

        modal.find('.overlay').on('click', function () {

        });

        modal.find('.cancel').on('click', function () {
            dismissModal(modal);
        });

        modal.find('.install').on('click', function (evt) {
            // Add a delay to make it seem like its installing something
            if($(evt.target).hasClass('disabled')){
                return;
            } else {
                $(evt.target).addClass('disabled')
                setTimeout(function () {
                    $('#install').val(appName).click();
                    dismissModal(modal);    
                }, 2000);
            }
            
        });

    });

});








function openModal (modal) {
    modal.fadeIn();
}

function dismissModal (modal) {
    modal.fadeOut();
}

function createWindow (appName) {
    var html =  '<div class="overlay"></div>' +
                '<div class="modal">' +
                    '<div class="relative">' +
                        '<div class="title">Add "' + appName + ' (Extension)"?</div>' +
                        '<div class="logo ' + appName + '"></div>' +
                        '<div class="warnings">' +
                            '<em>It can:</em>' +
                            '<ul></ul>' +
                        '</div>' +
                        '<div class="controls">' +
                            '<div class="button install">Install</div>' +
                            '<div class="button cancel"><em>Cancel</em></div>' +
                        '</div>' +
                    '</div>' +
                '</div>'

    html = $(html);
    var ul = html.find('ul');
    setWarnings(ul, appName);
    return html;
}

function setWarnings (ul, appName) {
    var warnings = apps[appName].warnings;

    for(var i = 0; i < warnings.length; i++){
        var li = $('<li></li>').text(warnings[i]);
        ul.append(li);
    }

}

// Here is the warning information for each app

var apps = {
    forecast: {
        warnings:['Your current location','Your computer files','Your personal data']
    },

    currently: {
        warnings:['Access your current location','Access your IP address']
    }
}
