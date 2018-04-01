let Sql = require("./util/db");
let sql;
let st = require("./util/status");
let log = require("./util/log");
let Vaild = require("./util/vaild");

module.exports = ((config) => {
	let table = config.table;
	delete config.table;

	if(!sql){
		sql = new Sql(config);
	}
	return {
		save:async function (param){
			let _vaild = Vaild(param);
			if(!st.check(_vaild))
				return st(false,`${_vaild.msg}`);

			let existData = await sql.query(table,"*",{name:param.name});
			if(existData.length > 1){
				log.error(`${param.name}储存异常,不唯一`);
				return st(false,`${param.name}储存异常,不唯一`)
			}else if(existData.length == 1){
			//已有
				let _zip =  existData.pop();
				if(param.path != _zip.path) {
					log.warn(`${param.name}已被其他人使用`);
					return st(false,`${param.name}已被其他人使用`)
				}
			}else{
				await sql.insert(table,param);
			}
			return st(true);
		},
		insert:async function (param){
			let _vaild = Vaild(param);
			if(!st.check(_vaild))
				return st(false,`${_vaild.msg}`);
			var result = await sql.insert(table,param);
			return result&&result.insertId
		},
		get:async function (param){
			let _vaild = Vaild(param);
			if(!st.check(_vaild))
				return _vaild;
			return await sql.query(table,"*",{name:param.name},0,param.size || 10);
		},
		search:async function (whereEqual,whereIn,offset,size,whereContain, order, desc, hasCount,whereRange){
			return await sql.query(table,"*",whereEqual,offset,size,whereIn,whereContain,order,desc,hasCount,whereRange);
		},
		count:async function(whereEqual,whereIn,whereContain){
			return await sql.count(table,whereEqual,whereIn,whereContain);
		},
		found: async function(hasCount){
			return await sql.found(hasCount)
		},
		update:async function (obj,where){
			return await sql.update(table,obj,where);
		},
		delete:async function (whereEqual,whereIn){
			return await sql.delete(table,whereEqual,whereIn);
		}
	}
});