// components/songList/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    animationData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showDrawer(){
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'linear',
        delay: 0
      });
      this.animation = animation;
      animation.translateY(400).step(); 
      this.setData({
        animationData: animation.export(),
        isShow: true
      })
      setTimeout(function () {
        animation.translateY(0).step();
        this.setData({
          animationData: animation.export(),
        })
      }.bind(this), 200);
    },
    hideDrawer() {
      this.animation.translateY(400).step();
      this.setData({
        animationData: this.animation.export(),
      })
      setTimeout(()=>{
        this.setData({ isShow: false });
      }, 200)
    },
    _cancel(){
      this.triggerEvent('cancel');
    },
    _confirm() {
      this.triggerEvent('confirm');
    },
  }
})
