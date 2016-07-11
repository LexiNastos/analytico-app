﻿(function () {
    'use strict';

    angular
        .module('app', ['ui.router'])
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            .state('analytics', {
                url: '/analytics/ga-analytics',
                templateUrl: 'analytics/ga-analytics/index.html',
                controller: 'GoogleAnalytics.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'ga-analytics' }
            })
            .state('ga-analytics', {
                url: '/analytics/ga-analytics',
                templateUrl: 'analytics/ga-analytics/index.html',
                controller: 'GoogleAnalytics.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'ga-analytics' }
            })
            .state('mc-analytics', {
                url: '/analytics/mc-analytics',
                templateUrl: 'analytics/mc-analytics/index.html',
                controller: 'MailChimp.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'mc-analytics' }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'about/index.html',
                controller: 'About.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'about' }
            })
            .state('logout', {
                url: '/logout',
                templateUrl: '', // Must include templateUrl, even if blank
                controller: 'logout.LogoutController',
                controllerAs: 'vm',
                data: { activeTab: 'logout' }
            });
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }



    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;
            angular.bootstrap(document, ['app']);
        });
    });
})();