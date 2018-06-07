// pages/songList/index.js
const api = require('../../utils/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    songList: [],  // 歌单列表
    catlist: [],  // 歌单分类
    highqualityTop: {},  // 精品歌单推荐no.1
    filter: {
      pageNumber: 1,
      offset: 0,  // 类似于pageNumber
      limit: 20,  // 类似于pageSize
      order: 'hot',
      cat: '全部歌单'
    },
    selectedSongListName: '全部歌单',
    catObject: {
      categories: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSongList();
    this.getCatlist();
    this.getHighquality();
  },
  onReady: function () {
    this.drawer = this.selectComponent('#drawer');
  },
  onReachBottom: function () {  // 上拉加载更多
    this.getSongList();
  },
  getSongList: function () {
    let { filter, songList } = this.data;
    wx.request({
      url: api + '/top/playlist',
      data: {
        offset: filter.offset,
        limit: filter.limit,
        order: filter.order,
        cat: filter.cat
      },
      success: (res) => {
        if (res.data.code === 200) {
          filter.pageNumber++;
          filter.offset = (filter.pageNumber - 1) * filter.limit;
          const list = res.data.playlists || [];
          this.setData({
            songList: [...songList, ...list],
            filter
          });
        }
      }
    });
  },
  getCatlist: function () {  // 歌单分类
    wx.request({
      url: api + '/playlist/catlist',
      success: (res) => {
        if (res.data.code === 200) {
          let catObject = this.data.catObject
          let categories = [];
          for (let key in res.data.categories) {
            let subList = [];
            for (const item of res.data.sub) {
              if (item.category === parseInt(key)) {
                subList.push(item);
              }
            }
            categories.push({
              id: parseInt(key),
              name: res.data.categories[key],
              subList
            });
          }
          catObject = {
            ...catObject,
            ...res.data,
            categories
          }
          this.setData({ catObject });
          console.log(catObject)
        }
      }
    })
  },
  getHighquality: function () {  // 获取最新一条精品歌单
    wx.request({
      url: api + '/top/playlist/highquality',
      data: {
        limit: 1
      },
      success: (res) => {
        if (res.data.code === 200) {
          console.log(res.data)
          this.setData({ highqualityTop: res.data.playlists[0] })
        }
      }
    })
  },
  selectClassify: function () {  // 选择分类
    this.drawer.showDrawer();
  },
  selectedCat: function (event) {
    const catName = event.currentTarget.dataset.name;
    let filter = this.data.filter;
    if (catName !== filter.cat) {
      filter.cat = catName;
      this.setData({ filter, songList: [] }, () => {
        this.getSongList();
        this.drawer.hideDrawer();
      });
    } else {
      this.drawer.hideDrawer();
    }
  },
  _cancelDrawer: function () {
    console.log('你点击了取消');
    this.drawer.hideDrawer();
  },
  _confirmDrawer: function () {
    console.log('你点击了确定');
    this.drawer.hideDrawer();
  },

})