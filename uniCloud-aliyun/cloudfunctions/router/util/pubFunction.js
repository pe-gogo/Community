/**
 * 自定义公共函数包
 * 这里可以写你自己的公共函数
 */
var pubFun = {};
/**
 * 公共函数写法示例
 * 调用示例：
 * pubFun.getGoods();
 * 或
 * vk.myfn.getGoods();
 */
pubFun.getSms= = function(path) {
	let sendSmsRes = await vk.system.smsUtil.sendSms({
		provider: "aliyun",
		phone: "15200000001",
		templateId: "SMS_202470413",
		data: {
		code: "1234"
  }
});
	return ;
}
pubFun.go = function(path,data){
	
	vk.callFunction({
		url: path,
		title: '...',
		data: {
			...data
		},
		success: (data) => {
			return data;
		},
	});
}


module.exports = pubFun;
