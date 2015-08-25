var openPuntoVendita = arguments[0].openPuntoVendita || function(){};

var myTemplate = {
    childTemplates: [
        {
            type: 'Ti.UI.Label',
            bindId: 'denom',
            properties: {
                color: 'black',
                backgroundColor: 'white',
                font: {fontFamily: 'Arial', fontSize: '14dp', fontWeight: 'bold'},
                left: '12dp', top: '13dp', width: "180dp", height: Ti.UI.SIZE,
            }
        },
        {
            type: 'Ti.UI.Label',
            bindId: 'data',
            properties: {
                color: 'gray',
                backgroundColor: 'white',
                font: {fontFamily: 'Arial', fontSize: '12dp'},
                left: '12dp', top: '46dp', height: Ti.UI.SIZE,
                width: '180dp'
            }
        },
        {
            type: 'Ti.UI.Label',
            bindId: 'distance',
            properties: {
                color: 'black',
                backgroundColor: 'white',
                font: {fontFamily: 'Arial', fontSize: '14dp', fontWeight: 'bold'},
                left: '12dp', bottom: '13dp'
            }
        },
        {
            type: 'Ti.UI.ImageView',
            bindId: 'apertura',
            properties: {
                color: 'black',
                font: {fontFamily: 'Arial', fontSize: '20dp', fontWeight: 'bold'},
                right: '44dp', top: '47dp'
            }
        },
        {
            type: 'Ti.UI.ImageView',
            properties: {
                right: '12dp', bottom: '13dp', image: '/images/icon_freccia.png'
            }
        }
    ]
};

var getData = function(pv) {
    
    var haystack = pv.via;
    if (!haystack){
        haystack = "";
    }
    var needle = new RegExp('via', "i");
    var hasPrefix = haystack.search(needle) != -1;

    needle = new RegExp('piazza', "i");
    hasPrefix = hasPrefix || (haystack.search(needle) != -1);

    needle = new RegExp('p.zza', "i");
    hasPrefix = hasPrefix || (haystack.search(needle) != -1);

    var via = "";
    if (!hasPrefix) {
        via = "VIA ";
    }
    via = via + pv.via;
    
    return via + ', ' + pv.num + '\n' + pv.cap + ' ' + pv.comune + ' (' + pv.prov + ')' + '\nTel. ' + pv.tel;
};

var formatDistance = function(distance) {
    if (distance == undefined || !_.isNumber(distance) || _.isNaN(distance) || (distance == Number.POSITIVE_INFINITY)) {
        return '';
    }
    if (distance > 9) {
        return 'a ' + Math.round(distance) + ' Km';
    }
    return 'a ' + Math.round(distance * 10) / 10 + ' Km';
};

var getSeason = function() {
    var date = new Date();
    var month = date.getMonth() + 1;
    if (month < 4 || month > 9)
        return 'est';
    return 'inv';
};

var isOpen = function(pv) {

    var weekday = new Array(7);
    weekday[0] = "dom";
    weekday[1] = "lun";
    weekday[2] = "mar";
    weekday[3] = "mer";
    weekday[4] = "gio";
    weekday[5] = "ven";
    weekday[6] = "sab";

    var d = new Date();
    var today = weekday[d.getDay()];
    var chiusura = pv['chius' + getSeason()];

    return chiusura != today;
};

var getApertura = function(pv) {
    return '/images/icon_' + (isOpen(pv) ? 'aperto' : 'chiuso') + '.png';
};

var getInsegna = function(pv) {
    return '/images/format_' + pv.insegna + '.png';
};

var listaPuntiVendita = Ti.UI.createListView({
    templates: {'template': myTemplate},
    defaultItemTemplate: 'template'
});

var puntiVenditaSection = Ti.UI.createListSection();
listaPuntiVendita.setSections([puntiVenditaSection]);


$.puntiVenditaListaPuntiVendita.add(listaPuntiVendita);

var listener = function(e) {
    var item = e.section.getItemAt(e.itemIndex);
    openPuntoVendita(item.puntoVendita);
};

listaPuntiVendita.addEventListener('itemclick', listener);

exports.setPuntiVendita = function(puntiVendita) {
    var selectionStyle;
    if(OS_IOS){
        selectionStyle = Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE;
    }

    var items = _.map(puntiVendita, function(pv) {
        return {
            properties: {
                height: '140dp',
                selectionStyle: selectionStyle
            },
            data: {text: getData(pv)},
            denom: {text: pv.denom},
            distance: {text: formatDistance(pv.distance)},
            apertura: {image: getApertura(pv)},
            insegna: {image: getInsegna(pv)},
            puntoVendita: pv
        };
    });
    puntiVenditaSection.setItems(items);
};

exports.unBindListeners = function(){
    listaPuntiVendita.removeEventListener('itemclick', listener);
};