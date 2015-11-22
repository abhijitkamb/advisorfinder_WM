var myApp = angular.module('myApp', [])

myApp.controller('AppCtrl', ['$scope', '$http',

	function($scope, $http){
		console.log("Hello world from controller");
		var current_question = 1;

		$scope.optionsData = {'value1':'', 'value2':'', 'priority':''};




		var refresh = function() {
			$http.get('/contactlist').success(function(response){
				console.log("client recevied data");
				$scope.contactlist = response;
				$scope.contact = "";
			});

		
		};

		//refresh();		

		$scope.addContact = function () {
			console.log($scope.contact);
			$http.post('/contactlist', $scope.contact).success(function (response) {
				console.log("post response");
				console.log(response);
				//refresh();
			});
		};

		$scope.displayQuestions = function () {
			console.log("displaying questions");

			$http.get('/questionlist').success(function (response) {
				$scope.questionlist = response;


				$scope.question = ""
				$scope.option = ""
			})
		};


		$scope.remove = function (id){
			console.log(id);
			$http.delete('/contactlist/' + id).success(function (response) {
				refresh();
			});
		};

		$scope.edit = function (id){
			console.log(id);
			$http.get('/contactlist/' + id).success(function (response){
				$scope.contact = response;
			});
		};

		$scope.update = function (){
			console.log($scope.contact._id);
			$http.put('/contactlist/' + $scope.contact._id, $scope.contact).success(function (response) {
				refresh();
			})
		};

		$scope.deselect = function (){
			$scope.contact = "";
		};

		$scope.filterQuestions = function (element) {
			//console.log(element);

			
			if (element.sectionid == current_question)
					return true
			return false
		}

		$scope.getnextsection = function (secid) {

			if(current_question < 3){
				current_question++;

				console.log($scope.optionsData);
				console.log(secid);

				$scope.optionsData.sectionid = secid;

				$http.post('/sendquestionnaire', $scope.optionsData).success(function (response) {
					console.log("post response");

					console.log(response);
				});

				$scope.optionsData ={'value1':'', 'value2':'', 'priority': ''};

				console.log(current_question);
			}

			

			else{
				console.log("going to else");
				
				$http.get('/matched').success(function (response) {
					console.log("received matches");
					console.log(response);

					/*matchess[0] = response.firstName;
					matchess[1] = response.secondName;
					matchess[2] = response.thirdName;*/
					$scope.matchess = response;

					console.log($scope.matchess);

					bb();






				});

				
			}
		};


		var bb = $http.get('/results').success(function (res){
						console.log("fetching results....");
						document.location = '/public/results.html';
						$scope.matchess = res;


						$scope.resultsshown = true;

					});





	}
]);


