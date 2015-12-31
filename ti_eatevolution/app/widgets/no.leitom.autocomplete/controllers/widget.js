var options = {
	// Minimum number of chars before the autocomplete kicks in
	minChars: 2,

	// When no results matches the query do we show a message or hide the autocomplete?
	showEmptyMessage: true,

	// If the query needs an match to confirm the input when true textfields value will be reset
	needMatch: true,

	// Message to show when showEmptyMessage are set to true
	msgEmpty: L("autoCompleteEmptyMsg", "No results matched your query"),
	
	onSelection: function(){ return; }
};

var selectedValue = null;

function setOptions(_properties) {
	_.extend(options, _properties);

	return;
}

function init() {
	options.textfield.addEventListener("postlayout", positionAutoCompleteContainer);

	options.textfield.addEventListener("change", changeListener);

	return;
}

function positionAutoCompleteContainer(){
	//$.autoCompleteContainer.top = parseInt( options.textfield.rect.y + options.textfield.rect.height );

	if (Alloy.isHandheld){
		$.autoCompleteContainer.width = Ti.UI.FILL;
	} else if(typeof(options.textfield.rect.width) !== "undefined") {
		$.autoCompleteContainer.width = parseInt( options.textfield.rect.width );
	}

	if (typeof(options.textfield.rect.x) !== "undefined" && !Alloy.isHandheld) {
		$.autoCompleteContainer.left = parseInt(options.textfield.rect.x);
	} else {
		$.autoCompleteContainer.left = 0;
	}
}

function changeListener(_e) {
	var value = _e.source.value || _e.value || "";
	
	if (value.length >= options.minChars) {
		show();
	} else {
		hide();
	}
}

function setValue(_e) {
	options.textfield.setValue((_e.rowData.data || {}).name);
	selectedValue = _e.rowData.data;
	
	options.textfield.fireEvent("return");

	options.textfield.blur();

	setTimeout(function(){
		hide();
		options.onSelection();
	}, 200);
}

function show() {
	if (typeof(options.data) !== "undefined") {
		var filteredData = [];

		for (var i in options.data){
			var filter = new RegExp(options.textfield.value, "i");

			if ((options.data[i].data || {}).name.match(filter)){
				filteredData.push({
					title: options.data[i].title,
					data: options.data[i].data,
					color: options.data[i].color,
					font: options.data[i].font,
					height: options.data[i].height,
					backgroundColor: options.data[i].backgroundColor
				});
			}
		}

		if (filteredData.length > 0){
			$.autoCompleteTableView.setData( filteredData );
			$.autoCompleteContainer.height = Ti.UI.SIZE;
			$.autoCompleteContainer.visible = true;
		} else {
			$.autoCompleteTableView.setData([]);
			$.autoCompleteContainer.height = 0;
			$.autoCompleteContainer.visible = false;
		}
	}

	return true;
}

function hide() {
	$.autoCompleteContainer.height = 0;
	$.autoCompleteContainer.visible = false;
	return true;
}

function detach() {
	options.textfield.removeEventListener("postlayout", positionAutoCompleteContainer);
	options.textfield.removeEventListener("change", changeListener);
}

exports.setOptions = setOptions;
exports.init = init;
exports.show = show;
exports.hide = hide;
exports.detach = detach;
exports.setOnSelection = function(onSelection){ return options.onSelection = onSelection; };
exports.getSelectedValue = function(){ return selectedValue; };