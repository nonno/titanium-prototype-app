var args = arguments[0] || {},
	repository = args.repository,
	repositoryKey = args.repositoryKey,
	enabled = args.enabled || false;

var filterData, setEnabled, toggleEnabled;

setEnabled = function(){
	$.mainContainer.backgroundColor = enabled ? Alloy.CFG.gui.primaryColor : "#aaa";
};
toggleEnabled = function(){
	enabled = !enabled;
	
	setEnabled(enabled);
};
$.mainContainer.addEventListener("singletap", toggleEnabled);

if (repository && repositoryKey){
	filterData = repository.get(repositoryKey);
	
	if (filterData){
		$.label.text = L(filterData.text);
	}
}
setEnabled(enabled);

exports.getRepositoryKey = function(){ return repositoryKey; };
exports.isEnabled = function(){ return enabled };
exports.setEnabled = setEnabled;
