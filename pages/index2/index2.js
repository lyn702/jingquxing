var app = getApp()
Page({

  data: {
    fill: 100,
    tickets: [],
    hiddenNotice: true,
    hiddenMyTick: true,
    myTickets: [],
    totalNum: 1,
    totalPrice: 0,
    flag: "",
    show_tic: true,
    hide_coupon: false,
    myTicketList:[]
  },

onLoad:function(){
  var that=this
  that.data.myTickets = wx.getStorageSync(app.globalData.storage_MyTicket)
  console.log(that.data.myTickets)
  that.setData({
    ticketList: that.data.myTickets,
    myTicketList: app.globalData.myTicketList

  })
},

onShow: function () {
  var that = this
  //that.clearAll()
  //that.loadTicket()
  //that.data.myTickets = wx.getStorageSync(app.globalData.storage_MyTicket)
  //that.calShow()
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

  that.setData({
    totalNum: that.data.totalNum,
    totalPrice: that.data.totalPrice,
    myTicketList: that.data.myTickets,
    hiddenNotice: that.data.hiddenNotice
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
      //如果购物车门票减至0，返回选票页面
      if (that.data.myTickets[i].number <= 0) {
        that.data.myTickets.splice(i, 1)
        wx.navigateBack({
          delta:1
        })
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
  console.log(e.currentTarget.id)
  that.addTicket(e.currentTarget.id, 1)

},

//清空
clearAll: function () {
  var that = this
  that.data.myTickets = []
  that.data.totalNum = 0
  that.data.totalPrice = 0
  that.data.hiddenNotice = true
  that.data.hiddenMyTick = true
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


})
