module.exports = {
	method: 'post',
	path: '/api',
	func: async(cxt, next) => {
		cxt.returnJson({a:cxt.request.body})
	}
}