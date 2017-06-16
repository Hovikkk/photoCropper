(function () {
    "use strict";

    angular.module("myapp.controllers", [])

    .controller("appCtrl", ["$scope", function ($scope) {
    }])

    //homeCtrl provides the logic for the home screen
        .controller("homeCtrl", ["$scope", "$state", "$rootScope", "$window", "$ionicPlatform", "dataStorage", function ($scope, $state, $rootScope, $window, $ionicPlatform, dataStorage) {
        $ionicPlatform.ready(function () {
            if ($window.MobileAccessibility) {
                $window.MobileAccessibility.usePreferredTextZoom(false);
            }
        });
        $scope.$on('$ionicView.enter', function () {
            dataStorage.number = 0;
            dataStorage.picture = "";
            if (dataStorage.arrayPictur) {
                $scope.arrayPic = dataStorage.arrayPictur;
            } else {
                $scope.arrayPic = []
            }
            $scope.download = false
        })
        $rootScope.gotoGallery = function () {
            location.href = "#/app/galleryPage";
        }
        $rootScope.gotoHome = function () {
            location.href = "#/app/home";
        }
        $scope.myImage = function () {
            $scope.chooseSource = true;
        }
        $scope.closePopup = function () {
            $scope.chooseSource = false;
        }
        $scope.goToGallery = function () {
            location.href = "#/app/galleryPage";
            $scope.chooseSource = false;
        }

//crop_1
        /*console.log($scope)
        // Some cropper options.
        $scope.imageUrl = 'https://i.ytimg.com/vi/aRnFtfuIN2M/hqdefault.jpg';
        $scope.showControls = false;
        $scope.fit = false;
        $scope.myButtonLabels = {
            rotateLeft: ' (rotate left) ',
            rotateRight: ' (rotate right) ',
            zoomIn: ' (zoomIn) ',
            zoomOut: ' (zoomOut) ',
            fit: ' (fit) ',
            crop: ' [crop] '
        };

        $scope.updateResultImage = function (base64) {
            $scope.resultImage = base64;
         //   $scope.$apply(); // Apply the changes.
        };
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        */
 //crop_2
        /*$scope.myImage = '';
        $scope.myCroppedImage = '';

        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);*/

//crop_3
        $('.imageCroper').cropper({
            aspectRatio: 16 / 9,
            crop: function (e) {
                // Output the result data for cropping image.
                console.log(e.x);
                console.log(e.y);
                console.log(e.width);
                console.log(e.height);
                console.log(e.rotate);
                console.log(e.scaleX);
                console.log(e.scaleY);
            }
        });

        $scope.rotateLeft = function () {
            $('.imageCroper').cropper('rotate', 90);
        }
        $scope.rotateRigth = function () {
            $('.imageCroper').cropper('rotate', -90);
        }
        $scope.zoomAdd =  function () {
            $('.imageCroper').cropper("zoom", 0.1);
        }
        $scope.zoomOut = function () {
            $('.imageCroper').cropper("zoom", -0.1);
        }
        $scope.cropModal = function () {
            $('.imageCroper').cropper('setAspectRatio', 4 / 3);
           // $scope.download = true
            /*$('.imageCroper').cropper('getCroppedCanvas')

            $('.imageCroper').cropper('getCroppedCanvas', {
                width: 160,
                height: 90
            });*/

            //$().cropper("getCroppedCanvas", { width: 160, height: 90 })
        }
        $scope.cropModal2 = function () {
            $('.imageCroper').cropper('setAspectRatio', 16 / 9);
        }
        // Cropper
        $('.imageCroper').on({
            'build.cropper': function (e) {
                console.log(e.type);
            },
            'built.cropper': function (e) {
                console.log(e.type);
            },
            'cropstart.cropper': function (e) {
                console.log(e.type, e.action);
            },
            'cropmove.cropper': function (e) {
                console.log(e.type, e.action);
            },
            'cropend.cropper': function (e) {
                console.log(e.type, e.action);
            },
            'crop.cropper': function (e) {
                console.log(e.type, e.x, e.y, e.width, e.height, e.rotate, e.scaleX, e.scaleY);
            },
            'zoom.cropper': function (e) {
                console.log(e.type, e.ratio);
            }
        }).cropper();
        $scope.popupPhoto = function (s) {
            $scope.chooseSource = false;
            console.log(s);
            navigator.camera.getPicture(function (imageUri) {
                $scope.pic = imageUri;
                dataStorage.picture = $scope.pic;
                /*encodeImage($scope.pic, function (encodedImage) {
                    console.log("5")
                    dataStorage.pic = encodedImage;
                    $scope.pic = encodedImage;
                    console.log($scope.pic)
                    dataStorage.picture = $scope.pic;
                    
                    $scope.$apply();
                    console.log("6")
                });*/
                location.href = "#/app/galleryPage";
                $scope.$apply()

            }, null, {
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    encodingType: Camera.EncodingType.PNG,
                    correctOrientation: true,
                    sourceType: s
                });

        }
        
        function encodeImage(src, callback) {
            console.log("1")
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                img = new Image();
            console.log("2")
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                callback(canvas.toDataURL());
            }
            console.log("3")
            img.src = src;
            console.log("4")
        }
        $scope.refresh = function () {
            //refresh binding
            $scope.$broadcast("scroll.refreshComplete");
        };
    }])

    //errorCtrl managed the display of error messages bubbled up from other controllers, directives, myappService
    .controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
        //public properties that define the error message and if an error is present
        $scope.error = "";
        $scope.activeError = false;

        //function to dismiss an active error
        $scope.dismissError = function () {
            $scope.activeError = false;
        };

        //broadcast event to catch an error and display it in the error section
        $scope.$on("error", function (evt, val) {
            //set the error message and mark activeError to true
            $scope.error = val;
            $scope.activeError = true;

            //stop any waiting indicators (including scroll refreshes)
            myappService.wait(false);
            $scope.$broadcast("scroll.refreshComplete");

            //manually apply given the way this might bubble up async
            $scope.$apply();
        });
    }]);
})();