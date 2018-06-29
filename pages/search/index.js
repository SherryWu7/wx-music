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
    curSearchType: 1,
    searchType: [{
        id: 1,
        name: '单曲',
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      },
      {
        id: 1006,
        name: '视频',
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
        result: [],
        filter: {
          pageNumber: 1,
          offset: 0, // 类似于pageNumber
          limit: 30, // 类似于pageSize
        },
      }
    ],
    resultList: [],
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

  search: function() {
    let {
      searchType,
      resultList,
      searchValue,
      curSearchType
    } = this.data;
    this.setData({
      loading: true
    });
    let current = {},
      curTypeIndex = 0;
    for (let i in searchType) {
      if (searchType[i].id === curSearchType) {
        current = searchType[i];
        curTypeIndex = i;
      }
    }
    wx.request({
      url: api + '/search',
      data: {
        offset: current.filter.offset,
        limit: current.filter.limit,
        keywords: searchValue,
        type: curSearchType,
      },
      success: (res) => {
        this.setData({
          loading: false
        });
        this.setSearchHistory(searchValue);
        if (res.data.code === 200) {
          current.filter.pageNumber++;
          current.filter.offset = (current.filter.pageNumber - 1) * current.filter.limit;
          const list = res.data.result.songs || [];
          const result = [...current.result, ...list];
          current.result = list;
          searchType[curTypeIndex] = current;
          this.setData({
            searchType,
            resultList: result
          });
        }
      }
    })
  },

  searchKeyword: function(value) {
    wx.request({
      url: api + '/search/suggest/keyword',
      data: {
        keywords: value,
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            recomList: res.data.result.allMatch
          });
        }
      }
    })
  },
  valueChange: function(event) {
    const value = event.detail.value;
    this.setData({
      searchValue: value
    });
    clearTimeout(timer); // 清除未执行的代码，重置回初始化状态
    timer = setTimeout(() => {
      this.searchKeyword(value);
    }, 500);
  },
  inputFocus: function(event) {
    const value = event.detail.value;
    if (this.data.resultList.length) {
      this.setData({
        resultList: []
      }, () => {
        this.searchKeyword(value)
      });
    }
  },
  searchValueChange: function(event) {
    const value = event.currentTarget.dataset.name;
    this.setData({
      searchValue: value
    }, () => this.search());
  },
  searchTypeChange: function(event) {
    this.setData({
      curSearchType: parseInt(event.currentTarget.id)
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
  }
})