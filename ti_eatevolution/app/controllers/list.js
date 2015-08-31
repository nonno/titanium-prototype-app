var _args = arguments[0] || {},
	App = Alloy.Globals.App, // reference to the APP singleton object
	$FM = require('favoritesmgr'),  // FavoritesManager object (see lib/utilities.js)
	geoUtils = require("GeoUtils"),
	locali = null,
	indexes = [];  // Array placeholder for the ListView Index (used by iOS only);

var populateList, preprocessForListView, onItemClick, onBookmarkClick, onSearchChange, onSearchFocus,
	onSearchCancel, title, currentTab, formatDistance, calculateDistances, init;

title = (_args.title || "").toLowerCase();

Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");

onSearchChange = function(e){
	$.listView.searchText = e.source.value;
};

preprocessForListView = function(rawData) {
	if ($.listView.defaultItemTemplate === 'favoriteTemplate') {
		rawData = _.filter(rawData, function(item){
			return $FM.exists(item.id);
		});
	}
	
	return _.map(rawData, function(item) {
		var isFavorite = $FM.exists(item.id);
		
		return {
			template: isFavorite ? "favoriteTemplate" : "defaultTemplate",
			properties: {
				searchableText: item.nome + ' ' + item.email,
				user: item,
				editActions: [
					{title: isFavorite ? ("- " + L('lblFavorite')) : ("+ " + L('lblFavorite')), color: isFavorite ? "#C41230" : "#038BC8" }
				],
				canEdit:true
			},
			nome: {text: item.nome},
			indirizzo: {text: item.ind},
			telefono: {text: item.tel},
			distanza: {text: formatDistance(item.distanza)}
		};
	});
};

populateList = function(params){
	params = params || {};
	params.orderByDistance = params.orderByDistance || false;
	
	var indexes, sections, groups, section;
	
	if (!locali) {
		return;
	}
	if (params.orderByDistance){
		Ti.API.debug('Ordering by distance');
		
		locali = _.sortBy(locali, function(item){
			return item.distanza;
		});
		
		section = Ti.UI.createListSection();
		section.items = preprocessForListView(locali);
		
		$.listView.sections = [section];
	} else {
		Ti.API.debug('Ordering by name');
		
		locali = _.sortBy(locali, function(item){
			return item.nome;
		});
		
		indexes = [];
		sections = [];
		groups = null;
		
		// Group the data by first letter of last name to make it easier to create sections.
		groups  = _.groupBy(locali, function(item){
			return item.nome.charAt(0);
		});

		_.each(groups, function(group){
			var dataToAdd = preprocessForListView(group);
			
			if (dataToAdd.length < 1) return;
			
			indexes.push({
				index: indexes.length,
				title: group[0].nome.charAt(0)
			});

			var sectionHeader = Ti.UI.createView({
				backgroundColor: "#ececec",
				width: Ti.UI.FILL,
				height: 30
			});

			var sectionLabel = Ti.UI.createLabel({
				text: group[0].nome.charAt(0),
				left: 20,
				font:{
					fontSize: 20
				},
				color: "#666"
			});
			sectionHeader.add(sectionLabel);

			section = Ti.UI.createListSection({
				headerView: sectionHeader
			});
			section.items = dataToAdd;

			sections.push(section);
		});

		$.listView.sections = sections;
		
		if (OS_IOS) {
			$.wrapper.addEventListener("swipe", function(e){
				if (e.direction === "left"){
					$.listView.sectionIndexTitles = indexes;
				}
				if (e.direction === "right"){
					$.listView.sectionIndexTitles = null;
				}
			});
		}
	}
};

onItemClick = function(e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".contact.clicked");
	
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	currentTab.open(Alloy.createController("profile", item.properties.user).getView());
};

onBookmarkClick = function(e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".favorites.clicked");
	
	if ($.listView.defaultItemTemplate === 'defaultTemplate'){
		$.listView.defaultItemTemplate = 'favoriteTemplate';
	} else if ($.listView.defaultItemTemplate === 'favoriteTemplate') {
		$.listView.defaultItemTemplate = 'defaultTemplate';
	}
	
	init();
};

calculateDistances = function(e) {
	if (e.success) {
		locali = _.map(locali, function(locale) {
			locale.distanza = geoUtils.calculateDistance({'latitude' : locale.lat, 'longitude' : locale.lon}, e.coords);
			return locale;
		});
		return true;
	}
	return false;
}; 

formatDistance = function(distance) {
	if (distance == undefined || !_.isNumber(distance) || _.isNaN(distance) || (distance == Number.POSITIVE_INFINITY)) {
		return '';
	}
	if (distance > 9) {
		return Math.round(distance) + ' km';
	}
	return Math.round(distance * 10) / 10 + ' km';
};

init = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
	
	locali = JSON.parse(file.read().text).locali;
	
	Ti.Geolocation.getCurrentPosition(function(e) {
		var distancesCalculated = calculateDistances(e);
		
		populateList({'orderByDistance' : distancesCalculated});
	});
};

if (OS_IOS){
	onSearchFocus = function(e){
		$.searchBar.showBookmark = false;
		$.searchBar.showCancel = true;
	};
	
	onSearchCancel = function(e){
		$.searchBar.showBookmark = true;
		$.searchBar.showCancel = false;
		$.searchBar.blur();
	};
	
	// FIXME - Add Comments
	function onRowAction(e){
		var row = e.section.getItemAt(e.itemIndex);
		var id = row.properties.user.id;
		
		if (e.action === ("+ " + L('lblFavorite'))) {
			$FM.add(id);
		} else {
			$FM.remove(id);
		}
		
		$.listView.editing = false;
		init();
	}
	$.listView.addEventListener("rowAction", onRowAction);
}

$.wrapper.addEventListener("open", function(){
	if (OS_ANDROID && $.listView.defaultItemTemplate === 'favoriteTemplate'){
		var activity = $.wrapper.getActivity();
		activity.onCreateOptionsMenu = function(e) {
			e.menu.clear();
		};
		activity.invalidateOptionsMenu();
	}
});

Ti.App.addEventListener("refresh-data", function(e){
	init();
});

if (_args.title){
	$.wrapper.title = _args.title;
}
init();

exports.setTab = function(tab){
	currentTab = tab;
};
exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.listView.bottom = Alloy.CFG.gui.advertisementBannerHeight;
	} else {
		$.listView.bottom = "0dp";
		$.advContainer.height = "0dp";
	}
};
exports.onSearchChange = onSearchChange;
exports.onBookmarkClick = onBookmarkClick;