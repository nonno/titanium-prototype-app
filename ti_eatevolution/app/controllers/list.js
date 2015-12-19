var AdMob = require("AdMob"),
	$FM = require("favoritesmgr"),
	ProfileTypeRepository = require("ProfileTypeRepository"),
	ProfileRepository = require("ProfileRepository");

var populateList, preprocessForListView, onItemClick, onFiltersClick, onSearchChange,
	currentTab, formatDistance, sortProfilesByDistance, sortProfilesByName, orderByDistance,
	onRowAction, iosSwipe, iosSwipePartial, webOrganization, webCampaign,
	modalWindowFilters;

onSearchChange = function(e){
	$.listView.searchText = e.source.value;
};

preprocessForListView = function(rawData) {
	return rawData.map(function(item) {
		var isFavorite = $FM.exists(item.id);
		var type = ProfileTypeRepository.get(item.tipo) || ProfileTypeRepository.getDefault();
		
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
			indirizzo: {text: ProfileRepository.addressToString(item)},
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

if (OS_IOS){
	iosSwipePartial = null;
	iosSwipe = function(indexes, swipeEvent){
		if (swipeEvent.direction === "left"){
			$.listView.sectionIndexTitles = indexes;
		}
		if (swipeEvent.direction === "right"){
			$.listView.sectionIndexTitles = null;
		}
	};
}

populateList = function(params){
	params = params || {};
	params.showGlobalLoading = _.isUndefined(params.showGlobalLoading) ? true : params.showGlobalLoading;
	params.onComplete = params.onComplete || function(){ return; };
	
	Ti.API.debug("list.populateList");
	
	if (params.showGlobalLoading){
		Alloy.Globals.loading.show();
	}
	
	var profiles, indexes, sections, groups, section;
	
	profiles = ProfileRepository.filter(Alloy.Globals.Data.profiles, Alloy.Globals.Data.filters);
	
	$.listFooterLabelContainer.visible = !profiles.length;
	
	if (Alloy.Globals.Data.orderByDistance){
		Ti.API.debug("Ordering by distance");
		
		profiles = profiles.sort(sortProfilesByDistance);
		
		section = Ti.UI.createListSection();
		section.items = preprocessForListView(profiles);
		
		$.listView.sections = [section];
	} else {
		Ti.API.debug("Ordering by name");
		
		profiles = profiles.sort(sortProfilesByName);
		
		indexes = [];
		sections = [];
		groups = null;
		
		// Group the data by first letter of last name to make it easier to create sections.
		groups = _.groupBy(profiles, function(item){
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
				color: Alloy.CFG.gui.baseTextColor
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
			if (iosSwipePartial){
				$.wrapper.removeEventListener("swipe", iosSwipePartial);
			}
			iosSwipePartial = _.partial(iosSwipe, indexes);
			
			$.wrapper.addEventListener("swipe", iosSwipePartial);
		}
	}
	
	if (params.showGlobalLoading){
		Alloy.Globals.loading.hide();
	}
	
	params.onComplete();
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

onFiltersClick = function(){
	var filtersController = Alloy.createController("filters", {"filters": Alloy.Globals.Data.filters});
	modalWindowFilters = Alloy.createController("modalWindow", {
		"innerController": filtersController,
		"leftNav": [
			{
				"button": Alloy.Globals.createModalWindowHeaderButton({"title": L("lblCancel")}),
				"listener": function(){ modalWindowFilters.close(); }
			}
		],
		"rightNav": [
			{
				"button": Alloy.Globals.createModalWindowHeaderButton({"title": OS_IOS ? L("lblDone") : L("lblConfirm")}),
				"listener": function(){
					Alloy.Globals.analyticsEvent({action: "list-data_filtering"});
					Alloy.Globals.Data.setFilters(filtersController.getFilters());
					
					modalWindowFilters.close();
				}
			}
		],
		"closeFunction": function(){}
	});
	
	modalWindowFilters.open();
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

orderByDistance = function(params){
	params = params || {};
	params.onComplete = params.onComplete || function(){ return; };
	
	ProfileRepository.calculateDistances().then(
		function(){
			Alloy.Globals.Data.orderByDistance = !Alloy.Globals.Data.orderByDistance;
			
			populateList({
				"onComplete": params.onComplete
			});
		},
		function(err){
			Ti.API.warn(err);
			
			Ti.UI.createAlertDialog({
				title: "",
				message: L("msgCurrentLocationUnavailable"),
				buttonNames: [L("lblOk")]
			}).show();
		}
	);
};

webOrganization = function(){
	Alloy.Globals.analyticsEvent({action: "list-organization"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
};
webCampaign = function(){
	Alloy.Globals.analyticsEvent({action: "list-campaign"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.campaign);
};

if (OS_IOS){
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

Ti.App.addEventListener("filterschanged", populateList);

Ti.App.addEventListener("profilechanged", function(params){
	params = params || {};
	params.profile = params.profile;
	params.listSource = params.listSource;
	
	var listSource = params.listSource || {},
		sectionIndex = listSource.sectionIndex,
		itemIndex = listSource.itemIndex;
	
	var itemData;
	
	if (params.profile && _.isNumber(sectionIndex) && _.isNumber(itemIndex) && $.listView.sections[sectionIndex]){
		Ti.API.debug("Updating item " + itemIndex + " in section " + sectionIndex + " with id " + params.profile.id);
		itemData = preprocessForListView([params.profile])[0];
		$.listView.sections[sectionIndex].updateItemAt(itemIndex, itemData);
	}
});

if (OS_IOS){
	$.listView.refreshControl = Ti.UI.createRefreshControl({});
	$.listView.refreshControl.addEventListener("refreshstart", function(){
		Ti.API.debug("refreshStart");
		populateList({
			"showGlobalLoading": false,
			"onComplete": function(){
				Ti.API.debug("endRefreshing");
				$.listView.refreshControl.endRefreshing();
			}
		});
	});
	
	(function(){
		var nsfLogo = Alloy.Globals.createNSFLogo();
		nsfLogo.addEventListener("singletap", webOrganization);
		$.wrapper.leftNavButton = nsfLogo;
		
		var filtersButton = Ti.UI.createLabel({
			"text": Alloy.Globals.Icons.fontAwesome.search,
			"color": Alloy.CFG.iosColor,
			"width": 26,
			"height": 26,
			"font": {
				"fontFamily": "font-awesome",
				"fontSize": 26
			}
		});
		filtersButton.addEventListener("click", onFiltersClick);
		
		var orderByButton = Ti.UI.createLabel({
			"text": Alloy.Globals.Icons.fontAwesome.sort,
			"color": Alloy.CFG.iosColor,
			"width": 26,
			"height": 26,
			"font": {
				"fontFamily": "font-awesome",
				"fontSize": 26
			}
		});
		orderByButton.addEventListener("click", orderByDistance);
		
		$.wrapper.rightNavButtons = [filtersButton, orderByButton];
	}());
}

populateList();

exports.setTab = function(tab){
	currentTab = tab;
};
exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		$.listView.bottom = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.removeAllChildren();
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
exports.onFiltersClick = onFiltersClick;
exports.orderByDistance = orderByDistance;
