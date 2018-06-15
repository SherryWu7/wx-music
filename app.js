const audio = require('utils/backgroundAudio.js');
const util = require('utils/util.js');
const WxNotificationCenter = require('utils/WxNotificationCenter.js')

App({
  onLaunch: function () {

  },
  // 更新歌曲信息
  updateNewAudio: function (that) {
    if (that.data.music.id === this.globalData.curPlaying.id) {
      return;
    }
    audio.getComments({
      id: this.globalData.curPlaying.id,
      offset: 0,
      limit: 0,
    }, data => {
      that.setData({
        totalCountComments: data.total,
      })
    });

    that.setData({
      music: this.globalData.curPlaying,
      duration: util.formatTime(this.globalData.curPlaying.dt),
      sliderMax: Math.floor(this.globalData.curPlaying.dt),
    });

    wx.setNavigationBarTitle({
      title: `${this.globalData.curPlaying.name}-${this.globalData.curPlaying.ar[0].name}`,
    })
  },
  // 背景音频播放
  playAudio: function (that) {
    const { curPlaying, backgroundAudioManager } = this.globalData;
    backgroundAudioManager.title = curPlaying.name;
    // backgroundAudioManager.desc = "描述";
    backgroundAudioManager.singer = curPlaying.ar[0].name;
    backgroundAudioManager.coverImgUrl = curPlaying.al.picUrl;
    backgroundAudioManager.src = curPlaying.url;
    // 背景音频进入可以播放状态，但不保证后面可以流畅播放
    backgroundAudioManager.onCanplay(() => {
      backgroundAudioManager.play();
    })
    // 背景音频播放事件
    backgroundAudioManager.onPlay(() => {
      this.globalData.playing = true;
      that.setData({ playing: true });
      WxNotificationCenter.postNotificationName('music', {
        playing: true,
        list_song: this.globalData.list_song
      });
    });
    // 背景音频暂停事件
    backgroundAudioManager.onPause(() => {
      this.globalData.playing = false;
      that.setData({ playing: false });
      WxNotificationCenter.postNotificationName('music', {
        playing: false,
        list_song: this.globalData.list_song
      });
    });
    // 背景音频停止事件
    backgroundAudioManager.onStop(() => {
      this.globalData.playing = false;
      that.setData({ playing: false });
    });
    // 背景音频自然播放结束事件
    backgroundAudioManager.onEnded(() => {
      const { playMode, curPlaying } = this.globalData;
      this.globalData.playing = false;
      that.setData({ playing: false });
      if (playMode === 2) {  // 单曲循环【重新开始播放】
        this.seekAudio(0, that, () => {
          this.playAudio(that);
        });
      } else {
        this.nextAudio(1, that);
      }
    });
    // 用户在系统音乐播放面板点击下一曲事件（iOS only）
    backgroundAudioManager.onPrev(() => {
      this.globalData.playing = false;
      that.setData({ playing: false });
      this.nextAudio(-1, that);
    });
    // 用户在系统音乐播放面板点击下一曲事件（iOS only）
    backgroundAudioManager.onNext(() => {
      this.globalData.playing = false;
      that.setData({ playing: false });
      this.nextAudio(1, that);
    });
    // 背景音频播放错误事件【自动播放下一首】
    backgroundAudioManager.onError((err) => this.nextAudio(1, that));
    // 背景音频播放进度更新事件
    // backgroundAudioManager.onTimeUpdate(() => {
    //   // console.log(backgroundAudioManager.currentTime)
    //   that.setData({
    //     sliderValue: Math.floor(backgroundAudioManager.currentTime * 1000),
    //     currentTime: util.formatTime(Math.floor(backgroundAudioManager.currentTime * 1000)),
    //   });
    // });
    // 音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
    backgroundAudioManager.onWaiting(() => {

    });
  },
  // 切换播放音频
  nextAudio: function (value, that) {  // 用户在系统音乐播放面板点击下一曲事件（iOS only）
    // 歌曲切换，停止当前音乐
    // this.globalData.backgroundAudioManager.stop()
    const { playMode, list_song, curPlaying } = this.globalData;
    let playIndex = 0;
    if (playMode === 3) {  // 随机
      playIndex = Math.floor(Math.random() * list_song.length);
    } else {
      for (let [index, item] of list_song.entries()) {
        if (item.id === curPlaying.id) {
          playIndex = index;
        }
      }
      playIndex += value;
      if (playIndex >= list_song.length - 1) {
        playIndex = 0;
      } else if (playIndex < 0) {
        playIndex = list_song.length - 1;
      }
    }
    this.globalData.curPlaying = list_song[playIndex];
    this.globalData.index_song = playIndex;

    audio.getMusicUrl(this.globalData.curPlaying.id, (url) => {
      this.globalData.curPlaying.url = url;
      this.updateNewAudio(that);
      this.playAudio(that);
    }, () => this.nextAudio(1, that))
  },
  // 跳转到音频指定位置
  seekAudio: function (position, that, cb) {
    const { curPlaying, backgroundAudioManager } = this.globalData;
    // seek在暂停状态下无法改变currentTime，需要先play后pause
    const pauseStatus= this.globalData.backgroundAudioManager.paused;  // 是否处于暂停状态
    if (pauseStatus) {
      backgroundAudioManager.play();
    }
    wx.seekBackgroundAudio({
      position: Math.floor(position / 1000),  // 单位秒【此处的position是毫秒】
      success: () => {
        that.setData({
          currentTime: util.formatTime(position),
          sliderValue: position,
        });
        // 如果跳转前是暂停的，成功后设置成暂停
        if (pauseStatus) {
          backgroundAudioManager.pause();
        }
        cb && cb();
      }
    });
  },

  globalData: {
    list_song: [],  // 歌曲播放列表
    index_song: 0,  // 当前播放歌曲在播放列表中的index
    curPlaying: {},  // 当前播放歌曲
    playMode: 1,  // 播放类型 【1 列表循环  2 单曲循环  3 随机播放】
    playing: false,  // 是否正在播放
    backgroundAudioManager: wx.getBackgroundAudioManager(),
  }
})