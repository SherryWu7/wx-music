const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const audio = require('../../utils/backgroundAudio.js');

const backgroundAudioManager = app.globalData.backgroundAudioManager;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    music: {},
    songUrl: null,
    totalCountComments: 0, // 评论总数

    lyricsList: [],
    lyricsUser: {},
    showLyric: false,
    curLrcIndex: 0, // 当前播放的歌词index

    currentTime: '00:00',
    duration: '00:00', // 总时长
    sliderValue: 0,
    sliderMax: 0,
    isMovingSlider: false, // 手动拖动触发slider更新

    share: {},

    modeList: [{
        id: 1,
        name: '列表循环',
        icon: '../../assets/img/cm2_icn_loop@2x.png',
        icon2: '../../assets/img/cm2_playlist_icn_loop@2x.png'
      },
      {
        id: 2,
        name: '单曲循环',
        icon: '../../assets/img/cm2_icn_one@2x.png',
        icon2: '../../assets/img/cm2_playlist_icn_one@2x.png'
      },
      {
        id: 3,
        name: '随机播放',
        icon: '../../assets/img/cm2_icn_shuffle@2x.png',
        icon2: '../../assets/img/cm2_playlist_icn_shuffle@2x.png'
      }
    ],
    playMode: 1, // 循环类型
    playing: false, // 是否正在播放

    curPlayList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getSongLyric(options.id)

    this.setData({
      playing: app.globalData.playing,
      curPlayList: app.globalData.list_song,
      playMode: app.globalData.playMode,

    });
    // 当前歌曲不在播放列表中 (options.id !== app.globalData.curPlaying.id || !app.globalData.curPlaying.url)
    if (!app.globalData.curPlaying.url) {
      this.playMusic(options.id);
    } else {
      this.setData({
        music: app.globalData.curPlaying,
        duration: util.formatTime(app.globalData.curPlaying.dt),
        sliderMax: Math.floor(app.globalData.curPlaying.dt),
      });
      wx.setNavigationBarTitle({
        title: `${app.globalData.curPlaying.name}-${app.globalData.curPlaying.ar[0].name}`,
      });
      audio.getComments({
        id: app.globalData.curPlaying.id,
        offset: 0,
        limit: 0,
      }, data => {
        this.setData({
          totalCountComments: data.total,
        })
      });
    }
  },

  onShow: function() {
    // 背景音频播放进度更新事件
    backgroundAudioManager.onTimeUpdate(() => {
      let curLrcIndex = 0;
      if (this.data.showLyric) {
        for (let i in this.data.lyricsList) {
          const item = this.data.lyricsList[i];
          if (item.lrc_sec <= backgroundAudioManager.currentTime) {
            curLrcIndex = i;
          }
        }
      }
      this.setData({
        curLrcIndex,
        sliderValue: Math.floor(backgroundAudioManager.currentTime * 1000),
        currentTime: util.formatTime(Math.floor(backgroundAudioManager.currentTime * 1000)),
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.drawer = this.selectComponent('#drawer');
  },

  playMusic: function(id) {
    wx.request({
      url: api + '/song/detail',
      data: {
        ids: id
      },
      success: (res) => {
        if (res.data.code === 200) {
          app.globalData.curPlaying = res.data.songs[0]; // 全局设置当前播放歌曲
          if (!app.globalData.list_song.length) {
            app.globalData.list_song.push(res.data.songs[0]);
          }
          this.setData({
            music: res.data.songs[0],
            duration: util.formatTime(app.globalData.curPlaying.dt),
            sliderMax: Math.floor(app.globalData.curPlaying.dt),
          });

          wx.setNavigationBarTitle({
            title: `${app.globalData.curPlaying.name}-${app.globalData.curPlaying.ar[0].name}`,
          });

          audio.getMusicUrl(app.globalData.curPlaying.id, (url) => {
            app.globalData.curPlaying.url = url;
            // this.updateNewAudio(that);
            app.playAudio(this);
          });

          audio.getComments({
            id: app.globalData.curPlaying.id,
            offset: 0,
            limit: 0,
          }, data => {
            this.setData({
              totalCountComments: data.total,
            })
          });

        }
      }
    })
  },

  /**
   * 获取歌词
   */
  getSongLyric: function(id) {
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
              if (value) {
                lyricsList.push({
                  lrc: value,
                  lrc_sec: parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1])
                })
              }
            }
          }
          this.setData({
            lyricsList,
            lyricsUser: res.data.lyricUser
          });
          console.log(lyricsList)
        }
      }
    })
  },

  sliderChange: function(e) {
    const position = e.detail.value;
    app.seekAudio(position, this);
  },
  sliderMoveStart: function() {
    this.setData({
      isMovingSlider: true
    });
  },
  sliderMoveEnd: function() {
    this.setData({
      isMovingSlider: false
    });
  },
  // 切换播放类型
  modeChange: function() {
    let {
      playMode,
      modeList
    } = this.data;
    playMode++;
    playMode = playMode > (modeList.length) ? 1 : playMode;
    app.globalData.playMode = playMode;
    this.setData({
      playMode
    });

    wx.showToast({
      title: modeList[playMode - 1].name,
      // icon: 'none',
      duration: 2000
    });
  },
  //播放or暂停
  playStatusChange: function() {
    let {
      playing
    } = this.data;
    if (playing) {
      backgroundAudioManager.pause();
      playing = false;
    } else {
      backgroundAudioManager.play();
      playing = true;
    }
    app.globalData.playing = playing;
    this.setData({
      playing
    });
  },
  // 上、下一首
  playMusicChange: function(event) {
    const value = parseInt(event.currentTarget.id);
    app.nextAudio(value, this);
  },

  showPlayList: function() {
    this.drawer.showDrawer();
  },

  selectedMusic: function(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    const id = parseInt(event.currentTarget.id);
    let {
      song_list,
      curPlaying,
      backgroundAudioManager
    } = app.globalData;
    if (id !== curPlaying.id) {
      app.globalData.index_song = index;
      this.playMusic(id);
    } else {
      const pauseStatus = backgroundAudioManager.paused; // 是否处于暂停状态
      if (pauseStatus) {
        backgroundAudioManager.play();
      }
    }
    this.drawer.hideDrawer();

  },
  _cancelDrawer: function() {
    this.drawer.hideDrawer();
  },
  _confirmDrawer: function() {
    this.drawer.hideDrawer();
  },
  // 删除单曲
  delMusicByIndex: function(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let {
      list_song,
      index_song
    } = app.globalData;
    list_song.splice(index, 1);
    if (index_song === index) {
      backgroundAudioManager.stop();
    }
    index_song = index_song > index ? index_song - 1 : index_song;
    this.setData({
      curPlayList: list_song
    });
    this.playMusic(list_song[index_song].id);
  },

  /**
   * 清空播放列表，完成后后退
   */
  deleteAll: function() {
    wx.showModal({
      title: '',
      content: '确定要清空播放列表？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.list_song = [];
          app.globalData.index_song = 0;
          app.globalData.curPlaying = {};
          this.setData({
            curPlayList: []
          });
          backgroundAudioManager.stop();
          wx.navigateBack();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  playerChange: function() {
    let showLyric = this.data.showLyric;
    this.setData({
      showLyric: !showLyric
    })
  }
})