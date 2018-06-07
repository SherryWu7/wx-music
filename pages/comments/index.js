// pages/comments/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    hotComments: [],
    totalCount: 0,
    filter: {
      id: 0,
      pageNumber: 1,
      offset: 0,  // 类似于pageNumber
      limit: 20,  // 类似于pageSize
    },
    detail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { filter } = this.data;
    filter.id = options.id;
    this.setData({ filter }, () => {
      this.getComments();
    });

    wx.getStorage({  // 获取缓存歌单详情信息
      key: 'songlistDetail',
      success: (res) => {
        this.setData({ detail: res.data });
        console.log(res)
      },
    })



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // wx.createSelectorQuery().select('#commentsHot').boundingClientRect((rect) => {
    //   console.log(rect)
    // }).exec()
  },

  onReachBottom: function () {  // 上拉加载更多
    let { filter } = this.data;
    filter.pageNumber++;
    filter.offset = (filter.pageNumber - 1) * filter.limit;
    this.setData({ filter }, () => {
      this.getComments();
    });
  },

  onPageScroll: function (number) {
    wx.createSelectorQuery().select('#commentsHot').boundingClientRect((rect) => {
      if (!this.data.titleFixed && rect.top < 0) {
        // console.log(rect.top)
        // this.setData({ titleFixed: true });
      }
    }).exec();
  },

  /**
   * 获取评论
   */
  getComments: function () {
    let { filter, comments, hotComments } = this.data;
    wx.request({
      url: 'http://172.16.110.32:3000/comment/playlist',
      data: {
        id: filter.id,
        offset: filter.offset,
        limit: filter.limit,
      },
      success: (res) => {
        if (res.data.code === 200) {
          const list = res.data.comments || [];
          wx.setNavigationBarTitle({
            title: `评论(${res.data.total})`,
          })
          if (res.data.hotComments) {
            hotComments = res.data.hotComments;
          }
          this.setData({
            filter,
            hotComments,
            comments: [...comments, ...list],
            totalCount: res.data.total
          })
        }
      }
    })
  }
})