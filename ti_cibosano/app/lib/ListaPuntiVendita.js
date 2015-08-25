var _ = require("alloy/underscore")._;
var geoUtils = require("GeoUtils");

var DOCUMENTS_PATH = Ti.Filesystem.applicationDataDirectory;
var DB_FILENAME = "puntivendita.json";

var listaPuntiVendita = [];

exports.init = function(cbs) {
    Ti.API.info("Init data " + DOCUMENTS_PATH + DB_FILENAME);
    var dataFile = Ti.Filesystem.getFile(DOCUMENTS_PATH + DB_FILENAME);
    listaPuntiVendita = JSON.parse(dataFile.read()).puntivendita || [];
    Titanium.Geolocation.getCurrentPosition(function(e) {
        calculateDistances(e);
        cbs.done();
    });
};

exports.sync = function() {
    require("SyncProcess").execute({
        success: function() {
            exports.init({
                done: function() {
                    Ti.API.info("Sincronizzazione avvenuta correttamente");
                }
            });
        },
        error: function() {
            Ti.API.info("Errore di sincronizzazione");
        }
    });
};

exports.getInsegne = function() {
    var insegne = [
        "buongiorno",   //Buongiorno Coal
        "supercoal",    //Supercoal
        "supermerc",    //Supermercato coal
        "maxicoal",     //Maxicoal
        "superstore",   //Superstore coal
        //"iperstore",    //Iperstore coal
        "sigma",        //Sigma
        "ipersigma",    //Iper sigma
        "dico",         //Dico
        "deamarket"     //Dea market
    ];
    var mapped = _.map(insegne, function(insegnaId) {
        return {
            id: insegnaId,
            label: insegnaId,
            img: '/images/format_' + insegnaId + '.png'
        };
    });
    return mapped;
};

exports.searchPuntoVendita = function(criteria) {

    var insegnaFilter = criteria.insegna ?
            //Filtro per insegna
                    function(puntoVendita) {
                        return puntoVendita.insegna == criteria.insegna;
                    } :
                    //Tutte le insegne
                            function(puntoVendita) {
                                return true;
                            };

                    var filteredByInsegna = _.filter(listaPuntiVendita, insegnaFilter);

                    var textFilter = criteria.text ?
                            //Testo passato
                                    function(puntoVendita) {
                                        var haystack = puntoVendita.denom + " " +
                                                puntoVendita.via + " " +
                                                puntoVendita.cap + " " +
                                                puntoVendita.comune + " " +
                                                puntoVendita.prov;
                                        var needle = new RegExp(criteria.text, "i")
                                        var result = haystack.search(needle);
                                        return (result != -1);
                                    }
                            //Testo non passato
                            : function(puntoVendita) {
                                return true
                            };

                            var filtered = _.filter(filteredByInsegna, textFilter);

                            //Ordinamento per distanza
                            var sorted = _.sortBy(filtered, function(puntovendita) {
                                return puntovendita.distance;
                            });


                            return sorted;
                        };

                var calculateDistances = function(e) {
                    if (e.success) {
                        listaPuntiVendita = _.map(listaPuntiVendita, function(puntovendita) {
                            puntovendita.distance = geoUtils.calculateDistance(puntovendita.location, e.coords)
                            return puntovendita;
                        });
                    }
                };

//Titanium.Geolocation.setAccuracy(Titanium.Geolocation.ACCURACY_LOW);
//Titanium.Geolocation.addEventListener('location',calculateDistances);