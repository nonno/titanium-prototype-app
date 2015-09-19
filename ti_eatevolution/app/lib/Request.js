var setCommonHeaders = function(xhr) {
	xhr.timeout = 30000;
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
};

var request = function(method, url, data, cbs) {
	Ti.API.debug("Http request: " + url);
	
	if (!Ti.Network.online){
		cbs.error("No connection");
	}
	
	var xhr = Ti.Network.createHTTPClient({
		enableKeepAlive: false
	});
	xhr.open(method, url);
	setCommonHeaders(xhr);
	xhr.onload = function() {
		Ti.API.debug("Http request success");
		
		cbs.success(xhr.responseText);
	};
	
	xhr.onerror = function() {
		Ti.API.debug("Http request error " + xhr.error);
		cbs.error(xhr.error);
	};
	
	xhr.send(data);
};

var get = function(url, cbs) {
	request("GET", url, null, cbs);
};

var post = function(url, data, cbs) {
	request("POST", url, data, cbs);
};

exports.post = post;
exports.get = get;