﻿(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q) {
        var service = {};

        service.GetCurrent = GetCurrent;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetGACommunityData = GetGACommunityData;
        service.SetGACommunityData = SetGACommunityData;
        service.GetMailChimpCommunityData = GetMailChimpCommunityData;


        return service;

        function GetGACommunityData(gaid) {
            return $http.put('/api/users/getGAcommunity/' + gaid).then(handleSuccess, handleError);
        }

        function SetGACommunityData(gaid, dataGA) {
            return $http.put('/api/users/setGAcommunity/' + gaid, dataGA).then(handleSuccess, handleError);
        }

        function GetMailChimpCommunityData(userid) {
            return $http.put('/api/users/mccommunity/' + userid).then(handleSuccess, handleError);
        }

        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
