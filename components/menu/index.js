// components/menu/index.js
const searchBehavior = require('../../utils/search-behavior.js')
Component({
  /**
   * 组件的属性列表
   */
  behaviors: [searchBehavior],
  properties: {
    datasource: { // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      type: Array,
      value: []
    },
    selectedId: null,
    showSearch: { // 是否显示搜索框
      type: Boolean,
      value: false
    },
    hideMenu: { // 是否隐藏menu
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal, changedPath) {
        this._hideMenuChange(newVal, oldVal)
      }
    },
    disabledSearch: { // 搜索框是否disabled
      type: Boolean,
      value: false
    },
    searchValue: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    menuItemStyle: '',
    menusStyle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect: function(e) {
      let dataset = e.currentTarget.dataset;
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('select', dataset, myEventOption)
    },
    _hideMenuChange: function(newVal, oldVal) {
      const {
        showSearch,
      } = this.data;
      let height = 0;
      if (newVal !== oldVal) {
        if (showSearch && !newVal) {
          height = 154;
        } else if (showSearch && newVal) {
          height = 74;
        } else if (!showSearch && !newVal) {
          height = 80;
        }
      }
      this.setData({
        menusStyle: `height: ${height}rpx`,
      })
    }
  },
  ready: function() {
    const {
      datasource,
      showSearch,
    } = this.data;
    let itemWidth = 0;
    if (datasource.length <= 3) {
      itemWidth = 100 / datasource.length;
    }
    this.setData({
      menuItemStyle: itemWidth ? `width: ${itemWidth}%` : '',
    })
  },
})