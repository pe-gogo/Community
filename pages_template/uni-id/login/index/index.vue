<template>
	<view class="app login">
		<!-- 页面内容开始 -->
		<view class="content">
			<!-- 头部logo -->
			<view class="header"><image class="logo" :src="logoImage"></image></view>
			<!-- 主体表单 -->
			
			<view class="login-btn">
				<button class="btn success circle" hover-class="hover" @click="login_weixin"
				 :plain="false" type="success" shape="circle" :hair-line="false">微信一键登录</button>
			</view>

			<!-- 其他登录 -->
			<view class="login-icon-view">
				<!-- #ifdef MP-WEIXIN -->
				<view class="login-icon-item">
					<u-icon name="weixin-fill" @click="login_weixin" size="80" color="#19be6b"></u-icon>
				</view>
				<!-- #endif -->
				<!-- #ifdef APP-PLUS -->
				<view class="login-icon-item">
					<u-icon name="weixin-fill" @click="login_weixin" size="80" color="#19be6b"></u-icon>
				</view>
				<!-- #endif -->
			</view>

			<!-- 底部信息 -->
			<view class="footer">
				<navigator url="../forget/forget" open-type="navigate">找回密码</navigator>
				<text class="center-line">|</text>
				<navigator url="../register/register" open-type="navigate">注册账号</navigator>
			</view>
		</view>

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
import $user from '../../../../store/modules/$user';
	var vk = uni.vk;
	export default {
		data() {
			// 页面数据变量
			return {
			    encryptedKey:"",
				// init请求返回的数据
				data:{

				},
				// 表单请求数据
				form1:{
					agreement: true,
					username: 'admin',
					password: '123456'
				},
				scrollTop:0,
				logoImage: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-623a4953-2e88-4b31-ad98-115329c71837/cb047bfc-494a-44cd-a698-02e2ce0a59a6.webp",

			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options) {
			
			let that = this;
			vk = uni.vk;
			this.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady(){

		},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {
			// #ifdef MP-WEIXIN
			uni.hideHomeButton();
			// #endif
		},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {


		},
		// 监听 - 页面下拉刷新
		onPullDownRefresh() {
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 监听 - 点击右上角转发时
		onShareAppMessage(options) {

		},
		// 函数
		methods: {
			// 页面数据初始化函数
			init(options = {}){
				let that = this;
				// #ifdef MP-WEIXIN
				vk.userCenter.code2SessionWeixin({
					data:{
						needCache:true
					},
					success: (data) => {
						that.encryptedKey = data.encryptedKey;
					},
				});
				// #endif
			},
			setUserInfo(){
				let that = this;
				// #ifdef MP-WEIXIN
				try {
					uni.getUserProfile({
						desc:"用于快速设置昵称头像",
						success:(res) => {
							let { userInfo } = res;
							vk.userCenter.updateUser({
								data:{
									nickname : userInfo.nickName,
									avatar : userInfo.avatarUrl,
									gender : userInfo.gender
								},
								success: (data) => {
									vk.alert("设置成功");
								}
							});
						}
					});
				}catch(err){
					vk.alert("您的微信版本过低，请先更新微信!");
				}
				// #endif
			
				// #ifndef MP-WEIXIN
				uni.login({
				  provider: 'weixin',
				  success: (loginRes) => {
				    // 获取用户信息
				    uni.getUserInfo({
				      provider: 'weixin',
				      success: (data) => {
								that.data = data;
								let { userInfo } = data;
								vk.userCenter.updateUser({
									data:{
										nickname : userInfo.nickName,
										avatar : userInfo.avatarUrl,
										gender : userInfo.gender
									},
									success: (data) => {
										vk.alert("设置成功");
									}
								});
				      }
				    });
				  }
				});
				// #endif
			},
			pageTo(path){
				vk.navigateTo(path);
			},
			// 账号密码登录
			login(){
				let that = this;
				const {agreement, username, password} = that.form1;
				if(!agreement){
					vk.toast('请阅读并同意用户服务及隐私协议',"none");
					return;
				}
				if(username.length < 4){
					vk.toast('账号至少4位数',"none");
					return;
				}
				if(!vk.pubfn.checkStr(password, 'pwd')){
					vk.toast('密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线',"none");
					return;
				}
				// 登录操作
				var form1 = that.form1;
				vk.userCenter.login({
					data:form1,
					//loading:false,
					success: (data) => {
						console.log("data",data);
						vk.toast("登陆成功!");
						setTimeout(() => {
							// 跳转到首页,或页面返回
							that.login_success(data);
						},1000);
					}
				});
			},
			login_success(data){
				let that = this;
				// 检查是否有指定跳转的页面
				if(vk.navigate.originalPage){
					vk.navigate.originalTo();
					return false;
				}
				// 跳转到首页,或页面返回
				console.log(vk.getVuex("$user.userInfo"))
				var pages = getCurrentPages();
				console.log(pages.length,pages[pages.length-1].route);
				if(pages.length > 1
					&& pages[pages.length-2]
					&& pages[pages.length-2].route
					&& pages[pages.length-2].route.indexOf('login/index') == -1
				){
					const eventChannel = that.getOpenerEventChannel();
					eventChannel.emit('loginSuccess', {});
					vk.navigateBack();
				}else{
					// 进入首页
					vk.navigateToHome();
				}
			},
			
			// 第三方登录 - 微信
			async login_weixin(e){
				
				if(!vk.getVuex("$user.userInfo.nickname")){
					await this.setUserInfo()
				}
				let that = this;
				vk.userCenter.loginByWeixin({
					success: (data) => {
						uni.getUserProfile({
							provider:"weixin",
							
						})
						vk.toast("登陆成功!");
						setTimeout(() => {
							// 跳转到首页,或页面返回
							that.login_success(data);
						},1000);
					}
				});
			},
			uploadAvatar(){
				// 选择图片
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: (res) => {
						// 上传图片到云储存
						vk.callFunctionUtil.uploadFile({
							title:"上传中...",
							filePath: res.tempFilePaths[0],
							fileType: "image",
							success(res) {
								// 执行绑定头像
								vk.userCenter.setAvatar({
									data: {
										avatar: res.fileID,
									},
									success() {
										// 修改Vuex用户状态
										vk.setVuex('$user.userInfo.avatar', res.fileID);
									}
								});
							}
						});
					}
				});
			}
		},
		
		// 计算属性
		computed:{

		}
	}
</script>
<style lang="scss" scoped>
	@import url("../css/main.css");
</style>
