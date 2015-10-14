require("tests/ti-mocha");
mocha.setup({reporter: "ti-spec-studio"});

var requirePath, specsDir, specFiles, i;

requirePath = "tests/specs/";
specsDir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + requirePath);
specFiles = specsDir.getDirectoryListing();

for (i = 0; i < specFiles.length; i++) {
	require(requirePath + specFiles[i].replace(".js", ""));
}

Ti.API.info("\n\n==============================\nRunning logic tests\n==============================\n\n");
mocha.run(function(){
	Ti.API.info("\n\n==============================\nCompleted logic tests\n==============================\n\n\n ");
	Ti.App.fireEvent("testsExecutionComplete");
});
