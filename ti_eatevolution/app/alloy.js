if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	require('tests/testsRunner');
}