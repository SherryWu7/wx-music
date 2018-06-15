// components/playbar/index.js
const app = getApp();
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    playing: false,
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
  },
  ready: function () {
    WxNotificationCenter.addNotification("music", (res) => {
      this.setData({
        playing: res.playing,
        isShow: res.list_song.length
      });
    }, this)
  },
  moved: function () {
    WxNotificationCenter.removeNotification("music", this);
  },
  detached: function () {
    WxNotificationCenter.removeNotification("music", this);
  }
})
