(function () {
  'use strict';

  angular
    .module('ion-gallery', ['templates'])
    .directive('ionGallery', ionGallery);

  ionGallery.$inject = ['$ionicPlatform', 'ionGalleryHelper', 'ionGalleryConfig'];

  function ionGallery($ionicPlatform, ionGalleryHelper, ionGalleryConfig) {
    controller.$inject = ["$scope", "$rootScope"];
    return {
      restrict: 'AE',
      scope: {
        ionGalleryItems: '=ionGalleryItems',
        ionGalleryRowSize: '=?ionGalleryRow',
        ionItemCallback: '&?ionItemCallback'
      },
      controller: controller,
      link: link,
      replace: true,
      templateUrl: 'gallery.html'
    };

    function controller($scope, $rootScope) {
      var _rowSize = parseInt($scope.ionGalleryRowSize);

      var _drawGallery = function () {
        $scope.ionGalleryRowSize = ionGalleryHelper.getRowSize(_rowSize || ionGalleryConfig.row_size, $scope.ionGalleryItems.length);
        $scope.actionLabel = ionGalleryConfig.action_label;
        $scope.items = ionGalleryHelper.buildGallery($scope.ionGalleryItems, $scope.ionGalleryRowSize);
        $scope.responsiveGrid = parseInt((1 / $scope.ionGalleryRowSize) * 100);
      };

      _drawGallery();

      (function () {
        $scope.$watch(function () {
          return $scope.ionGalleryItems.length;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            _drawGallery();
          }
        });
      }());

    }

    function link(scope, element, attrs) {

      scope.customCallback = angular.isFunction(scope.ionItemCallback) && attrs.hasOwnProperty('ionItemCallback')
      scope.ionSliderToggle = attrs.ionGalleryToggle === 'false' ? false : ionGalleryConfig.toggle;
    }
  }
})();

(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .provider('ionGalleryConfig',ionGalleryConfig);

  ionGalleryConfig.$inject = [];

  function ionGalleryConfig(){
    this.config = {
      action_label: 'Done',
      toggle: true,
      row_size: 3,
      fixed_row_size: true
    };

    this.$get = function() {
        return this.config;
    };

    this.setGalleryConfig = function(config) {
        angular.extend(this.config, this.config, config);
    };
  }

})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .service('ionGalleryHelper',ionGalleryHelper);

  ionGalleryHelper.$inject = ['ionGalleryConfig'];

  function ionGalleryHelper(ionGalleryConfig) {

    this.getRowSize = function(size,length){
      var rowSize;

      if(isNaN(size) === true || size <= 0){
        rowSize = ionGalleryConfig.row_size;
      }
      else if(size > length && !ionGalleryConfig.fixed_row_size){
        rowSize = length;
      }
      else{
        rowSize = size;
      }

      return rowSize;

    };

    this.buildGallery = function(items,rowSize){
      var _gallery = [];
      var row = -1;
      var col = 0;

      for(var i=0;i<items.length;i++){

        if(i % rowSize === 0){
          row++;
          _gallery[row] = [];
          col = 0;
        }

        if(!items[i].hasOwnProperty('sub')){
          items[i].sub = '';
        }

        if(!items[i].hasOwnProperty('thumb')){
          items[i].thumb = items[i].src;
        }

        items[i].position = i;

        _gallery[row][col] = items[i];
        col++;
      }

      return _gallery;
    };
  }
})();

