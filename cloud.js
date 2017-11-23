var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request) {
  return 'Hello world!';
});


AV.Cloud.afterUpdate('Rooms', function(reuqest) {
	console.log('Updated room,the id is :' + request.object.id);
});