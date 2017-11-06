//zhuye2.js
var app = getApp()

Page({
  data: {
    history_2: [],
  },


  onPullDownRefresh: function () {
    //console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载

    this.onShow()
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },

  onShow: function (options) {
    var that = this
    console.log( app.globalData.history)
    if (app.globalData.history.length<1){
      that.setData({
        empty: true
      })
    }
    that.setData({
      history2: app.globalData.history
    })
  }
})
