(function () {
    "use strict";

    angular.module("myapp.controllers")
        .controller("galleryPageCtrl", ["$scope", "$rootScope", "$ionicSideMenuDelegate", "dataStorage", "$state", "$ionicPlatform", function ($scope, $rootScope, $ionicSideMenuDelegate, dataStorage, $state, $ionicPlatform) {
            
            $scope.items = [];
            console.log($scope.items)
            $scope.galleryFunction = function () {
                $scope.items = []

                var localPictur = JSON.parse(localStorage.getItem("picture"))
                if (localPictur !== null) {
                    for (var i = 0; i < localPictur.length; i++) {
                        if (localPictur[i].src !== undefined)
                            $scope.items.push({
                                count: localPictur[i].count,
                                src: localPictur[i].src,
                                type: localPictur[i].type,
                                crop: localPictur[i].crop
                            })
                    }
                }
                console.log(dataStorage.picture)
                if (dataStorage.picture !== "") {
                    $scope.items.push({
                        count: 1,
                        src: dataStorage.picture,
                        type: {
                            name: '16 / 9',
                            value: 16 / 9
                            
                        },
                        crop: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            rotate: 0,
                            scaleX: 1,
                            scaleY: 1,
                            zoomCrop: -10,
                        }
                    })
                }
                dataStorage.picture = "";
                localStorage.setItem("picture", JSON.stringify($scope.items))
              
                console.log($scope.items)
            }
            //methods-----------------------------------

            $scope.$on('$ionicView.enter', function () {
                $scope.openMenu = function () {
                    $ionicSideMenuDelegate.toggleLeft();
                }
                $scope.$apply();
                $scope.galleryFunction()
            })

            $scope.popupPhoto = function (s) {
                $scope.chooseSource = false;
                console.log(s);
                navigator.camera.getPicture(function (imageUri) {
                    $scope.pic = imageUri;
                    dataStorage.picture = $scope.pic;
                    $scope.items = []
                    $scope.galleryFunction();
                    $scope.$apply()
                    //$state.reload()

                }, null, {
                        quality: 50,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        encodingType: Camera.EncodingType.PNG,
                        correctOrientation: true,
                        sourceType: s
                    });
            }

            $scope.addImage = function () {
                $scope.chooseSource = true;
            }
            $scope.closePopup = function () {
                $scope.chooseSource = false;
            }
        }])
})();