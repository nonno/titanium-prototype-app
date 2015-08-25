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

addTab('list', 'Elenco', 'images/dark_home.png');
addTab('map', 'Mappa', 'images/dark_globe.png');
addTab('join', 'Adesioni', 'images/dark_link.png');
addTab('info', 'Chi siamo', 'images/dark_info.png');

$.tabGroup.open();