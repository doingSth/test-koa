//策略模式
//提取校验点算法,用中介管理,剥离校验集合和调用方耦合

//默认结构
let st = require("./status");

let vaild = {
    name:(value)=>{
        return value ? st(true) : st(false,"name不能为空");
    },
    path:(value)=> {
        if(!value)
            return st(false,'path不能为空')
        if(!/^\//.test(value))
            st(false,`path不规范,请以/xx开头`);
        return st(true);
    }
}

module.exports = function(param){
    if(!param)
        return st(true);
    for(let key in param){
        if(vaild[key]){
            let result = vaild[key](param[key]);
            if(!st.check(result))
                return result;
        }
    }
    return st(true);
}