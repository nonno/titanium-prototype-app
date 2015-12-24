var args = arguments[0] || {};

var citySelectorInit;

citySelectorInit = function(){
	var data = Alloy.Globals.Data.cities.map(function(value){
		return {
			"title": value.name + ", " + value.province + ", " + value.zipCode + " (" + value.count + ")",
			"data": value,
			"color": Alloy.CFG.gui.baseTextColor,
			"backgroundColor": "white",
			"height": 22,
			"font": {
				"fontFamily": Alloy.CFG.gui.baseFontFamily,
				"fontSize": 16
			}
		};
	});
	
	$.selector.setOptions({
		"textfield": $.nameField,
		"data": data,
		"msgEmpty": L("autocomplete.msgEmpty")
	});
	$.selector.init();
};

citySelectorInit();
$.nameField.focus();

exports.getSelectedValue = function(){ return $.selector.getSelectedValue(); };
exports.setOnSelection = function(onSelection){ $.selector.setOnSelection(onSelection); };