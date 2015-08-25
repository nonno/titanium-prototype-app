var orario = arguments[0].orario;

var i = 0;

var giorni = {
    lun: {nome: 'lunedì', ordinamento: 0},
    mar: {nome: 'martedì', ordinamento: 1},
    mer: {nome: 'mercoledì', ordinamento: 2},
    gio: {nome: 'giovedì', ordinamento: 3},
    ven: {nome: 'venerdì', ordinamento: 4},
    sab: {nome: 'sabato', ordinamento: 5},
    dom: {nome: 'domenica', ordinamento: 6},
};

orario = _.sortBy(orario, function(giorno) {
    return giorni[giorno.id].ordinamento;
});

_.each(orario, function(giorno) {
    
    var dayLabel = Ti.UI.createLabel({
       width: "33.3%",
       height: '30dp',
       textAlign: 'center',
       text: giorni[giorno.id].nome,
       color: '#404040',
       font: {fontFamily: 'Arial', fontSize: '14dp'},
    });
    
    var amLabel = Ti.UI.createLabel({
       width: "33.3%",
       height: '30dp',
       textAlign: 'center',
       text: giorno.am,
       color: '#404040',
       font: {fontFamily: 'Arial', fontSize: '14dp'},
    });
    
    var pmLabel = Ti.UI.createLabel({
       width: "33.3%",
       height: '30dp',
       textAlign: 'center',
       text: giorno.pm,
       color: '#404040',
       font: {fontFamily: 'Arial', fontSize: '14dp'},
    });
    
    var row = Ti.UI.createView({
        layout: 'horizontal',
        height: '30dp',
        backgroundColor: (i%2?'white':'#e2e3e5')
    });
    
    row.add(dayLabel)
    row.add(amLabel)
    row.add(pmLabel)
    
    $.puntiVenditaDettaglioOrario.add(row);
    i++;
});