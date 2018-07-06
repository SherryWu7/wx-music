module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},
  attached: function () { },
  methods: {
    onfocus: function (e) {
      let detail = e.detail, myEventOption = {};
      this.triggerEvent('focus', detail, myEventOption)
    },
    onblur: function (e) {
      let detail = e.detail, myEventOption = {};
      this.triggerEvent('blur', detail, myEventOption)
    },
    oninput: function (e) {
      console.log(e)
      let detail = e.detail, myEventOption = {};
      this.triggerEvent('input', detail, myEventOption)
    },
    onconfirm: function (e) {
      let detail = e.detail, myEventOption = {};
      this.triggerEvent('confirm', detail, myEventOption)
    },
    onclear: function () {
      const e = {
        detail: {
          value: ''
        }
      }
      this.oninput(e)
    }
  }
})