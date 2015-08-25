var data = arguments[0].data;

if(_.isEmpty(data) || (data.length == 1 && data[0] == "")){
    data = ['Nessuno'];
}

var i = 0;

_.each(data, function(datum) {
    var label = Ti.UI.createLabel({
        height: '30dp',
        color: '#404040',
        left: "12dp",
        font: {fontFamily: 'Arial', fontSize: '14dp'},
        text: datum
    });
    var row = Ti.UI.createView({
        height: '30dp',
        backgroundColor: (i%2?'white':'#f5f6f8')
    });
    row.add(label);
    $.puntiVenditaDettaglioTabella.add(row);
    i++;
});