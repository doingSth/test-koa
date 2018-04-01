const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var fs = require('fs');
var files = fs.readdirSync('./ajax');
files.forEach(f => {
	var ajaxObj = require('./ajax/'+f)
	router[ajaxObj.method](ajaxObj.path, async (cxt, next) => {
	  try {
      await ajaxObj.func(cxt, next)
    } catch(e) {
      console.log(e.stack)
      cxt.returnJson({
        code: 500,
        msg: '系统异常，请稍后再试'
      })
    }
  })
})
app.use(async (ctx,next) => {
  ctx.returnJson = (data) => {
  	ctx.response.type = 'application/json';
		ctx.response.body = data
  }
  await next()
});
app.use(bodyParser());
app.use(router.routes())
app.on('error',  async (err, ctx) => {
  console.log(err)
})
console.log('app listen: 3000')
app.listen(3000);