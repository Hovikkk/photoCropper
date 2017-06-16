(function () {
    "use strict";

    angular.module("myapp.services", []).factory("myappService", ["$rootScope", "$http", "$ionicPlatform", function ($rootScope, $http, $ionicPlatform) {
        var myappService = {};

        //starts and stops the application waiting indicator
        myappService.wait = function (show) {
            if (show)
                $(".spinner").show();
            else
                $(".spinner").hide();
        };

        return myappService;
    }]).service('dataStorage', function () {
        var picture = "";
        var arrayPictur;
        var number;
        var defRightNameNumber;
        var defLeftNameNumber;
        var x;
        var closeModalBoolian = false;
    });
})();