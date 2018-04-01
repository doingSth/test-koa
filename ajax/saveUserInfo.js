var dateformat = require('dateformat')
module.exports = {
  method: 'post',
  path: '/kd/user/save',
  func: async(cxt, next) => {
    var params = cxt.request.body
	  if (!params.wxId) {
  		console.log(JSON.stringify(params))
    	console.log('!params.wxId is true')
  		cxt.returnJson({
				code: 500,
				msg: '系统异常，请稍候再试'
			})
			return
		}
		var userStore = require('../plugin/db.js')('test_user_kd');
    var users = await userStore.search({
      wxId: params.wxId
		})
    var user = users && users[0]
    if (user && user.wxId != params.wxId) {
      console.log('user && user.wxId !== params.wxId is true')
      cxt.returnJson({
        code: 500,
        msg: '系统异常，请稍候再试'
      })
      return
		}
		if (user) {
      await userStore.update(params, {
        wxId: user.wxId
			})
		} else {
      var now = new Date();
      await userStore.insert(Object.assign(params, {
      	addTime: dateformat(now, "yyyy-mm-dd HH:MM:ss")
			}))
		}
		cxt.returnJson({
			code: 200,
			msg: '用户信息更新成功'
		})
  }
}