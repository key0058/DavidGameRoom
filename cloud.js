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
	var roomId = request.params.roomId;
	var playerId = request.params.playerId;

	var roomQuery = new AV.Query('Rooms');
	roomQuery.equalTo('objectId', roomId);
	return roomQuery.find().then(function(results) {
		if (results.length > 0) {
			var room = results[0];
			if (room.get('status') == 'WAIT') {
				var playerQuery = new AV.Query('Players');
				playerQuery.equalTo('roomId', roomId);
				return playerQuery.count().then(function(count) {
					if (count < 3) {
						var sql = 'UPDATE Players set roomId = "' + request.params.roomId  + '" where objectId = "' + request.params.playerId  + '"'
						return AV.Query.doCloudQuery(sql).then(function(data) {
							console.log('SQL: ' + sql);
							return "SUCCESS";
						}, function(error) {
							throw new AV.Cloud.Error("Update player happen error: " + error);
						});
					} else {
						throw new AV.Cloud.Error("Room already full!");
					}
				});
			}
		} else {
			throw new AV.Cloud.Error("Room " + roomId + " is not exists!")
		}
	}, function(error) {
		throw new AV.Cloud.Error("Find room happen error: " + error);
	});
	
});



/**
 * David game room leancloud hooks
 */
AV.Cloud.afterUpdate('Players', function(request) {
	/*
	 * If players status all ready and change room status to READY by id
	 */
	if (request.object.updatedKeys.indexOf('status') != -1) {
		var roomStatus;
		var totalPlayers, totalReadys;
		var roomId = request.object.get('roomId');
		var query = new AV.Query('Players');
		query.equalTo('roomId', roomId);
		query.count().then(function(count) {
			totalPlayers = count;

			query.equalTo('status', 'READY');
			query.count().then(function(readyCount) {
				totalReadys = readyCount;

				console.log("Total players " + totalPlayers + ", total ready:" + totalReadys + " in room " + roomId);
				if (totalPlayers == totalReadys) {
					roomStatus = 'READY';
				} else {
					roomStatus = 'WAIT';
				}
				var roomQuery = new AV.Query('Rooms');
				roomQuery.get(roomId).then(function(room) {
					room.set('status', roomStatus);
					room.save();
					console.log("Update room " + roomId + " status to " + roomStatus + "!")
				}, function(error) {
					console.error(error);
				});
			});
		});
	}
});


AV.Cloud.afterUpdate('Rooms', function(request) {
	console.log('Updated room,the id is :' + request.object.id);
});