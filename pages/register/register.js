//获取应用实例
var sha1 = require('../../utils/sha1.js')
var app = getApp()

function countdown(that) {
  var second = that.data.second
  if (second == 0) {
    that.setData({
      codeButtText: "获取",
      disabledGetCode: false
    })
    return
  }
  var time = setTimeout(function () {
    that.setData({
      second: second - 1,
      codeButtText: second + "秒"
    })
    countdown(that)
  }, 1000)
}

Page({
  data: {
    timeOut: 60,
    second: 0,
    checkBox: false,
    phone: "",
    checkcode: "",
    check: {},
    userid: "",
    usephone: false
  },

  getPhoneNumber: function (e) {
    var that = this
    // console.log(e)
    // console.log(e.detail)
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      // console.log(e.detail.iv)
      // console.log(e.detail.encryptedData)
      var iv = e.detail.iv
      var encryptedData = e.detail.encryptedData
      // console.log(app.globalData.device)
      wx.request({
        url: app.globalData.rootUrl + 'visitor/register_or_login_wxauth',
        data: {
          "wx_login_code": app.globalData.logincode,
          "encryptedData": encryptedData,
          "iv": iv,
          "appname": app.globalData.appname,
          "device": app.globalData.device
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success:function(res){
          var x = res.data
          if(x.result == 0){
            app.globalData.phone = x.cellphone
            app.globalData.userid = x.id
            wx.setStorageSync(app.globalData.storage_Phone, app.globalData.phone)
            wx.setStorageSync(app.globalData.storage_userid,app.globalData.userid)
            wx.navigateBack({
              delta: 1
            })
          }else{
          //  console.log(res)
          wx.showModal({
            title: '获取手机失败',
            content: res.data.msg,
            showCancel:false
          })
          }
        }
      })


    } else {
      wx.showModal({
        title: '登录失败，请重试',
        content:e.detail.errMsg,
        showCancel: false
      })

    }
  },
  invokephone: function () {
    var that = this
    that.setData({ usephone: true })
  },
  //电话号码输入
  getPhone: function (e) {
    var that = this
    var phone = /^1[3|4|5|7|8][0-9]\d{4,8}$/
    if (!phone.test(e.detail.value)) {
      that.setData({
        disabledGetCode: true
      })
      return
    } else {
      that.setData({ disabledGetCode: false })
      that.data.phone = e.detail.value
    }
    //号码格式正确，获取验证码按钮可用

    //console.log(that.data.phone)//查看手机号码
  },

  //验证码输入
  inputCode: function (e) {
    var that = this
    that.data.checkcode = e.detail.value
  },

  // console.log(that.data.checkcode);//查看验证码
  //获取验证码

  getCode: function () {
    var that = this
    that.setData({ disabledGetCode: true })
    //倒计时
    that.data.second = that.data.timeOut
    countdown(that)
    console.log("获取验证码")
    console.log(that.data.phone)
    console.log(app.globalData.rootUrl + "visitor/getSMS")
    console.log(app.globalData.appname)
    console.log(app.globalData.device)
    console.log(that.data.phone)
    wx.request({
      url: app.globalData.rootUrl + "visitor/getSMS",
      data: {
        "device": app.globalData.device,
        "cellphone": that.data.phone,
        "appname": app.globalData.appname

      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // console.log(res)
        // console.log(res.data.id)
        that.data.userid = res.data.id

        if (res.data.result < 1) {
          console.log(res)
          wx.showToast({
            title: res.data.msg,
            image: '../../image/icon_error.png',
            duration: 3000
          })
          return
        }

      },
      fail: function (res) {
        // console.log(res)
        wx.showToast({
          title: '获取验证码失败，请稍后重试！',
          image: '../../image/icon_error.png',
          duration: 3000
        })
      }
    })
  },


  submit: function () {
    var that = this
    wx.request({
      url: app.globalData.rootUrl + "visitor/register_or_login",
      data: {
        "id": that.data.userid,
        "cellphone": that.data.phone,
        "smscode": that.data.checkcode,
        "wx_login_code": app.globalData.logincode,
        "appname": app.globalData.appname,
        "device": app.globalData.device

      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        console.log(res.data)
        if (res.data.result != 1) {
          console.log(res.data.msg)
          wx.showToast({
            title: res.data.msg,
            duration: 3000
          })
          throw new Error(res.data.msg)
        } else {
          app.globalData.phone = that.data.phone
          //console.log(app.globalData.userid)//test 输出测试
          wx.setStorageSync(app.globalData.storage_Phone, app.globalData.phone)
          //console.log(app.globalData.storage_Phone)
          app.globalData.userid = that.data.userid
          wx.setStorageSync(app.globalData.storage_userid, app.globalData.userid)
          // console.log(app.globalData.userid)

          wx.navigateBack({
            delta: 1
          })
        }


      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '登录失败',
          image: '../../image/icon_error.png',
          duration: 3000
        })
      }
    })
  },

  //用户协议跳转
  goToProto: function () {
    wx.navigateTo({
      url: '../proto/proto',
      success: function (res) { }
    })
  },

  //用户协议选择
  listenCheckboxChange: function (e) {
    var that = this
    that.data.checkBox = !that.data.checkBox
    that.setData({
      disabledSubmit: that.data.checkBox,
    })
  },

  onLoad: function () {
    var that = this
    that.setData({
      disabledGetCode: true,
      disabledSubmit: that.data.checkBox,
      codeButtText: "获取"
    })


    // //获取号码缓存
    // app.globalData.phone = wx.getStorageSync(app.globalData.storage_Phone)
    // app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
    // console.log(app.globalData.phone)
    // var phone = /^1\d{10}$/
    // if (phone.test(app.globalData.phone) && app.globalData.userid) {
    //   wx.navigateBack({
    //     delta: 1
    //   })

    // }
  }
})
