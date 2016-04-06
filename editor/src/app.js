'use strict';

angular.module('app', ['ngMaterial', 'ngSanitize', 'ui.ace'])

  .config(['$mdThemingProvider', '$mdIconProvider', '$httpProvider',
    function($mdThemingProvider, $mdIconProvider, $httpProvider){

      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

      $mdIconProvider
        .defaultIconSet("./images/svg/avatars.svg", 128)
        .icon('add', './images/svg/add.svg', 48)
        .icon('save', './images/svg/save.svg', 48)
        .icon('backup', './images/svg/backup.svg', 48)
        .icon('play', './images/svg/play.svg', 48)
        .icon('settings', './images/svg/settings.svg', 48)
        .icon('code', './images/svg/code.svg', 48)
        .icon('cloud', './images/svg/cloud.svg', 48)
        .icon('download', './images/svg/download.svg', 48)
        .icon('home', './images/svg/home.svg', 48)
        .icon('delete', './images/svg/delete.svg', 48)
        .icon('up', './images/svg/up.svg', 48)
        .icon('down', './images/svg/down.svg', 48)
        .icon('selected', './images/svg/selected.svg', 48)
        .icon('close', './images/svg/close.svg', 48);

      $mdThemingProvider.theme('default')
          .primaryPalette('blue-grey') 
          .accentPalette('green')
          .warnPalette('red');

    }])

  .run(['storageService',
    function(storageService){
      storageService.setKey('codedit.');
    }])

  .constant('LOCAL', location.hostname == 'localhost')

  .controller('GlobalCtrl', ['$scope', '$q', '$http', '$mdSidenav', '$mdDialog', '$timeout', 'serverService', 'storageService', 'LOCAL',
    function($scope, $q, $http, $mdSidenav, $mdDialog, $timeout, serverService, storageService, LOCAL){

      var defCode = { css: '', js: '', html: '', };
      var mySamples = storageService.config('samples');
      var count = 0;

      $scope.isLocal = LOCAL;
      $scope.selected = {};
      $scope.samples = {};
      $scope.mySamples = {};
      $scope.resultHtml = null
      $scope.code = angular.extend({}, defCode);

      $scope.showHtml = true;
      $scope.showCss = false;
      $scope.showJs = false;

      var isRemote = function(record){
        return $scope.samples.data[record.id] == record;
      };

      var localId = function(){
        
        var id = storageService.get('sample.id', 1);
        storageService.set('sample.id', id+1);

        if(mySamples.get(id, false))
          return localId();

        return id;

      };

      $scope.selectSample = function(sample){

        $scope.selected = sample;

        if(!$scope.selected.links)
          $scope.selected.links = {};

        if(!$scope.selected.scripts)
          $scope.selected.scripts = {};

        if(isRemote($scope.selected)){

          var promises = [];

          angular.forEach($scope.code, function(value, key){
            if(sample[key])
              promises.push($http.get(sample[key]+'?'+count).then(
                function(response){ $scope.code[key] = response.data;},
                function(){ $scope.code[key] = ''; }
              ));
              count++;
          });

          $q.all(promises).then(function(){
            $scope.play();
          });

        }else{

          angular.forEach($scope.code, function(value, key){
            $scope.code[key] = storageService.get('sample-'+$scope.selected.id+'.'+key, '');
          });

          $scope.play();

        }

      };

      $scope.add = function(){
        $scope.selected = {};
        $scope.code = angular.extend({}, defCode);
        $scope.play();
      };
      
      $scope.upload = function(){

        if(!$scope.record)
          $scope.record = angular.extend({}, $scope.selected);
        
        $scope.record.id = null;

        if(isRemote($scope.selected))
          $scope.record.id = $scope.selected.id;
        
        var data = {
          record: angular.extend({}, $scope.record),
          code: angular.extend({}, $scope.code),
        };

        serverService.save(data).then(function(response){
          if(response.data.success){
            $scope.record = null;
            $scope.selectSample($scope.samples.data[response.data.data.id]);
            $mdDialog.hide();
          }
        });
        
      };

      $scope.update = function(){

        if(!$scope.record)
          $scope.record = angular.extend({}, $scope.selected);
        
        var id;
        if(isRemote($scope.selected) || !$scope.selected.id)
          id = localId();
        else
          id = $scope.selected.id;

        if(($scope.record.name || '').trim() == '')
          $scope.record.name = 'project-' + id;

        $scope.record.id = id;

        mySamples.set(id, $scope.record);
        $scope.mySamples[id] = $scope.record;

        storageService.set('sample-'+id+'.html', $scope.code.html);
        storageService.set('sample-'+id+'.css', $scope.code.css);
        storageService.set('sample-'+id+'.js', $scope.code.js);
        
        $scope.record = null;
        $scope.selectSample($scope.mySamples[id]);
        $mdDialog.hide();

      };

      $scope.save = function(){

        $scope[isRemote($scope.selected)?'upload':'update']();

      };

      $scope.play = function(){

        var strHtml,
          html = angular.element('<html/>'),
          head = angular.element('<head/>'),
          body = angular.element('<body/>').html($scope.code.html),
          css = angular.element('<style/>').html($scope.code.css),
          js = angular.element('<script/>').html($scope.code.js);

        angular.forEach($scope.selected.links, function(attrs, key){
          head.append(angular.element('<link/>').attr(attrs));
        });

        angular.forEach($scope.selected.scripts, function(attrs, key){
          body.append(angular.element('<script/>').attr(attrs));
        });

        html.append(head.append(css)).append(body.append(js))

        $scope.resultHtml = '';
        $timeout(function(){
          $scope.resultHtml = angular.element('<div/>').append(html).html()+"\n";
        }, 100);

      };

      $scope.settings = function(record, ev){
        $scope.selectSample(record);
        $scope.record = angular.extend({}, $scope.selected);
        $mdDialog.show({
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: true,
          templateUrl: 'src/views/project.html',
          preserveScope: true,
          scope: $scope,
        }).then(function(){}, function(){});
      };

      $scope.toggle = function (key, list, item) {
        if(!list[key])
          list[key] = item;
        else
          delete list[key];
      };

      $scope.exists = function (item, list) {

        return !!list[item];

      };

      $scope.cancelModal = function(){
        $mdDialog.cancel();
        $scope.record = null;
      };

      $scope.delete = function(record, ev) {
        var confirm = $mdDialog.confirm()
          .parent(angular.element(document.body))
          .targetEvent(ev)
          .clickOutsideToClose(true)
          .fullscreen(true)
          .title('Está seguro que desea eleiminar este proyecto?')
          .textContent('Si elimina este projecto no podrá recuperarlo?')
          .ariaLabel('Eliminar projecto')
          .ok('Si')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          var id = record.id;

          if(isRemote(record)){

            serverService.delete(id);
            delete $scope.samples.data[id];

          }else{

            mySamples.remove(id);
            storageService.remove('sample-'+id+'.html');
            storageService.remove('sample-'+id+'.css');
            storageService.remove('sample-'+id+'.js');
            delete $scope.mySamples[id];

          }

        });
      };

      $scope.toggleSideBar = function(id){

        $mdSidenav(id).toggle();

      };

      $scope.aceOptions = function(mode){
        return {
          // mode: mode,
          useWrapMode:true,
          onLoad: function(_editor){
            _editor.setOptions({
              fontSize: '16px',
              tabSize: 2,
            });
          }
        };
      };

      $scope.linksAndScripts = serverService.linksAndScripts();

      $scope.samples = serverService.all();
      $scope.mySamples = mySamples.all();

      $scope.samples.then(function(response){
        (function(list){

          var ids = Object.keys(list);
          if(ids.length>0){
            var id = ids[0];
            $scope.selectSample(list[id]);
          }
          
        })($scope.mySamples.length? $scope.mySamples : response.data.data);
      });

    }])

  .service('storageService', [function() {
    var appKey = null;
    var service = {
      setKey: function(newAppKey) {
        return appKey = newAppKey;
      },
      get: function(key, def) {
        var value = localStorage.getItem(appKey + key);
        return value? JSON.parse(value) : def;
      },
      set: function(key, value) {
        return localStorage.setItem(appKey + key, JSON.stringify(value));
      },
      remove: function(key) {
        return localStorage.removeItem(appKey + key);
      },
      config: function(globalKey){
        return {
          all: function(){
            return service.get(globalKey) || {};
          },
          get: function(key, def){
            return this.all()[key] || def;
          },
          set: function(key, valor){
            var data = this.all();
            data[key] = valor;
            return service.set(globalKey, data);
          },
          remove: function(key){
            var data = this.all();
            delete data[key];
            return service.set(globalKey, data);
          }
        };
      },
    };

    return service;

  }])

  .service('serverService', ['$q', '$http', 'storageService', function($q, $http, storageService){

    function createRequest(url){
      var request = $http.get(url)
      request.then(function(response){
        if(response.data.success){
          request.data = angular.extend({}, response.data.data);
        }
      });
      return request;
    }
    
    var all = createRequest('server/all.php');
    var linksAndScripts = createRequest('server/linksAndScripts.php');

    return {
      save: function(data){

        var request = $http.post('server/save.php', 'data=' + encodeURIComponent(JSON.stringify(data)));

        request.then(function(response){
          if(response.data.success){
            var record = response.data.data;
            all.data[record.id] = record = angular.extend(all.data[record.id] || {}, record);
          }
        });

        return request;

      },
      delete: function(id){

        return $http.post('server/delete.php', 'id=' + id);

      },
      linksAndScripts: function (){

        return linksAndScripts;

      },
      all : function() {

        return all;

      }
    };

  }])

  .filter('trust', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }])

  .filter('empty', [function() {
    return function(text) {
      return (text || '').trim() == '';
    };
  }]);
