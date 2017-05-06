'use strict';

angular.module('insight.names').controller('NamesController',
function($scope, $rootScope, $routeParams, $location, Global, Name, Zonefile, NameRecord, Profile) {
  $scope.global = Global;
  $scope.loading = false;
  $scope.webAccountTypes = Global.getWebAccountTypes()

  var _findName = function(domainName) {
    $scope.loading = true;

    if (domainName.indexOf('.') > -1) {
//      domainName = domainName.split('.')[0];
    } else {
      $rootScope.flashMessage = 'Invalid Name';
      $location.path('/');
    }

    Name.get({
      domainName: domainName
    }, function(response) {
      var nameRecord = response;
      nameRecord.dataRecord = "";
      nameRecord.domainName = domainName;
      nameRecord.ownerAddress = nameRecord.address;

      $rootScope.titleDetail = nameRecord.domainName;
      $scope.nameRecord = nameRecord;

      Zonefile.get({
        domainName: domainName
      }, function(response) {
        $scope.zonefile = response;
        $scope.loading = false;
      });

      Profile.get({
        domainName: domainName
      }, function(response) {
        $scope.person = new blockstack.Person(response[domainName][0])
        console.log($scope.person)
      })


      NameRecord.get({
        domainName: domainName
      }, function(response) {
         $scope.nameRecord.expire_block = response.expire_block
      });

    }, function(e) {
      console.log(e);

      if (e.status === 400) {
        $rootScope.flashMessage = 'Invalid Domain Name: ' + $routeParams.domainName;
      } else if (e.status === 404) {
        $scope.domainNameNotFound = domainName
        $scope.loading = false
      } else {
        $rootScope.flashMessage = 'Error loading name ' + domainName;
      }

    })
  };

  $scope.findThis = function() {
    _findName($routeParams.domainName);
  };

  $scope.getAccountUrl = function(account) {
    if(account.service === 'pgp') {
      return account.contentUrl
    } else {
      var webAccountTypes = Global.getWebAccountTypes()
      var urlTemplate = webAccountTypes[account.service].urlTemplate
      return urlTemplate.replace('{identifier}', account.identifier)
    }
  };

});
