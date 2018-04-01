var dateformat = require('dateformat')
module.exports = {
	method: 'post',
	path: '/kd/cartridge/save',
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
    var cartridgesStore = require('../plugin/db.js')('test_cartridges');
    var now = new Date();
    await cartridgesStore.insert({
      name: params.name,
      platform: params.platform,
      status: 1,
      addTime: dateformat(now, "yyyy-mm-dd HH:MM:ss"),
      userId: user.id
    })
    cxt.returnJson({
      code: 200,
      msg: '新增卡带成功'
    })
	}
}