(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionImageScale',ionImageScale);

  ionImageScale.$inject = [];

  function ionImageScale(){
    
    return {
      restrict: 'A',
      link : link
    };

    function link(scope, element, attrs) {
      
      var scaleImage = function(context,value) {
        if(value>0){
          if(context.naturalHeight >= context.naturalWidth){
            element.attr('width','100%');
          }
          else{
            element.attr('height',element.parent()[0].offsetHeight+'px');
          }
        } 
      };
      
      element.bind("load" , function(e){
        var _this = this;
        if(element.parent()[0].offsetHeight > 0){
          scaleImage(this,element.parent()[0].offsetHeight);
        }
        
        scope.$watch(function(){
          return element.parent()[0].offsetHeight;
        },function(newValue){
          scaleImage(_this,newValue);
        });
      });
    }
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionRowHeight',ionRowHeight);

  ionRowHeight.$inject = ['ionGalleryConfig'];

  function ionRowHeight(ionGalleryConfig){
    
    return {
      restrict: 'A',
      link : link
    };

    function link(scope, element, attrs) {
      scope.$watch( 
        function(){
          return scope.ionGalleryRowSize;
        },
        function(newValue,oldValue){
          if(newValue > 0){
            element.css('height',element[0].offsetWidth * parseInt(scope.responsiveGrid)/100 + 'px');
          }
        });
    }
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlideAction',ionSlideAction);

  ionSlideAction.$inject = ['$ionicGesture','$timeout'];

  function ionSlideAction($ionicGesture, $timeout){
    
    return {
      restrict: 'A',
      link : link
    };

    function link(scope, element, attrs) {
      
      var isDoubleTapAction = false;
      
      var pinchZoom = function pinchZoom(){
          scope.$emit('ZoomStarted');
      };
      
      var imageDoubleTapGesture = function imageDoubleTapGesture(event) {
        
        isDoubleTapAction = true;
        
        $timeout(function(){
          isDoubleTapAction = false;
          scope.$emit('DoubleTapEvent',{ 'x': event.gesture.touches[0].pageX, 'y': event.gesture.touches[0].pageY});
        },200);
      };

      var imageTapGesture = function imageTapGesture(event) {
        
        if(isDoubleTapAction === true){
          return;
        }
        else{
          $timeout(function(){
            if(isDoubleTapAction === true){
              return;
            }
            else{
              scope.$emit('TapEvent');
            }
          },200);
        }
      };
      
      var pinchEvent = $ionicGesture.on('pinch',pinchZoom,element);
      var doubleTapEvent = $ionicGesture.on('doubletap', function(e){imageDoubleTapGesture(e);}, element);
      var tapEvent = $ionicGesture.on('tap', imageTapGesture, element);
      
      scope.$on('$destroy', function() {
        $ionicGesture.off(doubleTapEvent, 'doubletap', imageDoubleTapGesture);
        $ionicGesture.off(tapEvent, 'tap', imageTapGesture);
        $ionicGesture.off(pinchEvent, 'pinch', pinchZoom);
      });
    }
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlider',ionSlider);

  ionSlider.$inject = ['$ionicModal', 'ionGalleryHelper', '$ionicPlatform', '$timeout', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', 'dataStorage'];

  function ionSlider($ionicModal, ionGalleryHelper, $ionicPlatform, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, dataStorage){

    controller.$inject = ["$scope"];
    return {
      restrict: 'A',
      controller: controller,
      link : link
    };

    function controller($scope){
      var lastSlideIndex;
      var currentImage;

      var rowSize = $scope.ionGalleryRowSize;
      var zoomStart = false;

      $scope.selectedSlide = 1;
      $scope.hideAll = false;
      $scope.showButon = false;
      $(".selectResize").prop('disabled', true);
      $(".inputResize").prop('disabled', true);
      $scope.optionsType = [
          {
              name: '16 / 9',
              value: 16 / 9
          },
          {
              name: '4 / 3',
              value: 4 / 3
          }
      ];
        
      $scope.gal = function (ind) {
          dataStorage.closeModalBoolian = true
          ind++;
          console.log(ind)
          $scope.showButon = true;
          $scope.cropOpen = true;
          $scope.cropOpenToo = true;
          $scope.numCropOpen = 0;
          $ionicSlideBoxDelegate.enableSlide(false);
          //console.log($scope.showButon)
          //console.log($(".selectResize option:selected").text())
          var imageSelectText = $(".selectResize option:selected").text()
          //console.log(imageSelectText.split('/')[0])
          //console.log(imageSelectText.split('/')[1])
          //console.log($(".selectResize").val("1"));
          console.log($('.selectResize>option:selected').val())
          /*var defoltSelectText = $('.selectResize>option:selected').val();
          console.log(defoltSelectText)
          $scope.defLeftNameNumber = defoltSelectText.split('/')[0];
          $scope.defRightNameNumber = defoltSelectText.split('/')[1];*/

          //console.log(dataStorage.defRightNameNumber)
          //console.log(dataStorage.defLeftNameNumber)
          /*if ((dataStorage.defRightNameNumber == undefined) && (dataStorage.defLeftNameNumber == undefined)) {
              dataStorage.defLeftNameNumber = 16;
              dataStorage.defRightNameNumber = 9
          }*/
          var localPicturArr = JSON.parse(localStorage.getItem("picture"))
          console.log(localPicturArr)
          console.log(this)
          var selfDef = this;
          /*$scope.x = this.$parent.single.crop.x;
          $scope.y = this.$parent.single.crop.y;
          $scope.width = this.$parent.single.crop.width;
          $scope.height = this.$parent.single.crop.height;
          $scope.rotate = this.$parent.single.crop.rotate;
          $scope.scaleX = this.$parent.single.crop.scaleX;
          $scope.scaleY = this.$parent.single.crop.scaleY;*/

          var defoltSelectText = this.$parent.single.type.name;
          var data = this.$parent.single.crop;
          var type = this.$parent.single.type.value;
          console.log(defoltSelectText)
          $scope.defLeftNameNumber = defoltSelectText.split('/')[0];
          $scope.defRightNameNumber = defoltSelectText.split('/')[1];
          //$(".selectResize").removeAttr("disabled")
          //$(".inputResize").removeAttr("disabled")
          $(".selectResize").prop('disabled', false);
          $(".inputResize").prop('disabled', false);
          console.log(data)
          
          
          //$('.imageGallery').cropper("zoom", parseFloat(this.$parent.single.crop.zoomCrop));
          var cropMy = ".slider-slide:nth-child(" + ind + ") .imageGallery";
          //console.log($(cropMy).cropper("getDataURL", { width: 320, height: 180 }, "image/jpeg", 0.8))
          $scope.zoomAdd = function () {
             // $scope.zooming = parseFloat(selfDef.$parent.single.crop.zoomCrop)
             // $scope.zooming += 0.1;
             // console.log(parseFloat(selfDef.$parent.single.crop.zoomCrop));
             // selfDef.$parent.single.crop.zoomCrop = $scope.zooming
             //   $scope.zoomCrop += 0.1;
              $(cropMy).cropper("zoom", 0.1);
          }
          $scope.zoomOut = function () {
             // $scope.zooming = parseFloat(selfDef.$parent.single.crop.zoomCrop)
             // $scope.zooming -= 0.1;
             // console.log(parseFloat(selfDef.$parent.single.crop.zoomCrop));
             // selfDef.$parent.single.crop.zoomCrop = $scope.zooming
              //$scope.zoomCrop -= 0.1
              $(cropMy).cropper("zoom", -0.1);
          }
          $scope.rotateLeft = function () {
              $(cropMy).cropper('rotate', 10);
             

          }
          $scope.rotateRigth = function () {
              $(cropMy).cropper('rotate', -10);
          }
          //if (data)
          $(cropMy).cropper({
              aspectRatio: type,
              ready: function (e) {
                  if (data.height > 0) {
                      
                      if (data.zoomCrop>-5){
                          $(cropMy).cropper("zoomTo", data.zoomCrop);
                      }
                      $(cropMy).cropper("setData", data);
                  } else {
                      console.log($(cropMy).cropper("getData"));
                  }
              },
              cropend: function (e) {
                  var getCroppedCanvas = $(cropMy).cropper('getCroppedCanvas');
                  console.log(getCroppedCanvas)
                  var getDataURL = $(cropMy).cropper("getDataURL", { width: 320, height: 180 }, "image/jpeg", 0.8)
                  console.log(getDataURL)
                  var getDataURL = $(cropMy).cropper('getCropBoxData');
                  console.log(getDataURL)
              },
              zoom: function (e) {
                  data.zoomCrop = e.ratio
              },

              crop: function (e) {
                  var saveData = $(this).cropper("getData");
                  saveData.zoomCrop = data.zoomCrop;
                  selfDef.$parent.single.crop = saveData;
                  console.log(saveData);

              },
              getData: function (e) {
                  
              }
              /* crop: function (e) {
                 
                  if ($scope.cropOpen) {
                      e.x = parseFloat(selfDef.$parent.single.crop.x)
                      e.y = parseFloat(selfDef.$parent.single.crop.y)
                      e.width = parseFloat(selfDef.$parent.single.crop.width)
                      e.height = parseFloat(selfDef.$parent.single.crop.height)
                      e.rotate = parseFloat(selfDef.$parent.single.crop.rotate)
                      e.scaleX = parseFloat(selfDef.$parent.single.crop.scaleX)
                      e.scaleY = parseFloat(selfDef.$parent.single.crop.scaleY)
                      $scope.numCropOpen++;
                      if ($scope.numCropOpen >= 3) {
                          $scope.cropOpen = false;
                          if (parseFloat(selfDef.$parent.single.crop.zoomCrop) != 0) {
                              $scope.zoomArr = parseFloat(selfDef.$parent.single.crop.zoomCrop)
                              console.log($scope.zoomArr);
                         //   $('.imageGallery').cropper("zoom", $scope.zoomArr);
                          }
                      }
                  }
              
                   $scope.numCropOpen++;
                      if ($scope.numCropOpen <= 3) {
                          $scope.cropOpen = false
                     }
                  }
                  
                  
                  if ($scope.cropOpenToo && dataStorage.x) {
                      e.x = dataStorage.x;
                      e.y = dataStorage.y;
                      e.width = dataStorage.width;
                      e.height = dataStorage.height;
                      e.rotate = dataStorage.rotate;
                      e.scaleX = dataStorage.scaleX;
                      e.scaleY = dataStorage.scaleY;
                      $scope.numCropOpen++;
                      if ($scope.numCropOpen > 3) {
                          $scope.cropOpenToo = false
                      }
                      
                  }
                  
              
                  selfDef.$parent.single.crop.x = e.x;
                  selfDef.$parent.single.crop.y = e.y;
                  selfDef.$parent.single.crop.width = e.width;
                  selfDef.$parent.single.crop.height = e.height;
                  selfDef.$parent.single.crop.rotate = e.rotate;
                  selfDef.$parent.single.crop.scaleX = e.scaleX;
                  selfDef.$parent.single.crop.scaleY = e.scaleY
                  
                  
                  dataStorage.x = e.x
                  dataStorage.y = e.y
                  dataStorage.width = e.width
                  dataStorage.height = e.height
                  dataStorage.rotate = e.rotate
                  dataStorage.scaleX = e.scaleX
                  dataStorage.scaleY = e.scaleY
                  
                  
                  
                  if (parseFloat(selfDef.$parent.single.crop.zoomCrop) != 0) {
                      $scope.zoomArr = parseFloat(selfDef.$parent.single.crop.zoomCrop)
                      console.log($scope.zoomArr);
                      //$('.imageGallery').cropper("zoom", $scope.zoomArr);
                  }
                 // $scope.zoomCrop = 0
                  if (selfDef.$parent.single.crop.zoomCrop != '0') {
                     // $('.imageGallery').cropper("zoom", selfDef.$parent.single.crop.zoomCrop);
                  }
                  
                  //$scope.$apply();
              }
             */
          });

      //  $('.imageGallery').cropper("zoom", data.zoomCrop);
          
         
      }
      $(document).click(function (event) {
          console.log("1-1")
          if (dataStorage.closeModalBoolian) {
              console.log("2-2")
              if ($(event.target).closest(".clickImageGallery").length) return;   //при клике на эти блоки не скрывать .display_settings_content
              //console.log(selfDef)

              $ionicSlideBoxDelegate.enableSlide(true);

              $(".imageGallery").cropper("destroy");
              //console.log(dataStorage.x);
              console.log(event)
              //console.log($scope.optionsType.x)
              if (JSON.parse(localStorage.getItem("picture")) != undefined) {
                  localStorage.setItem("picture", JSON.stringify($scope.items[0]))
              }
              
              
              $scope.showButon = false;  //скрываем .display_settings_content при клике вне .display_settings_content
              $(".selectResize").prop('disabled', true);
              $(".inputResize").prop('disabled', true);
              event.stopPropagation();
              $scope.$apply();
          }
          
      });
      $scope.hideButon = function () {
          
      }
      
      
      $('.imageGallery').on({
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
      $scope.galleryChanged = function (data) {
          console.log(data.name);
          $scope.rightNameNumber = parseInt(data.name.split('/')[1]);
          dataStorage.defRightNameNumber = $scope.rightNameNumber
          console.log($scope.name)
          $scope.leftNameNumber = parseInt(data.name.split('/')[0]);
          dataStorage.defLeftNameNumber = $scope.leftNameNumber
          console.log($scope.name)
         // console.log($('.imageGallery').cropper('setAspectRatio', data.name))

          $('.imageGallery').cropper('setAspectRatio', $scope.leftNameNumber / $scope.rightNameNumber);
          
      }
      $scope.showImage = function(index) {
        $scope.slides = [];
        currentImage = index;
        console.log("-----"+currentImage + " --- ")
        var galleryLength = $scope.ionGalleryItems.length;
       /* if ($scope.showButon){
            $scope.slides[0] = $scope.ionGalleryItems[index];
        } else {
            var previndex = index - 1 < 0 ? galleryLength - 1 : index - 1;
            var nextindex = index + 1 >= galleryLength ? 0 : index + 1;

            $scope.slides[0] = $scope.ionGalleryItems[previndex];
            $scope.slides[1] = $scope.ionGalleryItems[index];
        $scope.slides[2] = $scope.ionGalleryItems[nextindex];
        }*/
       // $scope.slides[0] = $scope.ionGalleryItems[index];
        var previndex = index - 1 < 0 ? galleryLength - 1 : index - 1;
        var nextindex = index + 1 >= galleryLength ? 0 : index + 1;

        $scope.slides[0] = $scope.ionGalleryItems[previndex];
        $scope.slides[1] = $scope.ionGalleryItems[index];
        $scope.slides[2] = $scope.ionGalleryItems[nextindex];
        lastSlideIndex = 0;
        $scope.loadModal();
      };

      $scope.slideChangeda = function(currentSlideIndex) {

        if(currentSlideIndex === lastSlideIndex){
          return;
        }
        
        var slideToLoad = $scope.slides.length - lastSlideIndex - currentSlideIndex;
        var galleryLength = $scope.ionGalleryItems.length;
        var imageToLoad;
        var slidePosition = lastSlideIndex + '>' + currentSlideIndex;

        if(slidePosition === '0>1' || slidePosition === '1>2' || slidePosition === '2>0'){
          currentImage++;

          if(currentImage >= galleryLength){
            currentImage = 0;
          }

          //imageToLoad = currentImage + 1;
          console.log("+++++" + currentImage + " --- " + imageToLoad);
          if( imageToLoad >= galleryLength){
            imageToLoad = 0;
          }
        }
        else if(slidePosition === '0>2' || slidePosition === '1>0' || slidePosition === '2>1'){
          currentImage--;

          if(currentImage < 0){
            currentImage = galleryLength - 1 ;
          }

          imageToLoad = currentImage - 1;

          if(imageToLoad < 0){
            imageToLoad = galleryLength - 1;
          }
        }
        console.log("+++++" + currentImage + " --- " + imageToLoad);
        //Clear zoom
        $ionicScrollDelegate.$getByHandle('slide-' + slideToLoad).zoomTo(1);

        $scope.slides[slideToLoad] = $scope.ionGalleryItems[imageToLoad];

        lastSlideIndex = currentSlideIndex;
      };

      $scope.$on('ZoomStarted', function(e){
        $timeout(function () {
          zoomStart = true;
          $scope.hideAll = true;
        });

      });

      $scope.$on('TapEvent', function(e){
        $timeout(function () {
          _onTap();
        });

      });

      $scope.$on('DoubleTapEvent', function(event,position){
        $timeout(function () {
          _onDoubleTap(position);
        });

      });

      var _onTap = function _onTap(){

        if(zoomStart === true){
          $ionicScrollDelegate.$getByHandle('slide-'+lastSlideIndex).zoomTo(1,true);

          $timeout(function () {
            _isOriginalSize();
          },300);

          return;
        }

        if(($scope.hasOwnProperty('ionSliderToggle') && $scope.ionSliderToggle === false && $scope.hideAll === false) || zoomStart === true){
          return;
        }

        $scope.hideAll = !$scope.hideAll;
      };

      var _onDoubleTap = function _onDoubleTap(position){
        if(zoomStart === false){
          $ionicScrollDelegate.$getByHandle('slide-'+lastSlideIndex).zoomTo(3,true,position.x,position.y);
          zoomStart = true;
          $scope.hideAll = true;
        }
        else{
          _onTap();
        }
      };

      function _isOriginalSize(){
        zoomStart = false;
        _onTap();
      }

    }

    function link(scope, rootScope, element, attrs) {
      var _modal;

      scope.loadModal = function(){
        $ionicModal.fromTemplateUrl('slider.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal) {
          _modal = modal;
          scope.openModal();
        });
      };
      scope.openModal = function() {
        _modal.show();
      };

      scope.closeModal = function () {
          console.log(scope.items)
          console.log(dataStorage.closeModalBoolian)
          dataStorage.closeModalBoolian = false;
          console.log(dataStorage.closeModalBoolian)
          //scope.closeModalBool = false;
          localStorage.setItem("picture", JSON.stringify(scope.items[0]))
        _modal.hide();
      };
      //<ion-modal-view ng-if=\"!showButon\" class=\"imageView\">\n  <ion-header-bar class=\"headerView\" ng-show=\"!hideAll\">\n   <button class=\"button button-outline button-light close-btn\" ng-click=\"closeModal()\">{{::actionLabel}}</button>\n  </ion-header-bar>\n    \n  <ion-content class=\"has-no-header\" scroll=\"false\">\n    <ion-slide-box does-continue=\"true\" active-slide=\"selectedSlide\" show-pager=\"false\" class=\"listContainer\" on-slide-changed=\"slideChanged($index)\">\n      <ion-slide ng-click=\"hideButon()\" ng-repeat=\"single in slides track by $index\">\n        <ion-scroll direction=\"xy\"\n                    locking=\"true\" \n                    zooming=\"false\"\n                    min-zoom=\"1\"\n                    scrollbar-x=\"false\"\n                    scrollbar-y=\"false\"\n                    ion-slide-action\n                    delegate-handle=\"slide-{{$index}}\"\n                    overflow-scroll=\"false\"\n                    >\n    <select ng-show=\"showButon\"   class=\"galleryOptions clickImageGallery\" ng-model=\"single.type\" ng-change=\"galleryChanged(single.type)\" ng-options=\"option.name for option in optionsType track by option.value\" >></select>  <input ng-show=\"showButon\"  type=\"number\"ng-model=\"single.count\" class=\"numeric galleryOptions clickImageGallery\"/>\n   <div class=\"item item-image gallery-slide-view clickImageGallery\">\n          <img class=\"imageGallery\" ng-click=\"gal()\"  ng-src=\"{{single.src}}\">\n         </div>\n <div class=\"divButon\" ng-show=\"showButon\"> <button type=\"button\" class=\"leftRepeat clickImageGallery\" ng-click=\"rotateLeft()\"> </button> <button type=\"button\" class=\"rightRepeat clickImageGallery\" ng-click=\"rotateRigth()\"> </button> <button type=\"button\" class=\"zoomAdd clickImageGallery\" ng-click=\"zoomAdd()\"> + </button> <button type=\"button\" class=\"zoomOut clickImageGallery\" ng-click=\"zoomOut()\"> - </button> </div>       <div ng-if=\"single.sub.length > 0\" class=\"image-subtitle\" ng-show=\"!hideAll\">\n            <span ng-bind-html=\'single.sub\'></span>\n        </div>\n        </ion-scroll>\n      </ion-slide>\n    </ion-slide-box>\n  </ion-content>\n</ion-modal-view>
      //<ion-modal-view class=\"imageView\">\n  <ion-header-bar class=\"headerView\" ng-show=\"!hideAll\">\n   <button class=\"button button-outline button-light close-btn\" ng-click=\"closeModal()\">{{::actionLabel}}</button>\n  </ion-header-bar>\n    \n  <ion-content class=\"has-no-header\" scroll=\"false\">\n    <div does-continue=\"true\" active-slide=\"selectedSlide\" show-pager=\"false\" class=\"listContainer\" on-slide-changed=\"slideChanged($index)\">\n      <div ng-click=\"hideButon()\" ng-repeat=\"single in slides track by $index\">\n        <ion-scroll direction=\"xy\"\n                    locking=\"true\" \n                    zooming=\"false\"\n                    min-zoom=\"1\"\n                    scrollbar-x=\"false\"\n                    scrollbar-y=\"false\"\n                    ion-slide-action=\"itemAction(item)\"\n                    delegate-handle=\"slide-{{$index}}\"\n                    overflow-scroll=\"false\"\n                    >\n    <select ng-show=\"showButon\"   class=\"galleryOptions clickImageGallery\" ng-model=\"single.type\" ng-change=\"galleryChanged(single.type)\" ng-options=\"option.name for option in optionsType track by option.value\" >></select>  <input ng-show=\"showButon\"  type=\"number\"ng-model=\"single.count\" class=\"numeric galleryOptions clickImageGallery\"/>\n   <div class=\"item item-image gallery-slide-view clickImageGallery\">\n          <img class=\"imageGallery\" ng-click=\"gal()\"  ng-src=\"{{single.src}}\">\n         </div>\n <div class=\"divButon\" ng-show=\"showButon\"> <button type=\"button\" class=\"leftRepeat clickImageGallery\" ng-click=\"rotateLeft()\"> </button> <button type=\"button\" class=\"rightRepeat clickImageGallery\" ng-click=\"rotateRigth()\"> </button> <button type=\"button\" class=\"zoomAdd clickImageGallery\" ng-click=\"zoomAdd()\"> + </button> <button type=\"button\" class=\"zoomOut clickImageGallery\" ng-click=\"zoomOut()\"> - </button> </div>       <div ng-if=\"single.sub.length > 0\" class=\"image-subtitle\" ng-show=\"!hideAll\">\n            <span ng-bind-html=\'single.sub\'></span>\n        </div>\n        </ion-scroll>\n      </div>\n    </div>\n  </ion-content>\n</ion-modal-view>
      scope.$on('$destroy', function() {
        try{
          _modal.remove();
        } catch(err) {
          console.log(err.message);
        }
      });
    }
  }
})();

angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("gallery.html","<div class=\"gallery-view\">\n  <div class=\"row\" ng-repeat=\"item in items track by $index\" ion-row-height>\n    <div ng-repeat=\"photo in item track by $index\"\n         class=\"col col-{{responsiveGrid}} image-container\">\n\n      <img ion-image-scale\n           ng-src=\"{{photo.thumb}}\"\n           ng-click=\"customCallback ? ionItemCallback({item:photo}) : showImage(photo.position)\">\n\n    </div>\n  </div>\n  <div ion-slider></div>\n</div>\n");
    $templateCache.put("slider.html", "<ion-modal-view class=\"imageView\">\n  <ion-header-bar class=\"headerView\" ng-show=\"!hideAll\">\n   <button class=\"button button-outline button-light close-btn\" ng-click=\"closeModal()\">{{::actionLabel}}</button>\n  </ion-header-bar>\n    \n  <ion-content class=\"has-no-header\" scroll=\"false\">\n    <ion-slide-box does-continue=\"true\" active-slide=\"selectedSlide\" show-pager=\"false\" class=\"listContainer\" on-slide-changed=\"slideChanged($index)\">\n      <ion-slide ng-click=\"hideButon()\"  ng-repeat=\"single in slides track by $index\">\n        <ion-scroll direction=\"xy\"\n                   locking=\"true\" \n                    zooming=\"false\"\n                    min-zoom=\"1\"\n                    scrollbar-x=\"false\"\n                    scrollbar-y=\"false\"\n                    ion-item-action=\"itemAction(true)\"\n                    delegate-handle=\"slide-{{$index}}\"\n                    overflow-scroll=\"false\"\n                    >\n    <select    class=\"galleryOptions clickImageGallery selectResize\" ng-model=\"single.type\" ng-change=\"galleryChanged(single.type)\" ng-options=\"option.name for option in optionsType track by option.value\" >></select>  <input  disabled=\"disabled\" type=\"number\"ng-model=\"single.count\" class=\"numeric galleryOptions clickImageGallery inputResize\"/>\n   <div class=\"item item-image gallery-slide-view clickImageGallery\">\n          <img class=\"imageGallery\" ng-click=\"gal($index)\"  ng-src=\"{{single.src}}\">\n         </div>\n <div class=\"divButon\" ng-show=\"showButon\"> <button type=\"button\" class=\"leftRepeat clickImageGallery\" ng-click=\"rotateLeft()\"> </button> <button type=\"button\" class=\"rightRepeat clickImageGallery\" ng-click=\"rotateRigth()\"> </button> <button type=\"button\" class=\"zoomAdd clickImageGallery\" ng-click=\"zoomAdd()\"> + </button> <button type=\"button\" class=\"zoomOut clickImageGallery\" ng-click=\"zoomOut()\"> - </button> </div>       <div ng-if=\"single.sub.length > 0\" class=\"image-subtitle\" ng-show=\"!hideAll\">\n            <span ng-bind-html=\'single.sub\'></span>\n        </div>\n        </ion-scroll>\n      </ion-slide>\n    </ion-slide-box>\n  </ion-content>\n</ion-modal-view>");}]);