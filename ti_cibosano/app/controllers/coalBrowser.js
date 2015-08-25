var afterShow = arguments[0].afterShow || function(){};
var onClose = arguments[0].onClose || function(){};

$.titleLabel.text = arguments[0].title;
$.content.url = arguments[0].url;

if(OS_ANDROID) {
    $.content.softKeyboardOnFocus = Titanium.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
}

var backAction = function(){
    if($.content.canGoBack()){
        $.content.goBack();
    }else{
        onClose();
        $.coalBrowser.close();
    }
};

$.backButton.addEventListener('click', function() {
    backAction();
});

$.coalBrowser.addEventListener('androidback', function(e) {
    e.cancelBubble = true;
    backAction();
});

$.coalBrowser.open();
afterShow();