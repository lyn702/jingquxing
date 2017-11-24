var fundebug = require('./utils/fundebug.min.js')
fundebug.apikey = '1200eb165d1d452cf2df3c0051b72b4502f837c94ccf25bf4ebeeb2e7d297ce0'

App({

  globalData: {

    device: "wxapp",
    // "wxappid": "wxa6c9771e09dfe74a",
    // "wxappsecret": "815a92b58e5aab64f885b755d8dbf9e1",
    appVersion: "1.2.4",
    appname: "jingquxing",
    rootUrl: "https://leyuanxing.net/",//服务器url
    userInfo: null,//用户微信信息
    logincode: null,

    storage_Phone: "phone",
    storage_MyTicket: "myTicket",
    storage_userid: "userid",

    history:[],
    shopcart:[],
    myTicketList:[],
    used: [],
    userid: "",
    orderid: null,
    channel_id: null,
    scene_id:null,
    scene: "",
    flag:"",
    channel: "",//游乐场编号
    buydate: "",//游乐项目编号
    phone: "",//手机号
    money: null,
    tickets: [],//验票信息
    usedate: "",
    btn: "扫码购票"
  },

  onLaunch: function () {

    //console.log("App onLaunch")
    // wx.setEnableDebug({
    //   enableDebug: false
    // })

    var that = this
    var sysInfo = wx.getSystemInfoSync()
    console.log(sysInfo)
    if (sysInfo.version.length == 5) {
      if (sysInfo.version < "6.5.6") {
        wx.showModal({
          title: '对不起',
          content: '您的微信版本不支持小程序。请升级到最新版本再试'
        })
      }
    }
    wx.onNetworkStatusChange(function (res) {
      console.log(res.isConnected)
      if (res.isConnected == false){
        wx.showModal({
          title: '您已断开网络',
          content: '请确保网络畅通',
          showCancel:false
        })
      }
      console.log(res.networkType)
    })
    //微信登陆
    wx.login({
      success: function (res) {
        if (res.code) {
           // console.log("微信登陆：" )
          // console.log(res)
          that.globalData.logincode = res.code
           console.log("微信登陆,code：" + that.globalData.logincode)

          wx.getSystemInfo(
            {
              success: function (res) {
                fundebug.systemInfo = res;
              }
            })
          // wx.getUserInfo({
          //   success: function (res) {
          //     that.globalData.userInfo = res.userInfo
          //     console.log(that.globalData.userInfo)
          //   }
          // })

          that.globalData.phone = wx.getStorageSync(that.globalData.storage_Phone)
          //console.log("appJS页面：" + that.globalData.phone)
          that.globalData.userid = wx.getStorageSync(that.globalData.storage_userid)
          var phone = /^1\d{10}$/
          if (!phone.test(that.globalData.phone) || !that.globalData.userid) {
            wx.showModal({
              title: '请先登录',
              content: '',
              showCancel: false,
              confirmText: "登录",
              success: function () {
                  wx.navigateTo({
                    url: '../../pages/register/register',
                    success: function (res) { },
                    fail: function (res) {
                      throw new Error("跳转失败！")
                    }
                })

                }

            })

          }

        } else {
          //  console.log('获取用户登录态失败！' + res.errMsg)
          wx.showToast({
            title: '微信登录失败！' + res.errMsg,
            duration: 3000
          })
        }
      }

    })
  }
})
