var DOCUMENTS_PATH = Ti.Filesystem.applicationDataDirectory;
var ASSETS_PATH = Ti.Filesystem.resourcesDirectory;
var DB_FILENAME = "puntivendita.json";

var databaseExists = function(){
    var dbFile = Titanium.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    var exists = dbFile.exists();
    dbFile = null;
    return exists;
};

var copyInitialDatabaseFromAssets = function(){
    var dbFileFromAssets = Titanium.Filesystem.getFile(ASSETS_PATH + DB_FILENAME);
    var destination = Titanium.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    var success = destination.write(dbFileFromAssets.read(),false);
    dbFileFromAssets = null;
    destination = null;
    return success;
    
};

var execute = function(){
    var success = true;
    if (!databaseExists()){
        success = copyInitialDatabaseFromAssets();
    }
    return success;
};

exports.execute = execute;