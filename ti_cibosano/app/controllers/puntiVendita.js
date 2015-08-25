var afterShow = arguments[0].afterShow || function(){};
var onClose = arguments[0].onClose || function(){};

var puntiVendita = require('ListaPuntiVendita');

var currentSearchText = "";

var openProgressIndicator = function(){
	if (OS_ANDROID) { $.progressIndicator.show();}
};

var closeProgressIndicator = function(){
	if (OS_ANDROID) { $.progressIndicator.hide();}
};

var getCurrentSelection = function() {
    var result = puntiVendita.searchPuntoVendita({
        insegna: "",
        text: currentSearchText
    });
    return result;
};

var showListOrMap = function(){
    if (!Alloy.isTablet){
        $.listaPuntiVenditaContainer.visible = true; 
    }
};

var setBackAction = function(){
    if (!Alloy.isTablet){
        var oldBackAction = backAction;
        backAction = function(){
            $.search.blur();
            $.listaPuntiVenditaContainer.visible = false;
            backAction = oldBackAction;
        }
        
    }
};

var onSearchTextEntry = function(text) {
    currentSearchText = text;
    currentPuntiVenditaCtrl.setPuntiVendita(getCurrentSelection());
};

var openPuntoVendita = function(puntoVendita){
	openProgressIndicator();
    Alloy.createController('puntiVenditaDettaglio', {
        puntoVendita: puntoVendita,
        afterShow : function(){
            if (OS_ANDROID){
                $.puntiVendita.visible = false;
                closeProgressIndicator();
            }
        },
        onClose : function(){
            if (OS_ANDROID){
                $.puntiVendita.visible = true;
                closeProgressIndicator();
            }
        }
    });
};

if (OS_IOS) {
    $.search.addEventListener('focus', function() {
        $.overlay.show();
    });
}
$.search.addEventListener('click', function() {
    $.overlay.show();
});

var timeout = null;
$.search.addEventListener('change', function() {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(function(){
        onSearchTextEntry($.search.value);
    }, 200);
});

$.search.addEventListener('return', function() {
    $.search.blur();
    $.overlay.hide();
});


$.search.addEventListener('blur', function() {
    $.overlay.hide();
});

$.overlay.addEventListener('click', function() {
    $.search.blur();
    $.overlay.hide();
});

$.listaButton.addEventListener('click', function() {
    $.mappaButton.image = '/images/btn_mappa_off.png';
    $.listaButton.image = '/images/btn_elenco_on.png';
    $.mappaPuntiVendita.hide();
    
    $.listaPuntiVendita.show();
    currentPuntiVenditaCtrl = listaPuntiVenditaCtrl;
    currentPuntiVenditaCtrl.setPuntiVendita(getCurrentSelection());
});

$.mappaButton.addEventListener('click', function() {
    $.mappaButton.image = '/images/btn_mappa_on.png';
    $.listaButton.image = '/images/btn_elenco_off.png';
    $.listaPuntiVendita.hide();
    $.mappaPuntiVendita.add(mappaPuntiVenditaCtrl.getView());
    $.mappaPuntiVendita.show();
    currentPuntiVenditaCtrl = mappaPuntiVenditaCtrl;
    currentPuntiVenditaCtrl.setPuntiVendita(getCurrentSelection());
});

var backAction = function(){
    listaPuntiVenditaCtrl.unBindListeners();
    listaPuntiVenditaCtrl = null;
    mappaPuntiVenditaCtrl.unBindListeners();
    mappaPuntiVenditaCtrl = null;
    onClose();
    $.puntiVendita.close();
};

$.backButton.addEventListener('click', function() {
    backAction();
});

var listaPuntiVenditaCtrl = Alloy.createController('puntiVenditaListaPuntiVendita',{
    openPuntoVendita : openPuntoVendita
});

$.listaPuntiVendita.add(listaPuntiVenditaCtrl.getView());




listaPuntiVenditaCtrl.setPuntiVendita(getCurrentSelection());

var currentPuntiVenditaCtrl = listaPuntiVenditaCtrl;

$.puntiVendita.addEventListener('androidback', function(e) {
    e.cancelBubble = true;
    backAction();
});

$.puntiVendita.open();
afterShow();

$.search.focus();
$.search.blur();
if (OS_ANDROID){
	setTimeout(function(){
		Ti.UI.Android.hideSoftKeyboard();
		$.search.blur();
	},200);
}

var mappaPuntiVenditaCtrl = Alloy.createController('puntiVenditaMappaPuntiVendita',{
    openPuntoVendita : openPuntoVendita
});
$.mappaPuntiVendita.add(mappaPuntiVenditaCtrl.getView());

