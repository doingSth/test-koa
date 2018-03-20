const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')(); 
var bodyParser = require('koa-bodyparser');
var fs = require('fs');
var files = fs.readdirSync('./ajax');
files.forEach(f => {
	var ajaxObj = require('./ajax/'+f)
	router[ajaxObj.method](ajaxObj.path, ajaxObj.func)
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
app.listen(3000);