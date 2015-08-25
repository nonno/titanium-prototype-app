var addTab = function(controllerName, title, icon){
	var controller = Alloy.createController(controllerName);
	var tab = Ti.UI.createTab({
		'title' : title,
		'icon' : icon,
		'window' : controller.getView()
	});
	if (controller.setTab){
		controller.setTab(tab);
	}
	$.tabGroup.addTab(tab);
};

addTab('list', L('lblListTab'), 'images/dark_home.png');
addTab('map', L('lblMapTab'), 'images/dark_globe.png');
addTab('join', L('lblJoinTab'), 'images/dark_link.png');
addTab('info', L('lblInfoTab'), 'images/dark_info.png');

$.tabGroup.open();