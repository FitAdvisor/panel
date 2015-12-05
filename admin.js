var myApp = angular.module('myApp', ['ng-admin']);
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('My First Admin')
      .baseApiUrl('http://localhost:8080/test/'); // main API endpoint
    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id
    var client = nga.entity('clients').identifier(nga.field('_id.$oid'));
    var exercise = nga.entity('exercises').identifier(nga.field('_id.$oid'));
    // set the fields of the user entity list view
    client.listView().fields([
        nga.field('_id.$oid').label('ID').isDetailLink(true),
        nga.field('info.name').label('Name'),
        nga.field('info.surname').label('Surname')
    ]);

    client.creationView().fields([
        nga.field('info.name').label('Name'),
        nga.field('info.surname').label('Surname'),
        nga.field('physcial.height').label('Height'),
        nga.field('physcial.weight').label('Weight'),
        nga.field('info.email', 'email').label('e-mail'),
        nga.field('info.phone').label('Phone')
    ]);

	client.editionView().fields([
	    nga.field('info.name').label('Name'),
	    nga.field('info.surname').label('Surname'),
	    nga.field('physcial.height').label('Height'),
	    nga.field('physcial.weight').label('Weight'),
	    nga.field('info.email', 'email').label('e-mail'),
	    nga.field('info.phone').label('Phone')
	]);

	//client.editionView().fields(client.creationView().fields());

    // add the user entity to the admin application
    admin.addEntity(client)


    var exerciseTypes = [
        { label: 'Main', value: '1'},
        { label: 'Secondary', value: '2'},
        { label: 'Additional', value: '3'}
    ];    

    var partTypes = [
        { label: 'Chest', value: '1'},
        { label: 'Legs', value: '2'},
        { label: 'Arms', value: '3'}
    ];

    exercise.listView().fields([
        nga.field('_id.$oid').label('ID').isDetailLink(true),
        nga.field('info.title').label('Exercise title'),
        nga.field('info.desccription').label('Description')
    ]);

    exercise.creationView().fields([
        nga.field('info.title').label('Exercise title'),
        nga.field('info.videoLink').label('Optional video link'),
        nga.field('info.articleLink').label('Optional article link'),
        nga.field('info.desccription').label('Description'),
        nga.field('info.type','choice').label('Exercise type').choices(exerciseTypes),
        nga.field('requirements.minAge').label('Min. age').validation({ 'required': false, 'minlength': 1, 'maxlength': 100 }),
        nga.field('requirements.maxAge').label('Max. age'),
        nga.field('requirements.minUserExp', 'number').label('Min. user experience [1-15]'),
        nga.field('Badges', 'choices').choices([
              { label: 'Tech', value: 'tech' },
              { label: 'Lifestyle', value: 'lifestyle' }
          ]),
        nga.field('currency', 'choice').choices([
              { value: 'USD', label: 'dollar ($)' },
              { value: 'EUR', label: 'euro (€)' },
          ]),
        nga.field('bodyPartsInvolved', 'embedded_list').targetFields([ 
              nga.field('partType', 'choices').label('part type').choices(partTypes),
              nga.field('partTrainingScore').label('part training score')
          ]).label('Body parts involved')
    ]);



    admin.addEntity(exercise)
/*
	var post = nga.entity('posts');
	post.listView().fields([
	    nga.field('id'),
	    nga.field('title'),
	    nga.field('userId', 'reference')
	        .targetEntity(user)
	        .targetField(nga.field('username'))
	        .label('User')
	]);

	post.showView().fields([
	    nga.field('title'),
	    nga.field('body', 'text'),
	    nga.field('userId', 'reference')
	        .targetEntity(user)
	        .targetField(nga.field('username'))
	        .label('User'),
	    nga.field('comments', 'referenced_list')
	        .targetEntity(nga.entity('comments'))
	        .targetReferenceField('postId')
	        .targetFields([
	            nga.field('email'),
	            nga.field('name')
	        ])
	        .sortField('id')
	        .sortDir('DESC'),
	]);

	admin.addEntity(post)
*/
    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);

myApp.config(['RestangularProvider', function (RestangularProvider) {
    /*
    RestangularProvider.setResponseInterceptor(function(data, operation, what) {
      if (operation == 'getList') {
        resp =  data['_embedded']['rh:doc'];   
        resp._links = data['_links'];
        console.log(resp);         
        return resp
      }
      return data;
    });

    // Using self link for self reference resources
    RestangularProvider.setRestangularFields({
      selfLink: 'self.link'
    });
*/
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        var extractedData;
        console.log('addResponseInterceptor');
        //console.log(operation);
        //console.log(what);
        if (operation === "getList") {
            console.log(data);
            extractedData = data._embedded['rh:doc'];
            console.log(extractedData);
        } else if (operation === "get"){
            extractedData = data;
        }
        return extractedData;
    });    

    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        console.log('addFullRequestInterceptor');
        console.log(operation);
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        } else if (operation === "remove"){
            console.log('Tutaj pomoc w remove');
            headers = {"If-Match": "5654ae1f9ee663506e82a991"};
            console.log(headers);
            //ApiRestangular.one("clients", $scope.selected._id.$oid).remove(null, {"If-Match": $scope.selected._etag.$oid}).then(function () {
            //ApiRestangular.one("clients", "5654ac499ee663506e82a98f").remove(null, {"If-Match": "5654ae1f9ee663506e82a991"}).then(function () {
                //$scope.loadNotes();
                //$scope.selected = null;
            //});
        }
        return { params: '' };
    });
}]);