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

	console.log("[joinRoom] " + playerId + " join " + roomId)

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
						room.increment('msgCount', 1).save();
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
 * Leave room function: reset player and clean room's info if the player is a banker
 * @param roomId
 * @param playerId(userId)
 *
 */
AV.Cloud.define('leaveRoom', function(request) {
	var roomId = request.params.roomId;
	var playerId = request.params.playerId;

	new AV.Query('Players')
	.equalTo('userId', playerId)
	.first()
	.then(function(player) {
		if(player.get('status') === 'BANK'){
			resetPlayer(player);
			new AV.Query('Rooms')
			.get(roomId)
			.then(function (_room) {
			    room = _room;
			    room.set('status','IDLE').save();
			    return "SUCCESS";
			  }, function (error) {
			  });
		} else {
			resetPlayer(player);
			console.log('Player ' + playerId + ' leave room and clean info');
			return "SUCCESS";
		}
	});
});

// Reset player‘s game info
function resetPlayer(player){
	console.log('resetPlayer ' + player.id);
	player.set('status','IDLE')
	player.set('roomId', "");
	player.set('cards', []);
	player.save();
}


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

	if (request.object.updatedKeys.indexOf('status') != -1) {

		var playerStatus = request.object.get('status');
		var playerRoomId = request.object.get('roomId');

		console.log("[afterUpdate] player update status to " + playerStatus);

		if (playerRoomId != "" && playerRoomId != undefined) {

			var roomStatus, totalPlayers, totalReadys,totalEnds;

			// Find all players in the room excluding banker
			new AV.Query('Players')
			.equalTo('roomId', playerRoomId)
			.notEqualTo('status', 'BANK')
			.find()
			.then(function(players) {
				console.log("[afterUpdate] find " + players.length + " players");
				new AV.Query('Rooms')
					.get(playerRoomId)
					.then(function(room) {
						updateRoomStatus(players, room);
					}, function(error) {
						console.error(error);
					});
			});
		}
	}
});

function updateRoomStatus(players,room){
	var nReadyPlayers = 0;
	var nEndPlayers = 0;
	var nPlayers = players.length;
	// Count players
	for(var player of players){
		var status = player.get('status')
		if(status === 'READY'){
			totalReadys++;
		} else if(status === 'END'){
			totalEnds++;
		}
	}

	var roomStatusBefore = room.get('status');
	var roomNewStatus = '';

	switch(roomStatusBefore){
		case 'IDLE': {
			if(nReadyPlayers == nPlayers){ // if all players are "Ready" status
				roomNewStatus = 'READY'
				room.set('status', roomStatus);
				room.set('playerCount', nPlayers);
				room.set('readyCount', nReadyPlayers);
				room.save();
				console.log("Update room " + playerRoomId + " status to " + roomNewStatus + "!")
			}
			break;
		}
		
		case 'READY': {
			if(nReadyPlayers != nPlayers){ // if all players are "Ready" status
				roomNewStatus = 'IDLE'
				room.set('status', roomStatus);
				room.set('playerCount', nPlayers);
				room.set('readyCount', nReadyPlayers);
				room.save();
				console.log("Update room " + playerRoomId + " status to " + roomNewStatus + "!")
			}
			break;
		}
		case 'PLAY':{
			if(nEndPlayers != nPlayers){ // if all players are "Ready" status
				roomNewStatus = 'END'
				room.set('status', roomStatus);
				room.set('playerCount', nPlayers);
				room.set('readyCount', nReadyPlayers);
				room.save();
				console.log("Update room " + playerRoomId + " status to " + roomNewStatus + "!")
			}
			break;
		}
		case 'END':{
			break;	
		}
		
	}		
}


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
