var execute = function(action, offlineMessage){
    offlineMessage = offlineMessage || "Per utilizzare questa funzionalità devi essere connesso ad internet";
    if (Ti.Network.online){
        action();
    } else {
        Ti.UI.createAlertDialog({
            message: offlineMessage,
            ok: 'OK',
            title: 'Errore di Rete'
        }).show();
    }
    return Ti.Network.online;
};

var executeWithoutAlert = function(action){
    if (Ti.Network.online){
        action();
    }
    return Ti.Network.online;
};

exports.execute = execute;
exports.executeWithoutAlert = executeWithoutAlert;