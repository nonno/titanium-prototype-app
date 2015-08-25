var animation = require('alloy/animation');

var afterShowNewWindow = function(){
    if (OS_ANDROID) {
        $.dashboard.visible = false;
        $.progressIndicator.hide();
    }
};

var onCloseNewWindow = function(){
    if (OS_ANDROID) {
        $.dashboard.visible = true;
        $.progressIndicator.hide();
    }
};

var openProgressIndicator = function(){
	if (OS_ANDROID) { $.progressIndicator.show();}
};

if(OS_ANDROID && Alloy.isHandheld){
	$.dashboard.orientationModes = [Titanium.UI.PORTRAIT];
}

$.PuntiVendita.addEventListener('click', function() {
	openProgressIndicator();
    Alloy.createController('puntiVendita',{
        afterShow : afterShowNewWindow,
        onClose : onCloseNewWindow
    });
});

var buttons = [
    {viewId : "PuntiVendita",img : "/images/item_puntivendita.png",pressedImg : "/images/item_puntivendita_premuto.png"},
]; 

_.each(buttons, function(button){
    $[button.viewId].addEventListener('singletap', function(){
        $[button.viewId].setImage(button.pressedImg);
        setTimeout(function(){
            $[button.viewId].setImage(button.img)
        }, 50);
    });
});