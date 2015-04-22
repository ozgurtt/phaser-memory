'use strict';

require('angular');
require('angular-route');
require('angular-animate');
require('angular-messages');
//require('phaser');
global._ = require('lodash');
global.moment = require('moment');

var app = angular.module('SampleApp', ['ngRoute', 'ngAnimate', 'ngMessages']);

// pages
app.controller('HomeController', require('./pages/home/home-controller.js'));
app.controller('MemoryController', require('./pages/memory/memory-controller.js'));
app.controller('MinesweeperController', require('./pages/minesweeper/minesweeper-controller.js'));
app.controller('TetrisController', require('./pages/tetris/tetris-controller.js'));
app.controller('ShmupController', require('./pages/shmup/shmup-controller.js'));

// components (controllers exposed for testing)
app.directive('component', require('./components/component/component'));
app.controller('ComponentController', require('./components/component/component-controller.js'));

// resources
app.factory('ResourceService', require('./services/resource-service'));

// custom validators
app.directive('match', require('./validators/match'));

app.config([
  '$locationProvider',
  '$routeProvider',
  function ($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        template: require('./pages/home/home-template.jade'),
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .when('/memory', {
        template: require('./pages/memory/memory-template.jade'),
        controller: 'MemoryController',
        controllerAs: 'vm'
      })
      .when('/minesweeper', {
        template: require('./pages/minesweeper/minesweeper-template.jade'),
        controller: 'MinesweeperController',
        controllerAs: 'vm'
      })
      .when('/tetris', {
        template: require('./pages/tetris/tetris-template.jade'),
        controller: 'TetrisController',
        controllerAs: 'vm'
      })
      .when('/shmup', {
        template: require('./pages/shmup/shmup-template.jade'),
        controller: 'ShmupController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
]);

// Uncomment for debugging
//angular.module('utils').filter('isDefined', function () {
//  return function (value, msg) {
//    if (value === undefined) {
//      throw new Error('isDefined filter got undefined value ' + msg);
//    }
//    return value;
//  };
//});
