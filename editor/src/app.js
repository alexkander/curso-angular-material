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
        // .icon('add-group', './images/svg/add-group.svg', 48)
        .icon('close', './images/svg/close.svg', 48);

      $mdThemingProvider.theme('default')
          .primaryPalette('blue-grey') 
          .accentPalette('green')
          .warnPalette('red');

    }])

  .constant('LOCAL', location.hostname == 'localhost')

  .controller('GlobalCtrl', ['$scope', '$q', '$http', '$mdSidenav', '$mdDialog', '$timeout', 'serverService', 'LOCAL',
    function($scope, $q, $http, $mdSidenav, $mdDialog, $timeout, serverService, LOCAL){

      var count = 0;

      $scope.isLocal = LOCAL;
      $scope.conf = {nube: LOCAL, show: {html:true, css:false, js: false}};

      $scope.selected = {};
      $scope.samples = {};
      $scope.resultUrl = null;
      $scope.resultHtml = null;
      $scope.codes = {};
      $scope.ghiddens = {};

      $scope.toggleGroup = function(group){

        $scope.ghiddens[group] = !$scope.ghiddens[group];

      };

      $scope.toggleSideBar = function(id){

        $mdSidenav(id).toggle();

      };

      $scope.aceOptions = function(mode){

        return {
          mode: mode,
          useWrapMode:true,
          onLoad: function(_editor){
            _editor.setOptions({
              fontSize: '16px',
              tabSize: 2,
            });
          }
        };

      };

      $scope.cancelModal = function(){

        $mdDialog.cancel();
        $scope.record = null;

      };

      $scope.add = function(){
        $scope.selected = {};
        $scope.codes = {
          'index.html': { code: '', type: 'html', },
          'scripts.js': { code: '', type: 'javascript', },
          'styles.css': { code: '', type: 'css', },
        };
        $scope.m.play();
      };

      $scope.setup = function(ev){
        $scope.record = angular.extend({}, $scope.selected);
        $scope.m.select($scope.selected);
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
      
      $scope.delete = function(record, ev) {
        var confirm = $mdDialog.confirm()
          .parent(angular.element(document.body))
          .targetEvent(ev)
          .clickOutsideToClose(true)
          .fullscreen(true)
          .title('Está seguro que desea eliminar este proyecto?')
          .textContent('Si elimina este projecto no podrá recuperarlo?')
          .ariaLabel('Eliminar projecto')
          .ok('Si')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          $scope.m.remove(record);
        });
      };

      var server = {
        select: function(record){
          var promises = [];

          $scope.selected = record;
          $scope.codes = {};

          angular.forEach(record.files, function(url){
            $scope.codes[url] = {
              code: '',
              type: {
                'html': 'html',
                'css': 'css',
                'js': 'javascript',
              }[url.split('.').pop()],
            };

            promises.push($http.get(record.url + url + '?' + count).then(
              function(response){ $scope.codes[url].code = response.data;}
            ));

            count++;

          });

          $q.all(promises).then(function(){
            server.play();
          });

        },

        save: function(){

          if(!$scope.record)
            $scope.record = angular.extend({}, $scope.selected);
          
          var data = {
            record: angular.extend({}, $scope.record),
            codes: angular.extend({}, $scope.codes),
          };

          serverService.save(data).then(function(response){
            (function(ddd){

              if(response.data.success){

                $scope.record = null;
                var record = response.data.ddd;
                var id = record.id;
                var oldRecord = ddd.records[id] || {};
                var oldGroup = ddd.groups[oldRecord.type];

                if(record.type != oldRecord.type){

                  if(!ddd.groups[record.type])
                    ddd.groups[record.type] = [];

                  ddd.groups[record.type].push(id);

                  if(oldGroup){
                    var index = oldGroup.indexOf(id);
                    if(index>=0)
                      oldGroup.splice(index, 1);
                  }


                }

                var newRecord = angular.extend(oldRecord || {}, record);

                ddd.records[id] = newRecord;

                server.select(newRecord);
                $mdDialog.hide();

              }

            })($scope.samples.ddd);
          });

        },

        remove: function(record){

          var id = record.id;
          serverService.remove(id).then(function(response){
            if(response.data.success){

              var group = $scope.samples.ddd.groups[record.type];
              
              if(group){
                var index = group.indexOf(record.id);
                if(index>=0)
                  group.splice(index, 1);
              }

              delete $scope.samples.ddd.records[id];
            }
          });

        },

        play: function(){

          $scope.resultUrl = $scope.selected.url;

        },

        load: function(){

          $scope.samples = serverService.all();
          $scope.samples.then(function(response){
            (function(ddd){

              var ids = Object.keys(ddd.records);
              if(ids.length>0)
                server.select(ddd.records[ids[0]]);

              $scope.ghiddens = angular.extend({}, ddd.groups);

              $scope.toggleGroup(Object.keys(ddd.groups).pop());
              
            })(response.data.ddd);
          });

        }
      };


      $scope.linksAndScripts = serverService.linksAndScripts();

      $scope.m = server;

      $scope.m.load();

    }])

  .service('serverService', ['$q', '$http', function($q, $http){

    function createRequest(url){
      var request = $http.get(url)
      request.then(function(response){
        if(response.data.success){
          request.ddd = angular.extend({}, response.data.ddd);
        }
      });
      return request;
    }

    var all = createRequest('server/all.php');
    
    return {
      save: function(data){

        return $http.post('server/save.php', 'data=' + encodeURIComponent(JSON.stringify(data)));;

      },
      remove: function(id){

        return $http.post('server/delete.php', 'id=' + id);

      },
      linksAndScripts: function (){

        return createRequest('server/linksAndScripts.php');

      },
      all : function() {

        return all;

      }
    };

  }])

  .filter('trustUrl', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }])

  .filter('empty', [function() {
    return function(text) {
      return (text || '').trim() == '';
    };
  }])

  .filter('groupText', [function() {
    return function(text) {
      text = text || '';
      return text.trim() == ''? '[No especificado]' : text.toUpperCase();
    };
  }]);