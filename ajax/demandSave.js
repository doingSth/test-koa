var dateformat = require('dateformat')
module.exports = {
	method: 'post',
	path: '/kd/demand/save',
	func: async(cxt, next) => {
    var params = cxt.request.body
    if (!params.name || !params.wxId) {
      console.log(JSON.stringify(params))
      console.log('!params.name || !params.wxId is true')
      cxt.returnJson({
        code: 500,
        msg: '!params.name || !params.wxId is true'
      })
      return
    }
    var userStore = require('../plugin/db.js')('test_user_kd');
    var users = await userStore.search({
      wxId: params.wxId
    })
    var user = users && users[0]
    if (!user || (user && user.wxId != params.wxId)) {
      console.log(user)
      console.log(JSON.stringify(params))
      console.log('!user || (user && user.wxId !== params.wxId) is true')
      cxt.returnJson({
        code: 500,
        msg: '!user || (user && user.wxId !== params.wxId) is true'
      })
      return
    }
    var demandStore = require('../plugin/db.js')('test_demand');
    var now = new Date();
    await demandStore.insert({
      name: params.name,
      platform: params.platform,
      des: params.desc || params.des || '',
      img: params.img && params.img.toString(),
      status: 1,
      addTime: dateformat(now, "yyyy-mm-dd HH:MM:ss"),
      userId: user.id
    })
    var cartridgesStore = require('../plugin/db.js')('test_cartridges');
    var cartridges = await cartridgesStore.search({
      userId: user.id
    })
    cxt.returnJson({
      code: 200,
      msg: '新增想要的卡带成功',
      data: cartridges && cartridges.length > 0 ? 1 : 2
    })
	}
}