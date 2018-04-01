//返回标准状态结构
function st(status,msg) {
    return {
        status: !!status,
        msg: msg || ""
    }
}

//校验结果
st.check=function(st){
    return st.status ? true :false;
}

module.exports =st



