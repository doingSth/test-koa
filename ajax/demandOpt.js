var optMap = {
  'delete': '0'
}
module.exports = {
	method: 'post',
	path: '/kd/demand/opt',
	func: async(cxt, next) => {
    var params = cxt.request.body
    if (!params.id || !params.type || !params.wxId || !optMap[params.type]) {
      console.log(JSON.stringify(params))
      console.log('!params.id || !params.type || !params.wxId || !optMap[params.type] is true')
      cxt.returnJson({
        code: 500,
        msg: '!params.id || !params.type || !params.wxId || !optMap[params.type] is true'
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
    var res = await demandStore.update({
      status: optMap[params.type]
    },{
      id: params.id,
      userId: user.id
    })
    if(res && res.affectedRows > 0){
      cxt.returnJson({
        code: 200,
        msg: '操作成功'
      })
    } else {
      cxt.returnJson({
        code: 500,
        msg: '操作失败，无权限'
      })
    }
	}
}