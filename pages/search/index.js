// pages/search/index.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
let timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotList: [],
    historyList: [],
    recomList: [],
    searchValue: '',
    searchType: [{
        id: 1,
        name: '单曲',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 1014,
        name: '视频',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 100,
        name: '歌手',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 10,
        name: '专辑',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 1000,
        name: '歌单',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 1009,
        name: '主播电台',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 1002,
        name: '用户',
        totalCount: 0,
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      }
    ],
    curTypeIndex: 0,
    resultList: [],
    loading: false,
    isShowResult: false,  // 是否展示搜索结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.request({
      url: api + '/search/hot',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            hotList: res.data.result.hots
          });
        }
      }
    })
    this.getSearchHistory();
  },

  onReachBottom: function() { // 上拉加载更多
    let {
      searchType,
      curTypeIndex
    } = this.data;
    let current = searchType[curTypeIndex];
    if (current.lastPage) {
      return;
    }
    current.filter.pageNumber++;
    current.filter.offset = (current.filter.pageNumber - 1) * current.filter.limit;
    this.setData({
      searchType
    }, () => {
      this.search();
    });
  },

  search: function(value) { // 搜索【单曲，mv....】
    let {
      searchType,
      resultList,
      curTypeIndex,
    } = this.data;
    let current = searchType[curTypeIndex];
    if (value && value !== this.data.searchValue) { // 两次搜索不是同一个关键词，清空result
      current.result = [];
    }
    this.setData({
      loading: true
    });
    let searchValue = value || this.data.searchValue;
    wx.request({
      url: api + '/search',
      data: {
        offset: current.filter.offset,
        limit: current.filter.limit,
        keywords: searchValue,
        type: current.id,
      },
      complete: (res) => {
        this.setData({
          loading: false
        });
        this.setSearchHistory(searchValue);
        if (res.data && res.data.code === 200) {
          let result = current.result, list;

          if (current.id === 1) {  // 单曲
            list = res.data.result.songs;
          } else if (current.id === 1014) {  // mv
            list = res.data.result.videos;
          } else if (current.id === 100) {  // 歌手
            list = res.data.result.artists;
          } else if (current.id === 10) {  // 专辑
            list = res.data.result.albums;
          } else if (current.id === 1000) {  // 歌单
            list = res.data.result.playlists;
          } else if (current.id === 1009) {  // 主播电台
            list = res.data.result.djRadios;
          } else if (current.id === 1002) {  // 用户
            list = res.data.result.userprofiles;
          }

          if (list) {
            result = [...current.result, ...list];
            current.result = result;
          } else { // 最后一页
            current.lastPage = true;
          }
          searchType[curTypeIndex] = current;
          this.setData({
            searchValue,
            searchType,
            isShowResult: true
          });
        }
      }
    });
  },

  searchKeyword: function(value) { // 搜索建议【根据输入返回相应关键词】
    wx.request({
      url: api + '/search/suggest/keyword',
      data: {
        keywords: value,
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            searchValue: value,
            recomList: res.data.result.allMatch
          });
        }
      }
    })
  },

  inputValueChange: function(e) { // 搜索框值改变
    const value = e.detail.value;
    this.setData({
      searchValue: value
    });
    clearTimeout(timer);
    timer = setTimeout(() => {
      this.searchKeyword(value);
    }, 500);
  },
  inputFocus: function(e) { // 搜索框聚焦
    const value = e.detail.value;
    if (this.data.isShowResult) {
      this.setData({
        isShowResult: false
      }, () => {
        this.searchKeyword(value)
      });
    }
  },
  inputBlur: function(e) {
  },
  searchValueChange: function(e) {
    this.search(e.currentTarget.dataset.name)
  },
  searchTypeChange: function(e) {
    this.setData({
      curTypeIndex: parseInt(e.currentTarget.dataset.index)
    }, () => {
      this.search();
    });
  },
  setSearchHistory: function(value) { // 存储搜索记录
    let keyWord = value || this.data.searchValue;
    wx.getStorage({
      key: 'search_history',
      complete: (res) => {
        let list = (res.data || []).filter(e => e != keyWord);
        list.unshift(keyWord);
        wx.setStorage({
          key: 'search_history',
          data: list,
        })
      },
    })
  },
  getSearchHistory: function() { // 获取搜索记录
    wx.getStorage({
      key: 'search_history',
      complete: (res) => {
        const list = (res.data || []);
        this.setData({
          historyList: list
        })
      },
    })
  },
  delHistory: function(e) {
    const value = e.currentTarget.dataset.name;
    let list = this.data.historyList.filter(e => e != value);
    this.setData({
      historyList: list
    });
    wx.setStorage({
      key: 'search_history',
      data: list,
    });
  },
})