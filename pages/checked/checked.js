var app = getApp()

function checkdate(t) {
    return parseInt(t) < 10 ? '0' + t : t
}

function countdown(that) {
    var second = that.data.second
    if (second == 0) {
        that.setData({
            codeButtText: "点击关闭",
            disabledGetCode: false
        })
        return
    }
    var time = setTimeout(function() {
        that.setData({
            second: second - 1,
            codeButtText: "验票完成，请尽快入场(" + second + ")"
        })
        countdown(that)
    }, 1000)
}

Page({
    data: {
        phone: "",
        time: "",
        date: "",
        day: "",
        tickets: [],
        totalmoney: 0,
        buydate: "",
        parkname: "",
        channelname: "",
        validtime: "",
        second: 60,
        disabledGetCode: true
    },

    goback: function() {
        wx.redirectTo({
            url: '../zhuye2/zhuye2',
            success: function() {}
        })
    },



    onLoad: function() {
        var that = this

        //console.log(that.data.second)
        countdown(that)
        var d = new Date()
        var date_now = d.getFullYear() + "-" + checkdate(d.getMonth() + 1) + "-" + checkdate(d.getDate())
        console.log(date_now)
        var hour = d.getHours()
        var minute = d.getMinutes()
        var time_now = checkdate(hour) + ":" + checkdate(minute)
        // console.log(time_now)



        var week = ['日', '一', '二', '三', '四', '五', '六'];
        var day_now = "星期" + week[d.getDay()]
        //console.log(day_now)
        var phone = wx.getStorageSync(app.globalData.storage_Phone)

        that.setData({
            date: date_now,
            time: time_now,
            day: day_now,
            phone: phone,
            tickets: app.globalData.tickets,
            parkname: app.globalData.scene,
            channelname: app.globalData.channel,
            buydate: app.globalData.buydate,
            totalmoney: app.globalData.money
        })
        // console.log(that.data.channelname)
        // console.log(that.data.tickets)

        //请求打印当前订单
        wx.request({
            url: app.globalData.rootUrl + "/order/checkin_print",
            data: {
                'order_id': app.globalData.orderid,
                "device": app.globalData.device,
                "appname": app.globalData.appname
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            success: function(res) {
                // console.log(res)
                if (res.data.result < 0) {
                    throw new Error(res.data.msg)
                }
            }
        })
    },
    
    onShow: function() {

    }
})
