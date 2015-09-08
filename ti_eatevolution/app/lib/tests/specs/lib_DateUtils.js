var should = require('tests/should'),
	DateUtils = require('DateUtils');

describe("DateUtils", function() {

	describe("isDateIncluded", function(){
		
		it("should return true if the range includes the date", function() {
			var obj = {da : '2015-01-01', a : '2015-01-31'};
			var date = new Date(2015, 0, 15);
			var result = DateUtils.isDateIncluded(obj, date);
			
			result.should.be.true;
		});
		it("should return false if the range doesn't includes the date", function() {
			var obj = {da : '2015-01-01', a : '2015-01-31'};
			var date = new Date(2015, 5, 15);
			var result = DateUtils.isDateIncluded(obj, date);
			
			result.should.be.false;
		});
		
	});

});