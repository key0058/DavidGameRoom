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
	return roomQuery.first().then(function(room) {
		if (room.get('status') == 'IDLE') {
			var playerQuery = new AV.Query('Players');
			playerQuery.equalTo('roomId', roomId);
			return playerQuery.count().then(function(count) {
				if (count < 3) {
					var query = new AV.Query('Players');
					query.equalTo('userId', playerId);
					return query.first().then(function(player) {
						player.set('roomId', roomId);
						if (player.get('status') != "BANK") {
							player.set('status', "IDLE");	
						}
						player.save();
						return "SUCCESS";
					});
				} else {
					throw new AV.Cloud.Error("Room already full!");
				}
			});
		}
	});
});



/**
 * David game room leancloud hooks
 */
AV.Cloud.afterUpdate('Players', function(request) {
	/*
	 * Players uodaste status 
	 * Change room ready player num
	 * If all players ready, change room status
	 */
	if (request.object.updatedKeys.indexOf('status') != -1) {
		if (request.object.get('roomId') != "undefined") {

			var roomStatus, totalPlayers, totalReadys;
			var roomId = request.object.get('roomId');
			
			var playerQuery = new AV.Query('Players');
			playerQuery.equalTo('roomId', roomId);
			playerQuery.count().then(function(count) {
				totalPlayers = count;
				playerQuery.equalTo('status', 'READY');

				var bankerQuery = new AV.Query('Players');
				bankerQuery.equalTo('roomId', roomId);
				bankerQuery.equalTo('status', "BANK");

				var query = AV.Query.or(playerQuery, bankerQuery);
				query.count().then(function(readyCount) {
					totalReadys = readyCount;

					if (totalPlayers == totalReadys) {
						roomStatus = 'READY';
					} else {
						roomStatus = 'IDLE';
					}
					var roomQuery = new AV.Query('Rooms');
					roomQuery.get(roomId).then(function(room) {
						room.set('status', roomStatus);
						room.set('playerCount', totalPlayers);
						room.set('readyCount', totalReadys);
						room.save();
						console.log("Update room " + roomId + " status to " + roomStatus + "!")
					}, function(error) {
						console.error(error);
					});

					console.log("Total players " + totalPlayers + ", total ready:" + totalReadys + " in room " + roomId);
				});
			});
		}
	}
});
