/*
 {
  latitude：'',
  longitude：'',
  wxId：'', //非必填
  keyword:'',//关键词
  updateTime: '',//第一页不传，第二页传递第一页返回的updateTime
  limit: 10
}
 */
const DISTANCE = 1000; //附近范围
const EARTH_RADIUS = 6378137.0;//地球赤道半径(单位：m。6378137m是1980年的标准，比1975年的标准6378140少3m）

function degrees(d) {
  return d * (180 / Math.PI);
}

function getDegreeCoordinates(latitude, longitude, distance){
  var dlng = 2 * Math.asin(Math.sin(distance / (2 * EARTH_RADIUS)) / Math.cos(latitude));
  dlng = degrees(dlng);//一定转换成角度数
  var dlat = distance / EARTH_RADIUS;
  dlat = degrees(dlat);//一定转换成角度数
  return {
    latitude: [Math.round(latitude - dlng,6), Math.round(latitude - dlng,6)],
    longitude: [Math.round(longitude- dlat,6), Math.round(longitude + dlat,6)]
	}
}
var dateformat = require('dateformat')
module.exports = {
  method: 'get',
  path: '/kd/demand/query',
  func: async(cxt, next) => {
		var params = cxt.request.query
	  var whereEqual = {
			status: 1
		}
	  if(params.wxId) {
			var userStore = require('../plugin/db.js')('test_user_kd');
			var users = await userStore.search({
				wxId: params.wxId
			})
			var user = users && users[0]
  		if (user && user.wxId == params.wxId) {
        whereEqual.userId = user.id
			}
		}
		var whereIn = {}
		if(params.latitude && params.longitude && !whereEqual.userId){
      var userWhereRange = getDegreeCoordinates(params.latitude,  params.longitude, DISTANCE)
      var userStore = require('../plugin/db.js')('test_user_kd');
      var users = await userStore.search(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,userWhereRange)
			if(users && users.length > 0) {
        var userIds = users && users.map(user => {
          return user.id
        })
        whereIn.userId = userIds
        console.log(userIds.toString())
			}
		}
		var whereRange = {}
		if(params.updateTime){
      whereRange.updateTime = [params.updateTime,'2111-09-03 09:03:03']
		}
		var whereContain = {}
		if(params.keyword) {
      whereContain.name = params.keyword
		}
		var demandStore = require('../plugin/db.js')('test_demand');
		var demands = await demandStore.search(whereEqual,whereIn,undefined,params.limit,whereContain,undefined,undefined,undefined,whereRange)
		demands = demands || []
		demands = demands.map(item => {
      item.addTime = dateformat(item.addTime, "yyyy-mm-dd HH:MM:ss")
      item.updateTime = dateformat(item.updateTime, "yyyy-mm-dd HH:MM:ss")
			return item
		})
		cxt.returnJson({
			code: 200,
			msg: '操作成功',
			data: {
        count: demands && demands.length,
				list: demands || [],
				updateTime: demands && demands[demands.length-1] &&demands[demands.length-1].updateTime
			}
		})
	}
}