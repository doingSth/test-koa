'use strict';
let log = require("./log");
let mysql = require('mysql');

// 验证是否为对象
function _isObject(obj){
    return Object.prototype.toString.call(obj).indexOf("object Object") !== -1 ? true : false;
}
function _object_values(obj){
	let result = [];
	for(let key in obj)
		result.push(obj[key])
	return result
}
/*
	sql 参数序列化处理算法
 */
let Serialize = {
	where(param,whereIn,whereContain,whereRange){
		let paraArrs = [];
		let result = "";
		if((param&&_isObject(param)) || (whereIn&&_isObject(whereIn)) || (whereContain&&_isObject(whereContain)) || (whereRange&&_isObject(whereRange))){
			result = " WHERE ";
			if(param&&_isObject(param)){
				for(let key in param){
					paraArrs.push(` \`${key}\`='${param[key]}' `);
				}
			}
			if(whereIn&&_isObject(whereIn)){
				for(let key in whereIn){
					if(whereIn[key]&& typeof whereIn[key][0] =='string'){
						paraArrs.push(` \`${key}\` in (${"'"}${whereIn[key].join("','")}${"'"}) `);
					}else {
						paraArrs.push(` \`${key}\` in (${whereIn[key].toString()}) `);
					}
				}
			}
			if(whereContain&&_isObject(whereContain)){
				for(let key in whereContain){
					paraArrs.push(` \`${key}\` like '%${whereContain[key]}%' `);
				}
			}
      if(whereRange&&_isObject(whereRange)){
        for(let key in whereRange){
        	if(typeof whereRange[key][0] == 'string'){
            paraArrs.push(` \`${key}\` >= '${whereRange[key][0]}' AND \`${key}\` <= '${whereRange[key][1]}' `);
					}else {
            paraArrs.push(` \`${key}\` >= ${whereRange[key][0]} AND \`${key}\` <= ${whereRange[key][1]} `);
					}

        }
      }
			result+=paraArrs.join("AND");
		}
		return result;
	},
	table(table){
		return table || "";
	},
	key(param){
		return _isObject(param) ? Object.keys(param).join(",") : Array.isArray(param)
			? param.join(",") : param;
	},
	value(param){
		return _isObject(param) ? "'"+`${_object_values(param).join("','")}`+"'" : ""
	},
	limit(offset,size){
		return (size ? `LIMIT ${parseInt(size)}` : "") + (offset ? ` OFFSET ${parseInt(offset)}` : "") ;
	},
	order(order, desc){
		return order ? ((desc ? `order by \`${order}\` desc`: `order by \`${order}\` asc`)) : 'order by `id` desc'
	},
	count(hasCount){
		return (hasCount?" SQL_CALC_FOUND_ROWS ":"")
	},
	set(obj,where){
		let paraArrs = [];
		let result = "";
		var whereKeys = Object.keys(where);
		if((obj&&_isObject(obj))){
			result = " SET ";
			for(let key in obj){
				if(whereKeys.indexOf(key) < 0){
					paraArrs.push(` \`${key}\`='${obj[key]}' `);
				}
			}
			result+=paraArrs.join(",");
		}
		return result;
	}
}

class Sql{
	constructor(config){
		this.db  = mysql.createPool(Object.assign({"connectionLimit":20},config));
	}
	query(table,keys,where,offset,size,whereIn,whereContain,order,desc,hasCount,whereRange){
		let db = this.db;
		console.log(`SELECT 
				${Serialize.count(hasCount)} 
				${Serialize.key(keys)} 
				FROM 
				${Serialize.key(table)} 
				${Serialize.where(where,whereIn,whereContain,whereRange)}
				${Serialize.order(order,desc)}
				${Serialize.limit(offset,size)} 
				`)
		return new Promise((resolve)=>{
				db.query(`SELECT 
				${Serialize.count(hasCount)} 
				${Serialize.key(keys)} 
				FROM 
				${Serialize.key(table)} 
				${Serialize.where(where,whereIn,whereContain,whereRange)}
				${Serialize.order(order,desc)}
				${Serialize.limit(offset,size)} 
				`,(err,rows,fields)=>{
				if(err)
					log.error(err);
				resolve(rows);
			});
		});
	}
	count(table,whereEqual,whereIn,whereContain){
		let db = this.db;
		return new Promise((resolve)=>{
			db.query(`SELECT
				count(1)
				FROM
				${Serialize.key(table)}
				${Serialize.where(whereEqual,whereIn,whereContain)}
				`,(err,rows,fields)=>{
				if(err)
					log.error(err);
				resolve((rows&&rows[0]&&rows[0]['count(1)']) || 0);
			});
		});
	}
	found(){
		let db = this.db;
		return new Promise((resolve)=>{
			db.query(`SELECT FOUND_ROWS()`,(err,rows,fields)=>{
				if(err) log.error(err);
				let count = 0;
				if(rows.length){
					count = rows[0]['FOUND_ROWS()'] || 0;
				}
				resolve(count);
			});
		});
	}
	insert(table,obj){
		return new Promise((resolve, reject)=>{
			console.log(`INSERT INTO ${table} (${Serialize.key(obj)}) VALUES (${Serialize.value(obj)})`)
			this.db.query(`INSERT INTO ${table} (${Serialize.key(obj)}) VALUES (${Serialize.value(obj)})`,(err,rows,fields)=>{
				if(err) reject(err); //异常要抛出
		        resolve(rows);
			});
		});
	}
	exist(table,where){
		return new Promise((resolve)=>{
			this.query(table,"*",where).then((rows,fields)=>{
				resolve(rows.length > 1 ? true : false);
			});
		});
	}
	update(table,obj,where){
		return new Promise((resolve,reject)=>{
			this.db.query(`UPDATE ${table} ${Serialize.set(obj,where)} ${Serialize.where(where)}`,(err,rows,fields)=>{
				if(err) reject(err); //异常要抛出
				resolve(rows);
			});
		});
	}
	delete(table,where,whereIn){
		console.log(`delete from ${table} ${Serialize.where(where,whereIn)}`)
		return new Promise((resolve)=>{
			this.db.query(`delete from ${table} ${Serialize.where(where,whereIn)}`,(err,rows,fields)=>{
				if(err)
					log.error(err);
				resolve(rows);
			});
		});
	}
}

module.exports = Sql