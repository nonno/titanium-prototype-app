exports.create = function(params){
	params = params || {};
	params.items = params.items || [];
	params.defaultKey = params.defaultKey;
	params.itemFindFunction = params.itemFindFunction;
	params.keyProperty = params.keyProperty || "key";
	params.textProperty = params.textProperty || "text";
	
	var filteredItems, preProcessItems, list, get, getDefault;
	
	filteredItems = _.clone(params.items);
	
	preProcessItems = function(){
		filteredItems = [];
		
		if (params.itemFindFunction){
			_.each(params.items, function(item){
				if (Boolean(_.find(Alloy.Globals.Data.locali, params.itemFindFunction(item)))){
					filteredItems.push(item);
				};
			});
		}
		
		filteredItems = filteredItems.sort(function(a, b){
			if (L(a[params.textProperty]) < L(b[params.textProperty])){ return -1; }
			if (L(a[params.textProperty]) > L(b[params.textProperty])){ return 1; }
			return 0;
		});
	};
	
	list = function(){
		return filteredItems;
	};
	
	get = function(key){
		if (!key){
			Ti.API.warn("get called without key");
			return null;
		}
		return _.find(filteredItems, function(item){ return item[params.keyProperty] === key; });
	};
	
	getDefault = function(){
		Ti.API.warn("Calling getDefault");
		
		if (params.defaultKey){
			return get(params.defaultKey);
		}
	};
	
	return {
		list: list,
		get: get,
		preProcessItems: preProcessItems,
		getDefault: getDefault
	};
};
