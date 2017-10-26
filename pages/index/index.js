// pages/index/index.js
var sha1 = require('../../utils/sha1.js')
var app = getApp()

Page({

  data: {
    fill: 100,
    tickets: [],
    hiddenNotice: true,
    hiddenMyTick: true,
    myTickets: [],
    totalNum: 0,
    totalPrice: 0,
    flag: "",
    show_tic: true,
    hide_coupon: false
  },


  goToPay: function () {
    var that = this
    if (that.data.myTickets.length == 0) {
      wx.showToast({
        title: '请选好票再下单哦'
      })
      //console.log("goToPay empty")
      return
    }
    else {
      wx.navigateTo({
        url: '../pay/pay'
      })
    }
  },


  hiddenMyTick: function () {
    var that = this
    that.data.hiddenMyTick = !that.data.hiddenMyTick
    that.setData({
      hiddenFoorter: that.data.hiddenMyTick
    })
  },

  deepCopy: function (source) {
    var result = {}
    for (var key in source) {
      result[key] = typeof source[key] === 'object' ? deepCoyp(source[key]) : source[key]
    }
    return result
  },

  calShow: function () {
    var that = this
    if (that.data.myTickets.length == 0) {
      that.clearAll()
      return
    }

    that.data.totalNum = 0
    that.data.totalPrice = 0
    that.data.hiddenNotice = false
    for (var i = 0; i < that.data.myTickets.length; i++) {
      that.data.totalNum += that.data.myTickets[i].number
      that.data.totalPrice += that.data.myTickets[i].number * that.data.myTickets[i].price
      that.data.totalPrice = parseInt(that.data.totalPrice * 100) / 100
    }
    app.globalData.myTicketList = that.data.myTickets
    that.setData({
      totalNum: that.data.totalNum,
      totalPrice: that.data.totalPrice,
      myTicketList: that.data.myTickets,
      hiddenNotice: that.data.hiddenNotice,
    })
  },

  //获取当前时间
  getNowDate: function () {
    var d = new Date()
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
  },

  addTicket: function (id, iNumber) {
    var that = this
    var bHave = false
    //是否有
    for (var i = 0; i < that.data.myTickets.length; i++) {
      if (that.data.myTickets[i].id == id) {
        bHave = true
        //console("测试addTicket" + id)
        that.data.myTickets[i].number += iNumber
        //console.log("票数" + that.data.myTickets[i].number)
        if (that.data.myTickets[i].number <= 0) {
          that.data.myTickets.splice(i, 1)
        }
        break
      }
    }

    if (!bHave && iNumber > 0) {
      for (var i = 0; i < that.data.tickets.length; i++) {
        if (id == that.data.tickets[i].id) {
          var newTick = that.deepCopy(that.data.tickets[i])
          newTick.number = iNumber
          that.data.myTickets.push(newTick)
        }
      }
    }

    that.calShow()
    wx.setStorageSync(app.globalData.storage_MyTicket, that.data.myTickets)
  },
  //数量减少
  subNum: function (e) {
    var that = this
    that.addTicket(e.currentTarget.id, -1)
  },
  //数量增加
  addNum: function (e) {
    var that = this
    console.log(e)
    console.log(e.currentTarget.id)
    that.addTicket(e.currentTarget.id, 1)
    console.log(that.data.flag)
    if (that.data.flag == "coupon") {

      wx.navigateTo({
        url: '../index2/index2'
      })
    }
  },

  //清空
  clearAll: function () {
    var that = this
    that.data.myTickets = []
    that.data.totalNum = 0
    that.data.totalPrice = 0
    that.data.hiddenNotice = true
    that.data.hiddenMyTick = true
    app.globalData.myTicketList = that.data.myTickets
    that.setData({
      totalNum: that.data.totalNum,
      totalPrice: that.data.totalPrice,
      myTicketList: that.data.myTickets,
      hiddenNotice: that.data.hiddenNotice,
      hiddenFoorter: that.data.hiddenMyTick
    })
    wx.setStorageSync(app.globalData.storage_MyTicket, that.data.myTickets)
    //console.log("重置缓存购票车")
  },



  //加载商品
  loadTicket: function () {
    var that = this
    that.data.flag = app.globalData.flag
    //  console.log("channelId:")
    console.log(app.globalData.flag)
    console.log(app.globalData.channel_id)
    console.log(app.globalData.scene_id)
    wx.request({
      url: app.globalData.rootUrl + "scene/channel_ticketsList",
      data: {
        "flag": app.globalData.flag,
        "sid": app.globalData.scene_id,
        "cid": app.globalData.channel_id,
        "appname": app.globalData.appname,
        "device": app.globalData.device
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      success: function (res) {
        console.log(res)

        if (res.data.result != 1) {
          wx.showModal({
            title: '获取票务信息失败！',
            content: res.data.msg,
            showCancel: false
          })

          return
        }
        if (res.data.result == 1) {
          var ticket = res.data.tickets
          console.log("测试ticket:")
          console.log(res.data)
          // 加载时间有效范围内的门票
          var tmpticket = new Array()
          var d = new Date()
          if (ticket.length > 6) {
            that.data.fill = (ticket.length - 3) * 85 + 50
            that.setData({
              fill: that.data.fill
            })
          }

          for (var i = 0; i < ticket.length; i++) {
            var t = ticket[i]
            if (app.globalData.flag == "coupon") {
              var n = t.channel_name.split(",")
              t.type = t.scene_name + n.length + "项"
            }
            t.number = 0
            //console.log(t)
            var start = new Array()
            start = t.validtime_start.split(":")
            var t_start = new Date()
            t_start.setHours(parseInt(start[0]), parseInt(start[1] - 30), 0)

            var close = new Array()
            close = t.validtime_end.split(":")
            var t_close = new Date()
            t_close.setHours(parseInt(close[0]), parseInt(close[1] - 20), 0)




            if (d.getTime() > t_start.getTime() && d.getTime() <= t_close.getTime()) {
              tmpticket.push(t)
            }
          }

          that.data.tickets = tmpticket


          // that.setColor(that.data.tickets)
          that.setData({
            ticketList: that.data.tickets,
            flag: that.data.flag
          })
        }
        // console.log(that.data.tickets)
      },


      fail: function (res) {

        wx.showModal({
          title: '获取票务信息失败！',
          content: res.data.msg,
          showCancel: false
        })
        // console.log(res)
      },

      complete: function () {
      }

    })
  },


  onReachBottom: function () {
    return
  },
  //刷新处理
  onPullDownRefresh: function (e) {
    var that = this
    //数据重置
    that.data.tickets = []
    //数据重置
    that.data.tickets = []
    that.loadTicket()
    wx.stopPullDownRefresh()
  },

  onShow: function () {
    var that = this
    that.clearAll()
    that.loadTicket()
    that.data.myTickets = wx.getStorageSync(app.globalData.storage_MyTicket)
    that.calShow()
  },

  onLoad: function (options) {
    var that = this

    /**************扫一扫普通二维码跳转功能***********/
    if (options.q) {
      //console.log(options.q)
      var val = new String(options.q)
      var path = decodeURIComponent(val)
      var flag = ""
      //console.log(val)

      console.log(path)
      if (path.length > 0) {
        var mark = app.globalData.rootUrl + "wxapp/jingquxing/qrcode?"
        var prex = path.substring(0, mark.length)

        if (prex == mark) {
          var val2 = path.substring((mark.length), path.length)
          var vals = new Array()
          vals = val2.split("&")
          // console.log(vals[0] + ":" + vals[1])
          for (var i = 0; i < vals.length; i++) {
            var data = new Array();
            data = vals[i].split("=")
            var pr = data[0].toLowerCase()
            if (pr == "flag") {
              flag = data[1]
              // console.log(flag)
              if (flag == 'use') {
                wx.redirectTo({
                  url: '../zhuye2/zhuye2'
                })
              }
            }
            if (pr == "cid") {
              app.globalData.channel_id = data[1]
            }
            if (pr == "sid") {
              app.globalData.scene_id = data[1]
            }
          }
        }
      }

      that.setData({
        hiddenFoorter: that.data.hiddenMyTick,
        nowDate: that.data.buyDate,
        startDate: that.data.buyDate
      })
      that.clearAll()
      //拉取商品信息
      that.loadTicket()
    }

    //新增*******************小程序码扫一扫跳转逻辑****************/
    if (options.scene) {
      //console.log(options.scene)
      var scene = options.scene
      scene = decodeURIComponent(options.scene)
      // console.log(scene)
      var info = new Array()
      info = scene.split("&")
      // console.log(info)
      for (var i = 0; i < info.length; i++) {
        var data = new Array()
        data = info[i].split("=")
        var pr = data[0].toLowerCase()
        if (pr == "flag") {
          app.globalData.flag = data[1]
        }
        if (pr == "sid") {
          app.globalData.scene_id = data[1]
        } if (pr == "cid") {
          app.globalData.channel_id = data[1]
        }
      }


      that.setData({
        hiddenFoorter: that.data.hiddenMyTick,
        nowDate: that.data.buyDate,
        startDate: that.data.buyDate
      })
      that.clearAll()
      //拉取商品信息
      that.loadTicket()
    }
  }
})
