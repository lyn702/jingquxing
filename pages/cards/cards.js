//zhuye2.js
var app = getApp()

Page({
    data: {
        flag: "",
        channel_id: "",
        parkname: "",
        itemname: "",
        label: '',
        ticketnum: '',
        bought_date: '',
        validtime: '',
        totalMoney: '',
        history_0: [],
        history_1: [],
        history_2: [],
        validtime: "",
        usedate: "",
        showHistory: "hidden",
        btn: app.globalData.btn,
        empty: false
    },

    showHis: function(e) {
        wx.navigateTo({
            url: '../history/history'
        })
    },

    //扫描二维码，获取游乐园信息编码及通道编码
    scanqrcode: function() {
        var that = this
        var sysInfo = wx.getSystemInfoSync()
        var flag = ""
        wx.scanCode({
            success: (res) => {

                console.log(res)
                //根据扫码获得的返回结果判断是微信小程序码
                if (res.path) {
                    res = res.path
                    res = decodeURIComponent(res)
                    var scene = res.slice(24)
                    console.log(scene)
                    var info = new Array()
                    info = scene.split("&")
                    for (var i = 0; i < info.length; i++) {
                        var data = new Array()
                        data = info[i].split("=")
                        var pr = data[0].toLowerCase()
                        if (pr == "flag") {
                            app.globalData.flag = data[1]
                        }
                        if (pr == "sid") {
                            app.globalData.scene_id = data[1]
                        }
                        if (pr == "cid") {
                            app.globalData.channel_id = data[1]
                        }
                    }
                    wx.navigateTo({
                        url: '../index/index'
                    })
                }


                //根据扫码获得的返回结果判断是普通二维码
                if (res.result) {
                    var path = res.result
                    console.log(path)
                    console.log(app.globalData.rootUrl)
                    var mark = app.globalData.rootUrl + "wxapp/jingquxing/qrcode?"
                    var prex = path.substring(0, mark.length)
                    console.log(prex)
                    console.log(mark)
                    if (prex == mark) {
                        var val2 = path.substring((mark.length), path.length)
                        var vals = new Array()
                        vals = val2.split("&")
                        console.log(vals[0] + ":" + vals[1])
                        for (var i = 0; i < vals.length; i++) {
                            var data = new Array();
                            data = vals[i].split("=")
                            var pr = data[0].toLowerCase()
                            if (pr == "flag") {
                                app.globalData.flag = data[1]
                            } else if (pr == "cid") {
                                app.globalData.channel_id = data[1]
                            }
                        }

                        var userid = wx.getStorageSync(app.globalData.storage_userid)

                        if (flag == 'buy') {
                            wx.navigateTo({
                                url: '../index/index'
                            })
                        } else if (flag == 'use') {
                            wx.showToast({
                                title: '请点击门票后扫码检票',
                                image: '../../image/icon_error.png',
                                duration: 5000
                            })
                            return false
                        }
                    } else {
                        wx.showToast({
                            title: '扫码错误，请确认正确的二维码',
                            image: '../../image/icon_error.png',
                            duration: 2000
                        })
                    }
                }
            },

            fail: (res) => {
                wx.showToast({
                    title: '不符合规则的二维码，请选择正确的二维码进行扫描！',
                    image: '../../image/icon_error.png',
                    duration: 2000
                })
            },

            complete: (res) => {
                // console.log('扫码结束')
            }

        })

    },

    //查看门票详情
    detail: function(e) {
        var that = this
        console.log(e)
        // console.log(e.currentTarget.id)
        // console.log(this)
        var orderid = e.currentTarget.id
        app.globalData.orderid = orderid
        wx.navigateTo({
            url: '../confirm/confirm'
        })
    },

    //选择订单进行检票
    checkin: function(e) {
        var that = this
        console.log(e)
        // console.log(e.currentTarget.id)
        // console.log(this)
        var orderid = e.currentTarget.id
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
            success: function(res) {
                console.log(res)
                if (res.data.result == 1) {
                    if (res.data.pay_status == "SUCCESS") {
                        wx.scanCode({
                            success: (res) => {
                                console.log(res)
                                if (res.scanType == "QR_CODE") {
                                    var flag = ""
                                    var path = res.result
                                    console.log('返回path:' + path)
                                    //app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
                                    // console.log('app.globalData.userid')
                                    // console.log(app.globalData.userid)
                                    var mark = app.globalData.rootUrl + "wxapp/jingquxing/qrcode?"
                                    var prex = path.substring(0, mark.length)

                                    if (prex == mark) {
                                        var val2 = path.substring((mark.length), path.length)
                                        var vals = new Array()
                                        vals = val2.split("&")
                                        console.log(vals[0] + ":" + vals[1])
                                        for (var i = 0; i < vals.length; i++) {
                                            var data = new Array();
                                            data = vals[i].split("=")
                                            var pr = data[0].toLowerCase()
                                            if (pr == "flag") {
                                                flag = data[1]
                                            }
                                            if (pr == "cid") {
                                                app.globalData.channel_id = data[1]
                                            }
                                        }

                                        console.log("flag")
                                        console.log(flag)
                                        console.log("channel_id")
                                        console.log(app.globalData.channel_id)

                                        var userid = wx.getStorageSync(app.globalData.storage_userid)
                                        // console.log('userid')
                                        // console.log(userid)

                                        if (flag == 'buy') {
                                            wx.showToast({
                                                title: '扫码错误，请扫描正确的检票二维码',
                                                image: '../../image/icon_error.png',
                                                duration: 2000
                                            })
                                        } else if (flag == 'use') {
                                            var channel = null
                                            for (var i = 0; i < that.data.history1.length; i++) {
                                                if (that.data.history1[i].id == orderid) {
                                                    channel = that.data.history1[i].channel_id
                                                }
                                            }

                                            if (channel == app.globalData.channel_id) {
                                                wx.request({
                                                    url: app.globalData.rootUrl + "scene/channel_checkin",
                                                    data: {
                                                        'visitor_id': app.globalData.userid,
                                                        'order_id': orderid,
                                                        "appname": app.globalData.appname,
                                                        "device": app.globalData.device,
                                                        "wxappid": app.globalData.wxappid,
                                                        "wxappsecret": app.globalData.wxappsecret
                                                    },

                                                    header: {
                                                        "Content-Type": "application/x-www-form-urlencoded"
                                                    },
                                                    method: "POST",
                                                    success: function(res) {
                                                        // console.log("参数visitor_id,order_id:")
                                                        // console.log(app.globalData.userid)
                                                        // console.log(orderid)

                                                        // console.log("checkin 返回值")
                                                        // console.log(res)
                                                        if (res.data.result == -1) {
                                                            console.log(res.data)
                                                            wx.showToast({
                                                                title: res.data.msg
                                                            })
                                                            //throw new Error(res.data.msg)

                                                        } else if (res.data.result == 1) {
                                                            var used = res.data.used_order
                                                            console.log(used)
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
                                                                success: function() {
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
                                        wx.showToast({
                                            title: '扫码错误！请扫描正确的检票二维码！',
                                            image: '../../image/icon_error.png',
                                            duration: 3000
                                        })

                                    }
                                } else {
                                    wx.showToast({
                                        title: '扫码错误！请扫描正确的检票二维码！',
                                        image: '../../image/icon_error.png',
                                        duration: 3000
                                    })
                                }
                            },

                            fail: (res) => {},

                            complete: (res) => {
                                // console.log('扫码结束')
                            }
                        })
                    } else if (res.data.pay_status == "REFUND") {
                        wx.showToast({
                            title: res.data.pay_msg,
                            image: '../../image/icon_error.png',
                            duration: 5000
                        })
                    }
                } else {
                    //console.log(res.data.pay_msg)
                    wx.showToast({
                        title: res.data.pay_msg,
                        image: '../../image/icon_error.png',
                        duration: 3000

                    })
                }
            }
        })

    },

    onPullDownRefresh: function() {
        //console.log('--------下拉刷新-------')
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.onShow()
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
    },

    // 判断卡票或者单程票
    onShow: function(options) {
        var that = this
        app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
        if (app.globalData.userid) {
            wx.request({
                url: app.globalData.rootUrl + "visitor/orderList",
                data: {
                    "id": app.globalData.userid,
                    "appname": app.globalData.appname,
                    "device": app.globalData.device

                },
                header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                success: function(res) {
                    //console.log(app.globalData.userid)
                    console.log('票包res')
                    console.log(res)
                    res = res.data
                    var temp = res.order_list
                    if (temp.length < 1) {
                        wx.showModal({
                            title: '您还没有买票，请扫码购票',
                            content: '',
                            showCancel: false
                        })
                    } else {
                        var tlist = []
                        var tlist1 = []
                        var tlist2 = []
                        for (var i = 0; i < temp.length; i++) {

                            var vtime = temp[i].validtime
                            //   console.log(vtime)
                            temp[i].validtime = vtime.slice(11, 16) + "至" + vtime.slice(30, 35)
                            if (temp[i].type == 0) {
                                temp[i].type = "单项票"
                            } else if (temp[i].type == 1) {
                                temp[i].type = "联程卡"
                            } else if (temp[i].type == 2) {
                                temp[i].type = "次卡"
                            } else if (temp[i].type == 3) {
                                temp[i].type = "期限卡"
                            }
                            if (temp[i].end_date == 0) {
                                temp[i].end_date = "长期有效"
                            } else if (temp[i].end_date == null) {
                                temp[i].end_date = "长期有效"
                            }
                            // console.log(temp[i].end_date)
                            if (temp[i].status == 0) {
                                temp[i].status = "未使用"
                                tlist.push(temp[i])
                            } else if (temp[i].status == 1) {
                                temp[i].status = "已使用"
                                tlist2.push(temp[i])
                            } else if (temp[i].status == 2) {
                                temp[i].status = "使用中"
                                tlist1.push(temp[i])
                            }
                        }

                        that.data.history0 = tlist.reverse() //未使用的门票
                        // console.log(that.data.history0)

                        that.data.history1 = tlist1.reverse() //使用中的门票
                        // console.log(that.data.history1)


                        that.data.history2 = tlist2.reverse() //已使用的门票
                        app.globalData.history = that.data.history2
                        // console.log(that.data.history2)
                        that.setData({
                            history0: tlist,
                            history2: tlist2,
                            history1: tlist1
                        })
                        if ((tlist.length < 1) && (tlist1.length < 1) && (tlist2.length < 1)) {
                            that.setData({
                                empty: true
                            })
                        }
                        if ((tlist.length > 0) || (tlist1.length > 0) || (tlist2.length > 0)) {
                            that.setData({
                                empty: false
                            })
                        }
                    }
                }
            })
        }
    }
})
