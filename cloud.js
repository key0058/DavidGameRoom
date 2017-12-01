var AV = require('leanengine');


/*
 * Join room function: update player room id
 * 1. Check room exists or not
 * 2. Check room status is PLAY or not
 * 3. Check total palyer less than 4 or not
 *
 * @oaram roomId
 * @param playerId(userId)
 *
 */
AV.Cloud.define('joinRoom', function(request) {
	var roomId = request.params.roomId;
	var playerId = request.params.playerId;

	var roomQuery = new AV.Query('Rooms');
	roomQuery.equalTo('objectId', roomId);
	return roomQuery.first().then(function(room) {
		if (room.get('status') != 'PLAY') {
			var playerQuery = new AV.Query('Players');
			playerQuery.equalTo('roomId', roomId);
			return playerQuery.count().then(function(count) {
				if (count < 4) {
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


/*
 * Leave room function: clear room id and status
 * @param roomId
 * @param playerId(userId)
 *
 */
AV.Cloud.define('leaveRoom', function(request) {
	var roomId = request.params.roomId;
	var playerId = request.params.playerId;

	var roomQuery = new AV.Query('Rooms');
	roomQuery.equalTo('objectId', roomId);
	return roomQuery.first().then(function(room) {
		var playerQuery = new AV.Query('Players');
		playerQuery.equalTo('userId', playerId);
		return playerQuery.first().then(function(player) {
			player.set('roomId', "");
			player.set('status', "");	
			player.set('cards', "");
			player.save();

			console.log('Player ' + playerId + ' leave room and clean info');
			return "SUCCESS";
		});
	});
});


/*
 * Playing cards function: update player cards
 * @param roomId
 * @param playerId(userId)
 */
AV.Cloud.define('playingCards', function(request) {
	var roomId = request.params.roomId;
	var playerId = request.params.playerId;

	var roomQuery = new AV.Query('Rooms');
	roomQuery.equalTo('objectId', roomId);
	return roomQuery.first().then(function(room) {
		if (room.get('status') == 'READY') {
			
			room.set('status', 'PLAY');
			room.save();

			var playerQuery = new AV.Query('Players');
			playerQuery.equalTo('roomId', roomId);
			playerQuery.equalTo('userId', playerId);
			return playerQuery.first().then(function(player) {
				if (player.get('status') == "BANK") {

					var query = new AV.Query('Players');
					query.equalTo('roomId', roomId);

					return query.find().then(function(results) {
						var cards = generateCard(results.length * 5);
						for (var idx = results.length - 1; idx >= 0; idx--) {
							var theCards = new Array();
							var thePlayer = results[idx];
							var i = 0;
							while (i<5) {
								theCards.push(cards.pop());
								i++;
							}
							thePlayer.set('cards', theCards);
							thePlayer.save();
						}
						return "SUCCESS";
					});
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
			
			var roomQuery = new AV.Query('Rooms');
			roomQuery.equalTo('objectId', roomId);

			roomQuery.find().then(function(thisRoom) {
				if (thisRoom.get('status') == 'PLAY') {
					var playerQuery = new AV.Query('Players');
					playerQuery.equalTo('roomId', roomId);
					playerQuery.equalTo('status', 'END');
					playerQuery.count().then(function(count) {
						if ((count + 1) == room.get('playerCount')) {
							roomStatus = 'END'
							var roomQuery = new AV.Query('Rooms');
							roomQuery.get(roomId).then(function(room) {
								room.set('status', roomStatus);
								room.set('readyCount', '1');
								room.save();
								console.log("Update room " + roomId + " status to " + roomStatus + "!")
							}, function(error) {
								console.error(error);
							});
						}
					});
				} else {
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
			});
		}
	}
});


/*
 * Generate card num, no repeat
 * @param count: total card num
 */
function generateCard(count) {
	var cards = new Array();
	while (cards.length < count) {
		var cardType = Math.floor(Math.random() * 4) + 1;
		var cardNum = Math.floor(Math.random() * 13) + 1;
		var card = cardType * 100 + cardNum;
		var hasCard = (cards.indexOf(card) >= 0);
		if (!hasCard) {
			cards.push(card);
		}
	}
	console.log("Generate card list: " + cards);
	return cards;
}
