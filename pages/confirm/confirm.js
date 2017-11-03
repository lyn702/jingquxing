//pages/confirm/confirm.js
var wxbarcode = require('../../utils/index.js');
var app = getApp()


Page({

  data: {
    title: "请至项目对应通道检票",
    disabled: false,
    refund: "退票",
    refund_act:"refund",
    scene: "",
    channel: "",
    tickets: [],
    money: "",
    tickets_count: 0,
    channel_id: 0,
    order: "",
    type: "",
    // status: "",
    use_status: "未使用",
    union_tic: []
  },

  onLoad: function() {
      var that = this
      that.data.order = app.globalData.orderid
      var orderid = app.globalData.orderid
      //   console.log(orderid)
      //  console.log(app.globalData.userid)
      wx.request({
          url: app.globalData.rootUrl + "/order/detail",
          data: {
              "order_id": orderid,
              "visitor_id": app.globalData.userid,
              "scene_id": app.globalData.channel_id,
              "appname": app.globalData.appname,
              "device": app.globalData.device
          },
          header: {
              "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          success: function(res) {
              console.log(res)
              var zifuchuan = 'uid=' + app.globalData.userid + '&sid=' + res.data.order.scene_id + '&cid=' + res.data.order.channel_id + '&oid=' + res.data.order.id
              // console.log(zifuchuan)
              wxbarcode.qrcode('qrcode', zifuchuan, 350, 350) //生成二维码
              var union = []
              var order = res.data.order
              var temp = order.type
              // console.log(temp)
              // console.log(res.data)

              // 0-单项票 1-联程卡 2-次卡 3-期限卡
              if (temp == 0) {
                  that.setData({
                      channel_id: order.channel_id,
                      scene: order.scene,
                      channel: order.channel,
                      tickets: order.tickets,
                      money: order.money,
                      order: order.id,
                      // status: order.status,
                      // is_coupon: order.is_coupon,
                      type: order.type,
                      tickets_count: order.tickets_count
                  })
              } else if (temp == 1) {
                  that.setData({
                      channel_id: order.channel_id,
                      scene: order.scene,
                      channel: order.channel,
                      tickets: order.tickets,
                      money: order.money,
                      order: order.id,
                      // status: order.status,
                      // is_coupon: order.is_coupon,
                      type: order.type,
                      tickets_count: order.tickets_count
                  })
              } else if (temp == 2) {
                  that.setData({
                      channel_id: order.channel_id,
                      scene: order.scene,
                      channel: order.channel,
                      tickets: order.tickets,
                      money: order.money,
                      order: order.id,
                      // status: order.status,
                      // is_coupon: order.is_coupon,
                      type: order.type,
                      tickets_count: order.tickets_count
                  })
              } else if (temp == 3) {
                  that.setData({
                      channel_id: order.channel_id,
                      scene: order.scene,
                      channel: order.channel,
                      tickets: order.tickets,
                      money: order.money,
                      order: order.id,
                      // status: order.status,
                      // is_coupon: order.is_coupon,
                      type: order.type,
                      tickets_count: order.tickets_count
                  })
              }

              app.globalData.scene_id = order.scene_id
              // that.data.is_coupon = order.is_coupon
              that.data.type = order.type
              // 通道ID
              var ar = order.channel
              // console.log(ar)
              // 景区ID
              var cr = order.scene
              // console.log(cr)
              // 订单ID
              var dr = order.id
              // console.log(dr)
              var br = order.used_channel
            //   单项票时使用状态的判断
              if (order.type == 0) {
                  ar = ar.split(",")
                  if (br == "") {
                      for (var i = 0; i < ar.length; i++) {
                          var x = '{"channel":' + '"' + ar[i] + '"' + ',"status":"未使用","hide":0}'
                          union[i] = JSON.parse(x)
                          console.log(union[i])
                      }
                  }

                  var patten = new RegExp(",")
                  //   console.log(patten)
                  if (patten.test(br)) {
                      that.setData({
                          refund: "使用中",
                          refund_act: ""
                      })
                      br = br.split(",")
                      // console.log(ar)
                      // console.log(br)
                      // console.log('进行中')
                      for (var i = 0; i < ar.length; i++) {
                          var x = '{"channel":' + '"' + ar[i] + '"' + ',"status":"未使用","hide":0}'
                          union[i] = JSON.parse(x)
                          for (var j = 0; j < br.length; j++) {
                              if (ar[i] == br[j]) {
                                  var x = '{"channel":' + '"' + ar[i] + '"' + ',"status":"已使用","hide":1}'
                                  union[i] = JSON.parse(x)
                              }
                          }
                      }
                  } else {
                      for (var i = 0; i < ar.length; i++) {
                          var x = '{"channel":' + '"' + ar[i] + '"' + ',"status":"未使用","hide":0}'
                          union[i] = JSON.parse(x)
                          if (ar[i] == br) {
                              var x = '{"channel":' + '"' + ar[i] + '"' + ',"status":"已使用","hide":1}'
                              union[i] = JSON.parse(x)
                              that.setData({
                                  refund: "使用中",
                                  refund_act: ""
                              })
                          }
                      }
                  }
                  console.log(union)
                  that.setData({
                      channel_id: order.channel_id,
                      scene: order.scene,
                      channel: ar,
                      tickets: order.tickets,
                      money: order.money,
                      tickets_count: order.tickets_count,
                      order: order.id,
                      type: order.type,
                      // status: order.status,
                      // is_coupon: order.is_coupon,
                      use_status: order.status,
                      union_tic: union
                  })
              }
            //   联程卡时使用状态的判断
            // else if (order.type == 1) {
            //
            //   }
            //   次卡时使用状态的判断
            // else if (order.type == 2) {
            //
            // }
            //   期限卡时使用状态的判断
            // else if (order.type == 3) {
            //
            // }
          }
      })
  },
  goback: function () {
    wx.redirectTo({
      url: '../zhuye2/zhuye2'
    })
  },

  //定义退票事件
  refund: function () {
    var that = this
    wx.showModal({
      title: '退款提示',
      content: '退款有一定延时，零钱支付的退款20分钟内到账，银行卡支付的退款3个工作日内到账',
      success: function (res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          wx.request({
            url: app.globalData.rootUrl + "/order/askRefund",
            data: {
              "order_id": app.globalData.orderid,

              "visitor_id": app.globalData.userid,
              "appname": app.globalData.appname,
              "device": app.globalData.device
              // "wxappid": app.globalData.wxappid,
              // "wxappsecret": app.globalData.wxappsecret
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            success: function (res) {
              console.log(res)
              if (res.data.result == 0) {
                wx.showModal({
                  title: '退款成功',
                  content: '请注意微信退款通知',
                  showCancel:false
                })

                that.data.refund = "退款中"
                that.data.title = "正在退款中"
                that.data.disabled = true
                that.setData({
                  refund: that.data.refund,
                  title: that.data.title,
                  disabled: that.data.disabled
                })
              } if (res.data.result == -1) {
                wx.showModal({
                  title: res.data.msg,
                  showCancel:false
                })

              }
            },
            fail: function () {
              wx.showModal({
                title: '退款服务暂停，请稍候再试',
                content: '',
              })

            }
          })
          //执行退票

        } else if (res.cancel) {
          // console.log('用户点击取消')
          return
        }
      },
      fail: function () {
        throw new Error("退款窗失败")
      }
    })
  },


  checkin: function () {
    var that = this
    var orderid = app.globalData.orderid
    wx.request({
      url: app.globalData.rootUrl + "scene/checkOrderPayStatusFromWx",
      data: {
        "order_id": orderid,
        "visitor_id": app.globalData.userid,
        "appname": app.globalData.appname,
        "device": app.globalData.device,
        "wxappid": app.globalData.wxappid,
        "wxappsecret": app.globalData.wxappsecret
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      success: function (res) {
        //console.log(res)
        if (res.data.result == 1) {
          if (res.data.pay_status == "SUCCESS") {
            wx.scanCode({
              success: (res) => {
                //   console.log(res)
                if (res.scanType == "QR_CODE") {
                  var flag = ""
                  var path = res.result
                  //console.log('返回path:' + path)
                  //app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
                  // console.log('app.globalData.userid')
                  // console.log(app.globalData.userid)
                  var mark = app.globalData.rootUrl + "wxapp/jingquxing/qrcode?"
                  var prex = path.substring(0, mark.length)

                  if (prex == mark) {
                    var val2 = path.substring((mark.length), path.length)
                    console.log(val2)
                    var vals = new Array()
                    vals = val2.split("&")
                    for (var i = 0; i < vals.length; i++) {
                      var data = new Array()
                      data = vals[i].split("=")
                      var pr = data[0].toLowerCase()
                      if (pr == "flag") {
                        flag = data[1]
                      } else if (pr == "cid") {
                        app.globalData.channel_id = data[1]
                      } else if (pr == "sid") {
                        app.globalData.scene_id = data[1]
                      }
                    }

                    // console.log("flag")
                    // console.log(this.data.flag)
                    // console.log("channel_id")
                    // console.log(app.globalData.channel_id)

                    var userid = wx.getStorageSync(app.globalData.storage_userid)
                    // console.log('userid')
                    // console.log(userid)


                    if (flag == 'buy') {
                      wx.showModal({
                        title: '扫码错误',
                        content: '请扫描正确的检票二维码'
                      })


                    }
                    else if (flag == 'use') {
                      console.log(app.globalData.scene_id)
                      console.log(app.globalData.channel_id)
                      console.log(that.data.channel_id)
                      var channel_has = -1
                      if (that.data.channel_id.length > 1) {
                        channel_has = that.data.channel_id.indexOf(app.globalData.channel_id)
                      }
                      console.log(channel_has)

                      if (that.data.channel_id == app.globalData.channel_id || channel_has >= 0) {
                        wx.request({
                          url: app.globalData.rootUrl + "scene/channel_checkin",
                          data: {
                            'visitor_id': app.globalData.userid,
                            'order_id': orderid,
                            "scene_id": app.globalData.scene_id,
                            "channel_id": app.globalData.channel_id,
                            "employee_id": 0,
                            "appname": app.globalData.appname,
                            "device": app.globalData.device,
                            "wxappid": app.globalData.wxappid,
                            "wxappsecret": app.globalData.wxappsecret
                          },

                          header: {
                            "Content-Type": "application/x-www-form-urlencoded"
                          },
                          method: "POST",
                          success: function (res) {
                            console.log("参数visitor_id,order_id:")
                            console.log(app.globalData.userid)
                            console.log(orderid)

                            // console.log("checkin 返回值")
                            console.log(res)
                            if (res.data.result == -1) {
                              // console.log(res.data)
                              wx.showModal({
                                title: '检票失败',
                                content: res.data.msg
                              })
                            }
                            else if (res.data.result == 0) {
                              var used = res.data.used_order
                              //console.log(used)
                              app.globalData.scene = used.scene
                              app.globalData.channel = used.channel
                              app.globalData.buydate = used.buydate
                              app.globalData.tickets = used.tickets
                              app.globalData.money = used.money
                              console.log(app.globalData.tickets)
                              app.globalData.orderid = res.data.used_order.id
                              wx.showToast({
                                title: "验票成功",
                                duration: 1500,
                                success: function () {
                                  wx.redirectTo({
                                    url: '../checked/checked'
                                  })
                                }
                              })
                            }
                          }
                        })
                      } else {
                        wx.showModal({
                          title: '检票失败',
                          content: '请选择当前通道门票进行检票',
                          showCancel: false
                        })

                      }

                    }
                  } else {
                    wx.showModal({
                      title: '扫码错误',
                      content: '请扫描正确的检票二维码！',
                      showCancel: false
                    })

                  }
                } else {
                  wx.showModal({
                    title: '扫码错误',
                    content: '请扫描正确的检票二维码！',
                    showCancel: false
                  })
                }
              },

              fail: (res) => {
                wx.showModal({
                  title: '扫码错误',
                  content: '请扫描正确的检票二维码！',
                  showCancel:false
                })
              },

              complete: (res) => {
                // console.log('扫码结束')
              }
            })
          } else if (res.data.pay_status == "REFUND") {
            wx.showModal({
              title: res.data.pay_msg,
              showCancel:false
            })
          }
        } else {
          // console.log(res.data.pay_msg)
          wx.showToast({
            title: res.data.pay_msg,
            duration: 3000,
            success: function () {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      }
    })
  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
