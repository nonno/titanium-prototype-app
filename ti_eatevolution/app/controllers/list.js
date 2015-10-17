var AdMob = require("AdMob"),
	$FM = require("favoritesmgr"),
	Repository = require("Repository");

var populateList, preprocessForListView, onItemClick, onBookmarkClick, onSearchChange, onSearchFocus,
	onSearchCancel, currentTab, formatDistance, sortProfilesByDistance, sortProfilesByName,
	filterProfiles, onRowAction;

onSearchChange = function(e){
	$.listView.searchText = e.source.value;
};

preprocessForListView = function(rawData) {
	return rawData.map(function(item) {
		var isFavorite = $FM.exists(item.id);
		var type = Repository.getProfileType(item.tipo);
		
		return {
			template: isFavorite ? "favoriteTemplate" : "defaultTemplate",
			properties: {
				searchableText: item.nome + " " + item.email,
				locale: item,
				editActions: [
					{title: isFavorite ? ("- " + L("lblFavorite")) : ("+ " + L("lblFavorite")), color: isFavorite ? "#C41230" : Alloy.CFG.iosColor }
				],
				canEdit: true
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

sortProfilesByDistance = function(a, b){
	return a.distanza - b.distanza;
};
sortProfilesByName = function(a, b){
	if (a.nome < b.nome){
		return -1;
	} else if (a.nome > b.nome){
		return 1;
	}
	return 0;
};

filterProfiles = function(profiles){
	if (Alloy.Globals.Data.favorites) {
		profiles = profiles.filter(function(profile){
			return $FM.exists(profile.id);
		});
	}
	return profiles;
};

populateList = function(params){
	params = params || {};
	
	Ti.API.debug("list.populateList");
	
	var locali, indexes, sections, groups, section;
	
	locali = filterProfiles(Alloy.Globals.Data.locali);
	
	$.listFooterLabelContainer.visible = !locali.length;
	
	if (Alloy.Globals.Data.orderByDistance){
		Ti.API.debug("Ordering by distance");
		
		locali = locali.sort(sortProfilesByDistance);
		
		section = Ti.UI.createListSection();
		section.items = preprocessForListView(locali);
		
		$.listView.sections = [section];
	} else {
		Ti.API.debug("Ordering by name");
		
		locali = locali.sort(sortProfilesByName);
		
		indexes = [];
		sections = [];
		groups = null;
		
		// Group the data by first letter of last name to make it easier to create sections.
		groups = _.groupBy(locali, function(item){
			return item.nome.charAt(0);
		});

		_.each(groups, function(group){
			var dataToAdd = preprocessForListView(group);
			
			if (dataToAdd.length < 1){ return; }
			
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
				font: {
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
	
	Alloy.Globals.analyticsEvent({action: "list-open_profile", label: item.properties.locale.id});
	
	currentTab.open(Alloy.createController("profile", {
		"profile": item.properties.locale,
		"listSource": {
			"sectionIndex": e.sectionIndex,
			"itemIndex": e.itemIndex
		}
	}).getView());
};

onBookmarkClick = function(){
	if (OS_IOS){
		Alloy.Globals.Data.favorites = !Alloy.Globals.Data.favorites;
	}
	
	if (Alloy.Globals.Data.favorites){
		$.listView.defaultItemTemplate = "favoriteTemplate";
	} else {
		$.listView.defaultItemTemplate = "defaultTemplate";
	}
	
	populateList();
};

formatDistance = function(distance) {
	if (distance === undefined || !_.isNumber(distance) || _.isNaN(distance) || (distance === Number.POSITIVE_INFINITY)) {
		return "";
	}
	if (distance > 9) {
		return Math.round(distance) + " km";
	}
	return Math.round(distance * 10) / 10 + " km";
};

if (OS_IOS){
	onSearchFocus = function(){
		$.searchBar.showBookmark = false;
		$.searchBar.showCancel = true;
	};
	
	onSearchCancel = function(){
		$.searchBar.showBookmark = true;
		$.searchBar.showCancel = false;
		$.searchBar.blur();
	};
	
	onRowAction = function(e){
		var row = e.section.getItemAt(e.itemIndex);
		var id = row.properties.locale.id;
		
		if (e.action === ("+ " + L("lblFavorite"))){
			Alloy.Globals.analyticsEvent({action: "list-add_favorite", label: id});
			$FM.add(id);
		} else {
			Alloy.Globals.analyticsEvent({action: "list-remove_favorite", label: id});
			$FM.remove(id);
		}
		
		$.listView.editing = false;
		populateList();
	};
	$.listView.addEventListener("editaction", onRowAction);
}

$.listView.addEventListener("noresults", function(){
	$.listFooterLabelContainer.visible = true;
});

$.wrapper.addEventListener("open", function(){
	if (OS_ANDROID && $.listView.defaultItemTemplate === "favoriteTemplate"){
		var activity = $.wrapper.getActivity();
		activity.onCreateOptionsMenu = function(e) {
			e.menu.clear();
		};
		activity.invalidateOptionsMenu();
	}
});

Ti.App.addEventListener("profile-changed", function(params){
	params = params || {};
	params.profile = params.profile;
	params.listSource = params.listSource;
	
	var listSource = params.listSource || {},
		sectionIndex = listSource.sectionIndex,
		itemIndex = listSource.itemIndex;
	
	var itemData;
	
	if (params.profile && _.isNumber(sectionIndex) && _.isNumber(itemIndex)){
		Ti.API.debug("Updating item " + itemIndex + " in section " + sectionIndex + " with id " + params.profile.id);
		itemData = preprocessForListView([params.profile])[0];
		$.listView.sections[sectionIndex].updateItemAt(itemIndex, itemData);
	}
});

populateList();

exports.setTab = function(tab){
	currentTab = tab;
};
exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.listView.bottom = Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.add(AdMob.create({
			unitId: "ca-app-pub-5803114779573585/8333772750"
		}));
	} else {
		$.advContainer.removeAllChildren();
		
		$.listView.bottom = 0;
		$.advContainer.height = 0;
	}
};
exports.refresh = populateList;
exports.onSearchChange = onSearchChange;
exports.onBookmarkClick = onBookmarkClick;
