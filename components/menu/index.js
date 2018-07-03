// components/menu/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    datasource: {  // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      type: Array,
      value: []
    },
    selectedId: null,
    showSearch: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menuItemStyle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect: function(e) {
      let dataset = e.currentTarget.dataset;
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('select', dataset, myEventOption)
    }
  },

  ready: function () {
    const { datasource } = this.data;
    if(datasource.length <= 3) {
      let width = 100 / datasource.length;
      this.setData({
        menuItemStyle: `width: ${width}%`
      })
    }
  }
})