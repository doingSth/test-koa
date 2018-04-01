module.exports = {
	method: 'get',
	path: '/kd/cartridges/query',
	func: async(cxt, next) => {
		var params = cxt.request.query
		if (!params.wxId) {
			console.log(JSON.stringify(params))
			console.log('!params.wxId is true')
			cxt.returnJson({
				code: 500,
				msg: '!params.wxId is true'
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
		var res = await cartridgesStore.search({
			userId: user.id,
			status: 1
		})
		cxt.returnJson({
			code: 200,
			msg: '操作成功',
			data: {
        wxName: user.wxName,
        list: res || []
			}
		})
	}
}