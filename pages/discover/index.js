// pages/discover/index.js
const api = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    curNavIndex: 0,
    navList: [{
        id: 1,
        name: '个性推荐',
        loading: true
      },
      {
        id: 2,
        name: '主播电台',
        loading: true
      },
    ],
    banners: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    recommendList: [{
        id: 1,
        name: '私人FM',
        icon: '../../assets/img/cm4_disc_topbtn_fm@2x.png',
        url: '',
      },
      {
        id: 2,
        name: '每日推荐',
        icon: '../../assets/img/cm4_disc_topbtn_daily@2x.png',
        url: '/pages/songlist/index',
      },
      {
        id: 3,
        name: '歌单',
        icon: '../../assets/img/cm4_disc_topbtn_list@2x.png',
        url: '/pages/songlist/index',
      },
      {
        id: 4,
        name: '排行榜',
        icon: '../../assets/img/cm4_disc_topbtn_rank@2x.png',
        url: '',
      },
    ],
    today: (new Date()).getDate(), // 今天几号
    recommend: [], // 个性推荐下的【推荐歌单】【最新音乐】【主播电台】

    remdDJList: [], // 推荐电台
    categories: [], // 分类
  },

  getRecommendDJ: function() {
    wx.request({
      url: api + '/dj/recommend',
      data: {
        limit: 6
      },
      success: (res) => {
        if (res.data.code === 200) {
          let list = res.data.djRadios;
          this.setData({
            remdDJList: list.slice(0, 6)
          });
        }
      }
    })
  },

  getCategories: function() {
    wx.request({
      url: api + '/dj/catelist',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            categories: res.data.categories
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.init();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 首次进入页面，获取个性推荐下的所有数据
   */
  init: function() {
    let {
      navList
    } = this.data;
    // 获取【banner】
    wx.request({
      url: api + '/banner',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            banners: res.data.banners
          })
        }
      }
    });
    // 获取【推荐歌单】【最新音乐】【主播电台】
    const remdSong = new Promise((resolve, reject) => {
      wx.request({
        url: api + '/personalized',
        data: {
          limit: 6
        },
        success: (res) => {
          if (res.data.code === 200) {
            const list = JSON.parse(JSON.stringify(res.data.result).replace(/picUrl":/g, 'coverImgUrl":'));
            resolve(list);
            return;
          }
          resolve([]);
        }
      });
    });

    const newSong = new Promise((resolve, reject) => {
      wx.request({
        url: api + '/personalized/newsong',
        data: {
          limit: 6
        },
        success: (res) => {
          if (res.data.code === 200) {
            const list = JSON.parse(JSON.stringify(res.data.result).replace(/picUrl":/g, 'coverImgUrl":'));
            resolve(list);
            return;
          }
          resolve([]);
        }
      });
    });

    const dj = new Promise((resolve, reject) => {
      wx.request({
        url: api + '/personalized/djprogram',
        data: {
          limit: 6
        },
        success: (res) => {
          if (res.data.code === 200) {
            const list = JSON.parse(JSON.stringify(res.data.result).replace(/picUrl":/g, 'coverImgUrl":'));
            resolve(list);
            return;
          }
          resolve([]);
        }
      });
    });

    Promise.all([remdSong, newSong, dj])
      .then(result => {
        navList[0].loading = false;
        this.setData({
          navList,
          recommend: result
        });
      })
      .catch(e => console.log(e));
  },
  /**
   * 获取主播电台下的所有数据
   */
  djInit: function() {
    let {
      navList
    } = this.data;
    const dj = new Promise((resolve, reject) => {
        wx.request({
          url: api + '/dj/recommend',
          data: {
            limit: 6
          },
          success: (res) => {
            if (res.data.code === 200) {
              let list = res.data.djRadios;
              resolve(list.slice(0, 6));
              return;
            }
            resolve([]);
          }
        })
      })
      .then(result => {
        navList[1].loading = false;
        this.setData({
          navList,
          remdDJList: result
        });
      });

    // Promise.all([dj])
    // .then(result => {
    //   navList[1].loading = false;
    //   this.setData({ navList, remdDJList: result[0] });
    // });
  },
  menuChange: function(e) {
    const index = parseInt(e.detail.index);
    this.setData({
      curNavIndex: index
    });
    if (index === 1 && this.data.navList[1].loading) {
      this.djInit();
    }
  },
})