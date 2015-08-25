var DOCUMENTS_PATH = Ti.Filesystem.applicationDataDirectory;
var DB_FILENAME = "puntivendita.json";
var OLD_DB_FILENAME = "puntivendita_old.json";


var backupOldData = function(){
    var dbFile = Ti.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    var backupFile = Ti.Filesystem.getFile(DOCUMENTS_PATH + OLD_DB_FILENAME);
    backupFile.deleteFile();
    backupFile = Ti.Filesystem.getFile(DOCUMENTS_PATH + OLD_DB_FILENAME);
    var success = backupFile.write(dbFile.read(), false);
    if (success){
        success = dbFile.deleteFile();
    }
    Ti.API.info("[SYNC] - Success backup: " + success);
    return success;
};

var requestNewData = function(cbs){
    var xhr = Titanium.Network.createHTTPClient({
        enableKeepAlive: false
    });

    var setCommonHeaders = function(xhr){
        xhr.timeout = 30000;
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
    };


    xhr.open("GET", Alloy.CFG.DATA_ENTRY_POINT);

    setCommonHeaders(xhr);

    xhr.onload = function(){
        cbs.success(xhr.responseText);
        
    };

    xhr.onerror = function(){
        cbs.error();
    };
    xhr.send();
};

var saveNewData = function(data){
    var file = Ti.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    var success = false;
    try {
        JSON.parse(data);
        success = file.write(data);
        
    } catch (e){
        success = false;
    }
    file = null;
    return success;
};

var rollbackOldData = function(){
    var old_file = Ti.Filesystem.getFile(DOCUMENTS_PATH + OLD_DB_FILENAME);
    var new_dest = Ti.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    new_dest.write(old_file.read());
    old_file = null;
    new_dest = null;
};

var execute = function(cbs){
    exports.execute = function(){};
    requestNewData({
        success : function(data){
            Ti.API.info("[SYNC] - Dati scaricati");
            if (backupOldData() && saveNewData(data)){
                Ti.API.info("[SYNC] - Dati salvati");
                cbs.success();
            }else{
                rollbackOldData();
                Ti.API.info("[SYNC] - Errore nei dati, ripristinati i vecchi");
                cbs.error();
            }
            exports.execute = execute;
        },
        error: function(){
            exports.execute = execute;
            Ti.API.info("[SYNC] - Errore download dati");
            cbs.error();
        }
    });
};

exports.execute = execute;