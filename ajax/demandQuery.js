module.exports = {
	method: 'get',
	path: '/kd/demand/query',
	func: async(cxt, next) => {
		cxt.returnJson({a:2})
	}
}