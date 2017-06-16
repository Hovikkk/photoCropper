(function () {
    "use strict";

    angular.module("myapp", ["ionic", "ngCordova", "myapp.controllers", "myapp.services", "ion-gallery", "imageCropper", "ngImgCrop"])
        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                var st = location.href.split("#")[1];
                console.log(st)
                if (st == "/app/home") {
                    console.log("mta")
                    $ionicPlatform.registerBackButtonAction(function (event) {
                        console.log("lala")
                        dataStorage.exitGame = true;
                        $scope.$apply();
                    }, 100);
                } else {
                    console.log("ba")
                }

                $ionicPlatform.registerBackButtonAction(function (event) {
                    console.log("push back button ");
                    event.preventDefault();
                }, 100);
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                /*if (window.StatusBar) {
                    StatusBar.styleDefault();
                }*/
                if (window.StatusBar) {
                    StatusBar.hide();
                }
            });
            
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "app/templates/view-menu.html",
                controller: "appCtrl"
            })
            .state("app.home", {
                url: "/home",
                templateUrl: "app/templates/view-home.html",
                controller: "homeCtrl"
            })
            .state("app.galleryPage", {
                url: "/galleryPage",
                templateUrl: "app/templates/galleryPage.html",
                controller: "galleryPageCtrl"
            });
            $urlRouterProvider.otherwise("/app/home");
        })
        .config(function (ionGalleryConfigProvider) {
            ionGalleryConfigProvider.setGalleryConfig({
                action_label: 'Close',
                toggle: false,
                row_size: 3,
                fixed_row_size: true,
                zoom_events: false
            });
        });
})();