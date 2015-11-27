var args = arguments[0],
	title = args.title || "",
	innerController = args.innerController,
	innerView = args.innerView,
	leftNav = args.leftNav || [],
	rightNav = args.rightNav || [],
	modalStyle = args.modalStyle || Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET,
	closeFunction = args.closeFunction || function(){ return true; };

var dialogWindow, open, close, leftNavButtons, rightNavButtons, i,
	openIos, openAndroid, openGeneric;

openIos = function(params){
	params = params || {};
	params.backgroundColor = params.backgroundColor || "white";
	
	var innerWindow = Ti.UI.createWindow({
		"backgroundColor": params.backgroundColor,
		"borderColor": params.backgroundColor,
		"leftNavButtons": leftNavButtons,
		"rightNavButtons": rightNavButtons,
		"titleControl": Ti.UI.createLabel({"text": title, "color": Alloy.CFG.iosColor}),
		"layout": "vertical"
	});
	
	dialogWindow = Ti.UI.iOS.createNavigationWindow({
		"modal": true,
		"window": innerWindow
	});
	dialogWindow.addEventListener("open", params.onOpen);

	if (innerController){
		innerWindow.add(innerController.getView());
	} else if (innerView){
		innerWindow.add(innerView);
	}
	
	dialogWindow.open({
		"modal": true,
		"modalStyle": modalStyle
	});
};

openAndroid = function(params){
	params = params || {};
	params.backgroundColor = params.backgroundColor || "white";
	
	var buttonNames, buttonListeners, androidView;
	
	buttonListeners = leftNav.concat(rightNav).map(function(item){
		return item.listener;
	});
	buttonNames = leftNav.concat(rightNav).map(function(item){
		return item.button.title;
	});
	
	androidView = Ti.UI.createView({
		"backgroundColor": params.backgroundColor,
		"layout": "vertical"
	});
	androidView.add(innerController ? innerController.getView() : innerView);
	androidView.add(Ti.UI.createView({
		"height": 10
	}));
	
	dialogWindow = Ti.UI.createAlertDialog({
		"androidView": androidView,
		"buttonNames": buttonNames
	});
	dialogWindow.addEventListener("click", function(e){
		if (buttonListeners[e.index]){
			buttonListeners[e.index]();
		}
	});
	
	dialogWindow.show();
	params.onOpen();
};

openGeneric = function(params){
	params = params || {};
	params.backgroundColor = params.backgroundColor || "white";
	
	var innerWindow, controlPanel, controlPanelRight, controlPanelLeft;
	
	innerWindow = Ti.UI.createWindow({
		"backgroundColor": params.backgroundColor,
		"theme": "nutrizionisti.Modal"
	});
	
	controlPanel = Ti.UI.createView({
		"backgroundColor": Alloy.CFG.gui.primaryColor,
		"bottom": 0,
		"height": 50,
		"width": Ti.UI.FILL
	});
	
	controlPanelRight = Ti.UI.createView({
		"layout": "horizontal",
		"width": Ti.UI.SIZE,
		"height": Ti.UI.SIZE,
		"right": 0
	});
	_.each(rightNavButtons, function(button){
		controlPanelRight.add(button);
	});
	controlPanel.add(controlPanelRight);
	
	controlPanelLeft = Ti.UI.createView({
		"layout": "horizontal",
		"width": Ti.UI.SIZE,
		"height": Ti.UI.SIZE,
		"left": 0
	});
	_.each(leftNavButtons, function(button){
		controlPanelLeft.add(button);
	});
	controlPanel.add(controlPanelLeft);
	
	dialogWindow = innerWindow;
	
	if (innerController){
		innerController.getView().bottom = 50;
		innerWindow.add(innerController.getView());
	} else if (innerView){
		innerView.bottom = 50;
		innerWindow.add(innerView);
	}
	innerWindow.add(controlPanel);
	
	dialogWindow.open({
		"modal": true
	});
};

open = function(params){
	params = params || {};
	params.onOpen = params.onOpen || function(){ return; };
	
	if (OS_IOS){
		openIos(params);
	} else if (OS_ANDROID){
		if (rightNav.concat(leftNav).length === 1){
			openAndroid(params);
		} else {
			openGeneric(params);
		}
	} else {
		openGeneric(params);
	}
};

close = function(params){
	params = params || {};
	
	Ti.API.debug("Closing modal window");
	
	var closeResult = closeFunction(params);
	
	if (closeResult || _.isUndefined(closeResult)){
		if (dialogWindow.close){
			dialogWindow.close();
		} else if (dialogWindow.hide){
			dialogWindow.hide();
		}
	}
};

if (!rightNav || rightNav.length === 0){
	Ti.API.debug("Adding default button");
	rightNav = [{
		"button": Alloy.Globals.createModalWindowHeaderButton({"title": L("lblDone")}),
		"listener": close
	}];
} else if (rightNav.length === 1 && !rightNav[0].listener){
	Ti.API.debug("Adding closing event to rightNavButton");
	rightNav[0].listener = close;
}

rightNavButtons = [];
for (i = rightNav.length - 1; i >= 0; i--){
	Ti.API.debug("Adding rightNavEventListener " + i);
	rightNav[i].button.addEventListener("click", rightNav[i].listener);
	rightNavButtons[i] = rightNav[i].button;
}

leftNavButtons = [];
for (i = leftNav.length - 1; i >= 0; i--){
	Ti.API.debug("Adding leftNavEventListener " + i);
	leftNav[i].button.addEventListener("click", leftNav[i].listener);
	leftNavButtons[i] = leftNav[i].button;
}


exports.open = open;
exports.close = close;
