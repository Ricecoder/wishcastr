;(function(){
  angular.module('Wishcastr', ['ngRoute'], function($routeProvider){
    $routeProvider
    .when ('/', {
      redirectTo: 'top-wishes'
    })//END OF REDIRECT
    .when ('/top-wishes', {
      templateUrl: 'partials/top-wishes.html',
      controller: function ($http, $scope) {
        $http.get('//wishcastr-staging.herokuapp.com/products/top.json')
        .then(function(response){
          $scope.products = response.data;
        })//END OF PROMISE
      }//end of controller
    })//END OF TOP-WISHES
    .when ('/user-wishes', {
      templateUrl: 'partials/user-wishes.html',
      controller: function ($http, $scope) {
        var user = currentUser();
        var config = {
          headers: {
            x_wishcastr_user_id: user.amz_id,
            x_wishcastr_access_token: user.amz_access_token,
          }
        };
        $http.get('/wishes.json', config)
        .then(function(response){
          $scope.wishes = response.data;
        })//END OF PROMISE
      }//end of controller
    })//END OF USER-WISHES

    .when ('/results', {
      templateUrl: 'partials/results.html',
      controller: function(Search){
        var products = this;

        products.results = function(){
          return Search.results;
        };
      },
      controllerAs: 'products'
    })//END OF RESULTS


  })//END OF MODULE
  .controller('SearchController', function($http, Search, API){
    var search = this;

    search.query = '';

    //  Capture a submit event for our search form...NG-Submit
    search.find = function(){

      // TODO: Capture the query...
      //  Make a GET request to the Rails API...
      // $http({
      //   method: 'GET', url: API.BASE_URL + API.SEARCH_PATH,
      //   params: { puppy: 'bad' }
      // })
      // GET .../search.json?query=pineapple
      $http.get(API.BASE_URL + API.SEARCH_PATH, {
        params: {query: search.query}  // Put the query here?
      })
        .then(function(response){
          //  Attach the results to the `Search` service...
          Search.results = response.data;
        })
    } // END find
  }) //END CONTROLLER
  .constant('API', {
    BASE_URL: 'http://wishcastr-staging.herokuapp.com',
    SEARCH_PATH: '/products/search.json'
  })
  .value('Search', {
    query: '',
    results: [
      // { title: 'Bad Robot', current_price: '123.45' }
    ],
  })

  .controller('Find', ['$http', '$scope', function($http, $scope){
    var BASEURL = '//wishcastr-staging.herokuapp.com/products/';

    $scope.query = "";
    $scope.products = { };
    $scope.search = function(){
      $http.get(BASEURL+'search.json?query='+$scope.query)
      .then(function(response){
        $scope.products = response.data;
      })//END PROMISE
    }//END searchParam()
  }])


})(); //END OF IFFE

// Amazon Login SDK
;(function(){
  window.onAmazonLoginReady = function() {
    amazon.Login.setClientId('amzn1.application-oa2-client.91ae74641b2d4550959bd7109c2f2cba');
  };
  (function(d) {
    var a = d.createElement('script');
    a.type = 'text/javascript';
    a.async = true;
    a.id = 'amazon-login-sdk';
    a.src = 'https://api-cdn.amazon.com/sdk/login1.js';
    d.getElementById('amazon-root').appendChild(a);
  })(document);

  $('#amazon-login').on('click', function(){
    setTimeout(window.doAmazonLogin, 1);
  });

  $('#amazon-logout').on('click', function(){
    setTimeout(window.doLogout, 1);
  });

  window.currentUser = function(){
    return JSON.parse(docCookies.getItem('user'));
  }

  window.doLogout = function(){
    amazon.Login.logout();
    docCookies.removeItem('user');
  };

  //TODO
  //window.doLogin

  window.doAmazonLogin = function(){
    options = {
      scope: 'profile'
    };
    amazon.Login.authorize(options, function(response) {
      if (response.error) {
        console.log('oauth error ' + response.error);
        return;
      }

      var userAccessToken = response.access_token;

      amazon.Login.retrieveProfile(userAccessToken, function(response) {
        var u = {};
        u.amz_access_token = userAccessToken;
        u.name = response.profile.Name;
        u.email = response.profile.PrimaryEmail;
        u.amz_id = response.profile.CustomerId.substr(response.profile.CustomerId.lastIndexOf('.') + 1);
        docCookies.setItem('user', JSON.stringify(u), 60*60*24*7);
        setTimeout(window.doRailsLogin(u), 1);
      });

    });
  };

  window.doRailsLogin = function(u){
    var BASEURL = "login/amazon.json";
      $.ajax({
        type: "POST",
        url: BASEURL,
        data: {user: u},
        success: null, //TODO: callback function
        dataType: 'json'
      });
  };



})();
