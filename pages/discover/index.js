// pages/discover/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    recommendList: [
      {
        id: 1,
        name: '私人FM',
        icon: '../../images/icon-qn.png',
        url: '',
      },
      {
        id: 2,
        name: '每日推荐',
        icon: '../../images/icon-qn.png',
        url: '',
      },
      {
        id: 3,
        name: '歌单',
        icon: '../../images/icon-qn.png',
        url: '/pages/songList/index',
      },
      {
        id: 4,
        name: '排行榜',
        icon: '../../images/icon-qn.png',
        url: '',
      },
    ],
    recommendSonglist: [],  // 推荐歌单
    newMusicList: [],  // 最新音乐
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: 'http://localhost:3000/banner',
      success: (res) => {
        if(res.data.code === 200) {
          console.log(res.data.banners)
          this.setData({
            banners: res.data.banners
          })
        }

      }
    });
    wx.request({
      url: 'http://localhost:3000/personalized?limit=6',
      success: (res) => {
        if (res.data.code === 200) {
          const list = JSON.parse(JSON.stringify(res.data.result).replace(/picUrl":/g, 'coverImgUrl":'));
          this.setData({
            recommendSonglist: list
          });
        }
      }
    });
    wx.request({
      url: 'http://localhost:3000/personalized/newsong?limit=6',
      success: (res) => {
        if (res.data.code === 200) {
          console.log(res.data)
          this.setData({
            newMusicList: res.data.result
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
})