'use strict';
var vk; // 全局vk实例
// 涉及的表名
const dbName = {
	goods:"opendb-mall-goods"
	
};

var db = uniCloud.database(); // 全局数据库引用
var _ = db.command; // 数据库操作符
var $ = _.aggregate; // 聚合查询操作符
/**
 * 权限注意：访问以下链接查看
 * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#内置权限
 */
var cloudObject = {
	isCloudObject: true, // 标记为云对象模式
	/**
	 * 请求前处理，主要用于调用方法之前进行预处理，一般用于拦截器、统一的身份验证、参数校验、定义全局对象等。
	 * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#before-预处理
	 */
	_before: async function() {
		vk = this.vk; // 将vk定义为全局对象
		// let { customUtil, uniID, config, pubFun } = this.getUtil(); // 获取工具包
	},
	/**
	 * 请求后处理，主要用于处理本次调用方法的返回结果或者抛出的错误
	 * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#after-后处理
	 */
	_after: async function(options) {
		let { err, res } = options;
		if (err) {
			return; // 如果方法抛出错误，直接return;不处理
		}
		return res;
	},
	/**
	 * 获取所有商品列表
	 * @url client/pub.goods.getList 前端调用的url参数地址
	 */
	getList: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = this.getClientInfo(); // 获取客户端信息
		// 业务逻辑开始-----------------------------------------------------------
		res.data = await vk.daoCenter.goodsDao.select({
			pageIndex:1,
			pageSize:10,
			getMain:true,
			fieldJson:{},
			sortArr:[{ "name":"_id", "type":"desc" }],
		});
	
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
	
	/**
	 * 获取商品列表
	 * @url client/pub.goods.getGoodsByCid 前端调用的url参数地址
	 */
	getGoodsByCid: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = this.getClientInfo(); // 获取客户端信息
		let {cid} = data
		// 业务逻辑开始-----------------------------------------------------------
		res = await vk.baseDao.select({
		  dbName: dbName.goods, // 表名
		  getCount:false, // 是否需要同时查询满足条件的记录总数量，默认false
		  getMain:false,// 是否只返回rows数据，默认false
		  pageIndex:1, // 当前第几页
		  pageSize:20, // 每页条数
		  whereJson:{ // 条件
		    cate_id: data.cid
		  }
		});
	
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
	/**
	 * 模板函数
	 * @url client/pub.goods.getGoodAndCate 前端调用的url参数地址
	 */
	getGoodAndCate: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = this.getClientInfo(); // 获取客户端信息
		// 业务逻辑开始-----------------------------------------------------------
		res = await vk.baseDao.selects({
		  dbName: dbName.goods,// 主表名
		  getCount: false, // 是否需要同时查询满足条件的记录总数量，默认false
		  getMain:false,// 是否只返回rows数据，默认false
		  pageIndex: 1, // 查询第几页
		  pageSize: 10, // 每页多少条数据
		  // 主表where条件
		  whereJson: {
		
		  },
		  // 主表字段显示规则
		  fieldJson: {
		    token: false,
		    password: false,
		  },
		  // 主表排序规则
		  sortArr: [{ "name": "_id","type": "desc" }],
		  // 副表列表
		  foreignDB: [
		    {
		      dbName: "order", // 副表名
		      localKey:"_id", // 主表外键字段名
		      foreignKey: "user_id", // 副表外键字段名
		      as: "orderList",
		      limit: 10, // 当limit = 1时，以对象形式返回，否则以数组形式返回
		      // 副表where条件
		      whereJson: {},
		      // 副表字段显示规则
		      fieldJson: {},
		      // 副表排序规则
		      sortArr: [{ "name": "time","type": "desc" }],
		    },
		    {
		      dbName: "vip", // 副表名
		      localKey:"_id", // 主表外键字段名
		      foreignKey: "user_id", // 副表外键字段名
		      as: "vipInfo",
		      limit: 1, // 当limit = 1时，以对象形式返回，否则以数组形式返回
		    }
		  ]
		});

		// 业务逻辑结束-----------------------------------------------------------
		return res;
	},
};

module.exports = cloudObject;
