var minLimit, maxLimit, updateIndicator, minLevelChange, maxLevelChange, getValue, setValue;

minLimit = 1;
maxLimit = 5;

updateIndicator = function(value){
	var symbols = [$.price1, $.price2, $.price3, $.price4, $.price5];
	if (!value){
		_.each(symbols, function(symbol){
			symbol.color = Alloy.CFG.gui.primaryColor;
		});
	} else {
		_.each(symbols, function(symbol, i){
			var index = i + 1;
			if (
				(index >= value.min)
				&&
				(index <= value.max)
			){
				symbol.color = Alloy.CFG.gui.primaryColor;
			} else {
				symbol.color = Alloy.CFG.gui.baseTextColor;
			}
		});
	}
};

minLevelChange = function(e){
	var min = Math.round(e.value);
	var max = Math.round($.maxLevel.value);
	
	if (min > max){
		$.maxLevel.value = min;
	}
	
	updateIndicator(getValue());
};
$.minLevel.addEventListener("change", minLevelChange);

maxLevelChange = function(e){
	var min = Math.round($.minLevel.value);
	var max = Math.round(e.value);
	
	if (max < min){
		$.minLevel.value = max;
	}
	
	updateIndicator(getValue());
};
$.maxLevel.addEventListener(OS_ANDROID ? "touchend" : "change", maxLevelChange); // bug in Android with change

var maxLevelTouchend = function(){
	var min = Math.round($.minLevel.value);
	var max = Math.round($.maxLevel.value);
	
	if (max < min){
		$.minLevel.value = max;
	}
	
	updateIndicator(getValue());
};
$.maxLevel.addEventListener(OS_ANDROID ? "touchend" : "change", maxLevelTouchend); // bug in Android with change

getValue = function(){
	var min = Math.round($.minLevel.value);
	var max = Math.round($.maxLevel.value);
	
	if (min !== minLimit || max !== maxLimit){
		return {"min": min, "max": max};
	}
	return undefined;
};

setValue = function(value){
	$.minLevel.value = (value && value.min) ? value.min : minLimit;
	$.maxLevel.value = (value && value.max) ? value.max : maxLimit;
};

$.minLevel.min = minLimit;
$.minLevel.max = maxLimit;
$.maxLevel.min = minLimit;
$.maxLevel.max = maxLimit;
if (!$.minLevel.value){ $.minLevel.value = minLimit; }
if (!$.maxLevel.value){ $.maxLevel.value = maxLimit; }

exports.getValue = getValue;
exports.setValue = setValue;
