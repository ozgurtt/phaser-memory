'use strict';

xdescribe('PageController', function() {
  var that = this;

  beforeEach(angular.mock.module('SampleApp'));
  beforeEach(inject(function($rootScope, _$controller_) {
    that.scope = $rootScope;
    that.controller = _$controller_;
    that.controller('PageController', {'$scope': that.scope});
  }));

  it('fails', function() {
    expect(true).to.be.false;
  });
});