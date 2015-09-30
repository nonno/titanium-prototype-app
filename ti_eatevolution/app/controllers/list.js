var _args = arguments[0] || {},
	App = Alloy.Globals.App, // reference to the APP singleton object
	Admob = OS_ANDROID ? require('ti.admob') : null,
	$FM = require('favoritesmgr'),
	Repository = require("Repository"),
	indexes = [];  // Array placeholder for the ListView Index (used by iOS only);

var populateList, preprocessForListView, onItemClick, onBookmarkClick, onSearchChange, onSearchFocus,
	onSearchCancel, currentTab, formatDistance, adMobView;

onSearchChange = function(e){
	$.listView.searchText = e.source.value;
};

preprocessForListView = function(rawData) {
	if ($.listView.defaultItemTemplate === 'favoriteTemplate') {
		rawData = rawData.filter(function(item){
			return $FM.exists(item.id);
		});
	}
	
	return rawData.map(function(item) {
		var isFavorite = $FM.exists(item.id);
		var type = Repository.getProfileType(item.tipo);
		
		return {
			template: isFavorite ? "favoriteTemplate" : "defaultTemplate",
			properties: {
				searchableText: item.nome + ' ' + item.email,
				locale: item,
				editActions: [
					{title: isFavorite ? ("- " + L('lblFavorite')) : ("+ " + L('lblFavorite')), color: isFavorite ? "#C41230" : "#038BC8" }
				],
				canEdit:true
			},
			icon: {text: type.icon, color: type.color},
			nome: {text: item.nome},
			tipo: {text: L(type.text)},
			indirizzo: {text: Repository.addressToString(item)},
			telefono: {text: item.tel},
			distanza: {text: formatDistance(item.distanza)}
		};
	});
};

populateList = function(params){
	params = params || {};
	params.orderByDistance = params.orderByDistance || false;
	
	Ti.API.debug("list.populateList");
	
	var locali, indexes, sections, groups, section;
	
	locali = Alloy.Globals.Data.locali;
	
	if (params.orderByDistance){
		Ti.API.debug('Ordering by distance');
		
		locali = locali.sort(function(item){
			return item.distanza;
		});
		
		section = Ti.UI.createListSection();
		section.items = preprocessForListView(locali);
		
		$.listView.sections = [section];
	} else {
		Ti.API.debug('Ordering by name');
		
		locali = locali.sort(function(item){
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
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	Alloy.Globals.analyticsEvent({action:'list-open_profile', label:item.properties.locale.id});
	
	currentTab.open(Alloy.createController("profile", item.properties.locale).getView());
};

onBookmarkClick = function(e){
	if ($.listView.defaultItemTemplate === 'defaultTemplate'){
		$.listView.defaultItemTemplate = 'favoriteTemplate';
	} else if ($.listView.defaultItemTemplate === 'favoriteTemplate') {
		$.listView.defaultItemTemplate = 'defaultTemplate';
	}
	
	populateList();
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
	
	function onRowAction(e){
		var row = e.section.getItemAt(e.itemIndex);
		var id = row.properties.locale.id;
		
		if (e.action === ("+ " + L('lblFavorite'))){
			Alloy.Globals.analyticsEvent({action:'list-add_favorite', label:id});
			$FM.add(id);
		} else {
			Alloy.Globals.analyticsEvent({action:'list-remove_favorite', label:id});
			$FM.remove(id);
		}
		
		$.listView.editing = false;
		populateList();
	}
	$.listView.addEventListener("editaction", onRowAction);
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
	populateList();
});

if (OS_ANDROID){
	adMobView = Admob.createView({
		publisherId:"ca-app-pub-5803114779573585/8333772750",
	});
	adMobView.addEventListener(Admob.AD_RECEIVED, function(e){
		Ti.API.debug("Ad received " + JSON.stringify(e));
	});
	adMobView.addEventListener(Admob.AD_NOT_RECEIVED, function(e){
		Ti.API.debug("Ad not received " + JSON.stringify(e));
	});
	$.advContainer.add(adMobView);
}

$.wrapper.title = (_args.title || "").toLowerCase();
populateList();

exports.setTab = function(tab){
	currentTab = tab;
};
exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.listView.bottom = Alloy.CFG.gui.advertisementBannerHeight;
	} else {
		$.listView.bottom = 0;
		$.advContainer.height = 0;
	}
};
exports.refresh = populateList;
exports.onSearchChange = onSearchChange;
exports.onBookmarkClick = onBookmarkClick;