var AV = require('leanengine');

/**
 * David game room leancloud functions
 */
AV.Cloud.define('updateRoomStatus', function(request) {
	var sql = 'UPDATE Rooms set status = "' + request.params.status  + '" where objectId = "' + request.params.objectId  + '"'
	AV.Query.doCloudQuery(sql).then(function(data) {
		console.log('SQL: ' + sql);
		console.log(data.results);
	}, function(error) {
		console.error(error);
	});
});

AV.Cloud.define('updatePlayerRoomId', function(request) {
	var sql = 'UPDATE Players set roomId = "' + request.params.roomId  + '" where objectId = "' + request.params.playerId  + '"'
	AV.Query.doCloudQuery(sql).then(function(data) {
		console.log('SQL: ' + sql);
		console.log(data.results);
	}, function(error) {
		console.error(error);
	});
});



/**
 * David game room leancloud hooks
 */
AV.Cloud.beforeUpdate('Players', function(request) {
	if (request.object.updatedKeys.indexOf('roomId') != -1) {
		var roomId = request.object.get('roomId');

		var roomQuery = new AV.Query('Rooms');
		roomQuery.equalTo('objectId', roomId);
		roomQuery.find().then(function(results) {
			console.log('+++++ find room id +++++');
			if (results.length > 0) {
				console.log('+++++ checked room id +++++');
				var query = new AV.Query('Players');
				query.equalTo('roomId', roomId);
				query.count().then(function(count) {
					console.log("Room " + roomId + " total had " + count + " players");
				});
			} else {
				console.log('+++++ no room id +++++');
				throw new AV.Cloud.Error("Room " + roomId + " is not exists!");
			}
		}, function(error) {
			throw new AV.Cloud.Error('Before update players had error: ' + error);
		});
	}
});

AV.Cloud.afterUpdate('Players', function(request) {
	if (request.object.updatedKeys.indexOf('roomId') != -1) {
		var roomId = request.object.get('roomId');
		console.log("After update player room id " + roomId);
	}
});

AV.Cloud.afterUpdate('Rooms', function(request) {
	console.log('Updated room,the id is :' + request.object.id);
});