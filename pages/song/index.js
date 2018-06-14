const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

const backgroundAudioManager = wx.getBackgroundAudioManager();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    lyricsList: [],
    songUrl: null,
    totalCountComments: 0,  // 评论总数

    currentTime: 0,
    totalTime: 0,
    sliderValue: 0,
    isMovingSlider: false,  // 手动拖动触发slider更新

    modeList: [
      {
        id: 1,
        name: '列表循环',
        icon: '../../assets/img/cm2_icn_loop@2x.png'
      },
      {
        id: 2,
        name: '单曲循环',
        icon: '../../assets/img/cm2_icn_one@2x.png'
      },
      {
        id: 3,
        name: '随机播放',
        icon: '../../assets/img/cm2_icn_shuffle@2x.png'
      }
    ],
    curModeIndex: 0,  // 循环类型
    playStatus: 0,  // 0: 暂停  1：播放
    playing: false,  // 是否正在播放

    songList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSongDetail(options.id);
    this.getSongLyric(options.id);
    wx.getStorage({  // 获取缓存歌单详情信息
      key: 'play-list',
      success: (res) => {
        this.setData({ songList: res.data });

        wx.getStorage({
          key: 'player-setting',
          success: (res2) => {
            let index = res2.data.index;
            console.log(index)
            this.setData({ detail: res.data[index] }, () => {
              this.getSongUrl();
            });
          },
        })

      },
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawer = this.selectComponent('#drawer');
  },

  getSongDetail: function (id) {
    wx.request({
      url: api + '/song/detail',
      data: {
        ids: id
      },
      success: (res) => {
        console.log(res.data.songs[0])
        if (res.data.code === 200) {
          wx.setNavigationBarTitle({
            title: `${res.data.songs[0].name}-${res.data.songs[0].ar[0].name}`,
          })
          this.setData({ detail: res.data.songs[0] }, () => {
            this.getSongUrl();
            this.getComments(id);
          })
        }
      }
    })
  },

  getSongLyric: function (id) {
    wx.request({
      url: api + '/lyric',
      data: {
        id
      },
      success: (res) => {
        if (res.data.code === 200) {
          let lyric = res.data.lrc.lyric;
          let pattern = /\[\d{2}:\d{2}.\d{2}\]/g;
          let arrLyric = lyric.split('\n');
          let lyricsList = [];
          while (!pattern.test(arrLyric[0])) {
            arrLyric = arrLyric.slice(1);
          }

          for (let data of arrLyric) {
            if (data) {
              let index = data.indexOf(']');
              let time = data.substring(0, index + 1);
              let value = data.substring(index + 1);
              let timeString = time.substring(1, time.length - 2);
              let timeArr = timeString.split(':');
              lyricsList.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
            }
          }
          this.setData({ lyricsList });
          console.log(lyricsList)
        }
      }
    })
  },

  getSongUrl: function () {
    const { detail } = this.data;
    wx.setNavigationBarTitle({
      title: `${detail.name}-${detail.ar[0].name}`,
    })
    wx.request({
      url: api + '/music/url',
      data: {
        id: detail.id
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ songUrl: res.data.data[0].url }, () => {
            // this.play();
          });
        }
      }
    })
  },

  /**
   * 获取歌曲评论总数
   */
  getComments: function (id) {
    wx.request({
      url: api + '/comment/music',
      data: {
        id,
        offset: 0,
        limit: 0,
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            totalCountComments: res.data.total
          })
        }
      }
    })
  },

  sliderChange: function (e) {
    const position = e.detail.value;
    console.log(position)
    this.seekCurrentAudio(position);
  },
  seekCurrentAudio: function (position) {
    const pauseStatusWhenSilde = backgroundAudioManager.paused;
    if (pauseStatusWhenSilde) {
      backgroundAudioManager.play();
    }
    // backgroundAudioManager.seek();
    wx.seekBackgroundAudio({
      position,
      success: () => {
        this.setData({
          currentTime: util.formatTime(position),
          sliderValue: position,
        });
        if (pauseStatusWhenSilde) {
          backgroundAudioManager.pause;
        }
      }
    });

  },
  sliderMoveStart: function () {
    this.setData({
      isMovingSlider: true
    });
  },
  sliderMoveEnd: function () {
    this.setData({
      isMovingSlider: false
    });
  },
  /**
   * 切换播放类型
   */
  modeChange: function () {
    let { curModeIndex, modeList } = this.data;
    curModeIndex++;
    curModeIndex = curModeIndex > (modeList.length - 1) ? 0 : curModeIndex;
    this.setData({ curModeIndex });

    wx.showToast({
      title: modeList[curModeIndex].name,
      // icon: 'none',
      duration: 2000
    });
  },

  /**
   * 播放or暂停
   */

  playStatusChange: function () {
    let { playing } = this.data;
    if (playing) {
      backgroundAudioManager.pause();
      playing = false;
    } else {
      backgroundAudioManager.play();
      playing = true;
    }
    this.setData({ playing });
  },
  /**
   * 上、下一首
   */
  playMusicChange: function (event) {
    const next = parseInt(event.currentTarget.id);
    let { curModeIndex, songList, detail } = this.data;
    let playIndex = 0;
    if (curModeIndex === 2) {  // 随机
      playIndex = Math.floor(Math.random() * songList.length);
    } else {
      for (let [index, item] of songList.entries()) {
        if (item.id === detail.id) {
          playIndex = index;
        }
      }
      playIndex += next;
      if (playIndex >= songList.length - 1) {
        playIndex = 0;
      } else if (playIndex < 0) {
        playIndex = songList.length - 1;
      }
    }

    wx.setStorage({
      key: 'player-setting',
      data: {
        index: playIndex
      },
    });
    this.setData({
      detail: songList[playIndex]
    }, () => {
      this.getSongUrl();
    });
  },


  showSongList: function () {
    this.drawer.showDrawer();
  },

  play: function () {
    const { detail, songUrl, isMovingSlider } = this.data;
    backgroundAudioManager.title = detail.name;
    // backgroundAudioManager.desc = "描述";
    backgroundAudioManager.singer = detail.ar[0].name;
    backgroundAudioManager.coverImgUrl = detail.al.picUrl;
    backgroundAudioManager.src = songUrl;
    // backgroundAudioManager.play();

    backgroundAudioManager.onTimeUpdate(() => {
      if (!isMovingSlider) {
        this.setData({
          sliderValue: Math.floor(backgroundAudioManager.currentTime),
          sliderMax: Math.floor(backgroundAudioManager.duration),
          currentTime: util.formatTime(Math.floor(backgroundAudioManager.currentTime)),
          totalTime: util.formatTime(Math.floor(backgroundAudioManager.duration))
        });
      }
    })

    backgroundAudioManager.onCanplay(() => {  // 默认为暂停状态， 点击播放再播放
      backgroundAudioManager.pause();
    })

    backgroundAudioManager.onPlay(() => {
      this.setData({ playStatus: 1 })
    });

    backgroundAudioManager.onPause(() => {
      this.setData({ playStatus: 0 })
    });

    backgroundAudioManager.onStop(() => {
      this.setData({ playStatus: 0 })
    });

    backgroundAudioManager.onEnded(() => {
      this.setData({ playStatus: 0 })
    });
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