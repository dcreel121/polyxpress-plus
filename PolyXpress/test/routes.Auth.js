/**
 * Created by mhaungs on 11/6/14.
 */
var chai = require("chai");
var expect = chai.expect;

// Configuration
chai.config.includeStack = false; // turn on stack trace
chai.config.showDiff = false; // turn on diffs

// Placeholder tests until figure out how to test these and handle redirect
describe('Authorization', function(){
	describe('facebook', function(){
		it('should test facebook login.', function() {
			expect(1).to.equal(1);
		});
		it('should test facebook logout.');
		it('should test facebook unlink.');
	});
	describe('twitter', function(){
		it('should test twitter login.');
		it('should test twitter logout.');
		it('should test twitter unlink.');
	});
	describe('google', function(){
		it('should test google login.');
		it('should test google logout.');
		it('should test google unlink.');
	});
});
