//pay.js
//获取应用实例
var sha1 = require('../../utils/sha1.js')
var md5 = require('../../utils/md5.js')
var app = getApp()
Page({
    data: {
        myTickets: [], //购物车门票
        totalNum: 0, //总张数
        totalPrice: 0, //总价
        discount: 0, //折扣
        payPrice: 0, //支付价
        userid: "" ,//用户id
        disabledGetCode: false,
        payText: '付款',
    },

    onLoad: function() {
        var that = this
        that.data.myTickets = wx.getStorageSync(app.globalData.storage_MyTicket)
        app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
        // console.log('userid')
        // console.log(app.globalData.userid)
        for (var i = 0; i < that.data.myTickets.length; i++) {
            that.data.totalNum += that.data.myTickets[i].number
            var price = that.data.myTickets[i].price
            that.data.totalPrice += that.data.myTickets[i].number * price
            that.data.totalPrice = that.data.totalPrice
        }

        var pay = parseFloat(that.data.totalPrice).toFixed(2)
        var discount = that.data.discount
        if (pay > discount) {
            that.data.payPrice = parseFloat(pay - discount).toFixed(2)
        } else {
            that.data.payPrice = pay
        }

        that.setData({
            itemName: that.data.myTickets[0].channel_name, //当前门票游玩的项目名称
            myPhone: app.globalData.phone, //手机号码
            myTickets: that.data.myTickets,
            totalPrice: that.data.totalPrice,
            payPrice: that.data.payPrice
        })

    },


    tradeinfo_pay: function(orderId) {
        var that = this
        var d = new Date()
        var nowDate = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
        console.log(app.globalData.userid)
        console.log(orderId)
        wx.request({
            url: app.globalData.rootUrl + 'scene/order_pay', //获取预支付订单信息
            data: {
                "visitor_id": app.globalData.userid,
                "order_id": orderId,
                "appname": app.globalData.appname,
                "device": app.globalData.device
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            success: function(res) {

                console.log("tradeinfo_pay success:以下是返回值")
                // console.log("res:")
                console.log(res)
                if (res.data.result < 1) {
                    wx.showModal({
                        title: '支付失败',
                        content: res.data.msg,
                        showCancel: false
                    })

                    // throw new Error(res.data.msg)
                    // 服务端申请支付失败
                    // console.log("res return fail info:")
                    // console.log(res.data)

                } else if (res.data.result == 1) {

                    var payInfo = res.data.wx_result
                    payInfo = JSON.parse(payInfo)

                    if (payInfo.result_code == "SUCCESS" && payInfo.return_code == "SUCCESS") {
                        // 点击付款之后变为正在支付且不可点击
                        that.setData({
                            payText: '正在支付',
                            disabledGetCode: true,
                        })

                        var ttt = Date.now().toString()
                        // console.log(ttt)
                        var pkg = 'prepay_id=' + payInfo.prepay_id
                        // console.log(pkg)
                        var appid = payInfo.appid
                        var nonce = payInfo.nonce_str
                        // console.log(nonce)
                        var str = "appId=" + appid + "&nonceStr=" + nonce + "&package=" + pkg + "&signType=MD5&timeStamp=" + ttt + "&key=WWWilandcc20170415qazVFRwsx321PL"
                        var sign = (md5.hexMD5(str)).toUpperCase()
                        // console.log("***********客户端开始支付： " + str)
                        //发起微信支付请求
                        wx.requestPayment({
                            "timeStamp": ttt,
                            "nonceStr": nonce,
                            "package": pkg,
                            "signType": "MD5",
                            "paySign": sign,
                            //发起微信支付成功
                            success: function(res) {
                                // console.log("****** requestPayment success: ")
                                console.log(res)
                                //向服务器发送支付结果
                                wx.request({
                                    url: app.globalData.rootUrl + "scene/order_pay_result",
                                    data: {
                                        "order_id": orderId,
                                        "money": that.data.payPrice,
                                        "result_status": res.errMsg,
                                        "result_msg": res.errMsg,
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
                                        //获取预下单信息成功
                                        //console.log("订单结束")
                                        //console.log(res)
                                        wx.redirectTo({
                                            url: '../confirm/confirm'
                                        })
                                    },
                                    fail: function(res) {
                                        wx.showToast({
                                            title: "支付失败，请重试",
                                            duration: 2000
                                        })
                                        that.setData({
                                            payText: '付款',
                                            disabledGetCode: false,
                                        })
                                    }
                                })
                            },

                            //发起微信支付失败
                            fail: function(res) {
                                //console.log("******* requestPayment fail: ")
                                console.log(res)
                                wx.showModal({
                                    title: '支付失败',
                                    content: '',
                                    showCancel: false
                                })
                                that.setData({
                                    payText: '付款',
                                    disabledGetCode: false,
                                })
                                //向服务器发送支付结果
                                wx.request({
                                    url: app.globalData.rootUrl + "scene/order_pay_result",
                                    data: {
                                        "order_id": orderId,
                                        "money": that.data.payPrice,
                                        "result_status": res.errMsg,
                                        "result_msg": res.errMsg,
                                        "appname": app.globalData.appname,
                                        "device": app.globalData.device
                                    },
                                    header: {
                                        "Content-Type": "application/x-www-form-urlencoded"
                                    },
                                    method: "POST",
                                    success: function(res) {
                                        if (res.data.result != 1) {
                                            console.log(res.data.msg)
                                            //throw new Error(res.data.msg)
                                        }
                                    },
                                    fail: function(res) {
                                        console.log(res)
                                        wx.showToast({
                                            title: res.data.msg
                                        })
                                    }
                                })
                                if ("requestPayment:fail cancel" != res.errMsg) {
                                    wx.showModal({
                                        title: '支付失败，请稍后再试！',
                                        content: '',
                                        showCancel: false
                                    })
                                    wx.showToast({
                                        title: '支付失败，请稍后再试！',
                                        duration: 3000
                                    })
                                }
                            },

                            complete: function() {}

                        }) // payrequest end
                    } else {
                        wx.showModal({
                            title: payInfo.return_code,
                            content: payInfo.return_msg,
                            showCancel: false
                        })
                        throw new Error(payInfo.return_msg)
                    }
                }
            }
        })
    },

    tradeinfo_order: function() {
        var that = this
        var length = that.data.myTickets.length
        if (that.data.myTickets.length > 0) {
            var ticketlist = '[{' + '"ticket_id":' + that.data.myTickets[0].id + ',"num":' + that.data.myTickets[0].number + ',"money":' + that.data.myTickets[0].price + '}'
            for (var i = 1; i < that.data.myTickets.length; i++) {
                var t1 = ',{"ticket_id":' + that.data.myTickets[i].id + ',"num":' + that.data.myTickets[i].number + ',"money":' + that.data.myTickets[i].price + '}'
                ticketlist += t1
                //  tick.ticket_id = that.data.myTickets[i].id
                //tick.num = that.data.myTickets[i].number
                // tick.money = that.data.myTickets[i].price
                // JSON.stringify(tick)
            }
            ticketlist = ticketlist + ']'
            console.log(ticketlist)
            wx.request({
                url: app.globalData.rootUrl + 'scene/confirm_order', //1.5游客确认门票订单信息(订单生成)
                data: {
                    "visitor_id": app.globalData.userid,
                    "channel_id": app.globalData.channel_id,
                    "flag": app.globalData.flag,
                    "scene_id": app.globalData.scene_id,
                    "origin_money": that.data.totalPrice,
                    "pay_money": that.data.payPrice, //float(如100.20) 订单总价，这里是打折或各种活动后的实际支付金额
                    "tickets_bought": ticketlist,
                    "appname": app.globalData.appname,
                    "device": app.globalData.device
                },
                header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                success: function(res) {

                    var res = res.data
                    if (res.result == -1) {

                        wx.showToast({
                            title: res.msg,
                            duration: 2000
                        })
                        throw new Error(res.msg)
                    } else if (res.result == 1) {
                        var orderId = res.order_id
                        app.globalData.orderid = orderId
                        that.tradeinfo_pay(orderId)
                    } else {
                        wx.showToast({
                            title: '服务器出了点小问题，请稍后再试',
                            duration: 3000
                        })
                    }
                },
                fail: function() {
                    wx.showToast({
                        title: '订单生成失败，请稍后再试',
                        duration: 2000
                    })
                    throw new Error("订单生成失败，请稍后再试")
                },
                complete: function() {
                    // console.log("确认订单生成完成")
                }
            })
        }
    },

    pay: function() {
        var that = this
        var phone = /^1\d{10}$/
        app.globalData.phone = wx.getStorageSync(app.globalData.storage_Phone)
        app.globalData.userid = wx.getStorageSync(app.globalData.storage_userid)
        // console.log(app.globalData.phone)
        if (!phone.test(app.globalData.phone) || !app.globalData.userid) {
            wx.showToast({
                title: '请先登录',
                duration: 2000
            })
            wx.navigateTo({
                url: '../register/register',
                success: function() {}
            })
        }

        wx.checkSession({
            success: function() {
                that.tradeinfo_order()
            },


            fail: function() {
                //登录态过期
                //重新登录
                wx.login({
                    success: function(res) {
                        if (res.code) {
                            //发起网络请求
                            wx.request({
                                url: app.globalData.rootUrl + "visitor/updateOpenIdSessionKey",
                                data: {
                                    "id": app.globalData.userid,
                                    "wx_login_code": res.code,
                                    "device": app.globalData.device,
                                    "wxappid": app.globalData.wxappid,
                                    "wxappsecret": app.globalData.wxappsecret,
                                    "appname": app.globalData.appname
                                },
                                header: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                method: "POST",
                                success: function(res) {
                                    // console.log(res)
                                },
                                fail: function(res) {
                                    //console.log(res)
                                    throw new Error(res)
                                }
                            })
                        } else {
                            wx.showToast({
                                title: '获取用户登录态失败'
                            })
                            throw new Error("获取用户登录失败")
                        }
                    }
                })
            }
        })

    }
})
