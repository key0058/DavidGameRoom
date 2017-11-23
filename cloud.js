var AV = require('leanengine');

/**
 * 一个简单的云代码方法
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


AV.Cloud.afterUpdate('Rooms', function(request) {
	console.log('Updated room,the id is :' + request.object.id);
});