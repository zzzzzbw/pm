function slideDeleter (el, options) {
  this.$container = el
  this.opt = {
    sliderName: '.slide-delete-slider',
    controlName: '.slide-delete-control',
    fnButtonName: '.slide-delete-fn-btn',
    delButtonName: '.slide-delete-del-btn',
    duration: 200,
    threshold: 80,
    backThreshold: 40,
    range: 140,
    fn: function () {},
    delete: function () {}
  }
  for (let key in options) {
    this.opt[key] = options[key]
  }
  this.init()
}

slideDeleter.prototype = {

  init () {
    this.resetPoz()
    this.$slider = this.$container.querySelector(this.opt.sliderName)
    this.$control = this.$container.querySelector(this.opt.controlName)
    this.$fnBtn = this.$control.querySelector(this.opt.fnButtonName)
    this.$delBtn = this.$control.querySelector(this.opt.delButtonName)
    this.$container.style.height = this.$slider.offsetHeight + 'px'
    this.$slider.style.cssText = 'position: absolute; left: 0; top: 0'
    this.$fnBtn.addEventListener('click', ev => {
      this.opt.fn(this.$fnBtn, this.$container)
      this.markTimer && clearTimeout(this.markTimer)
      this.markTimer = setTimeout(() => {
        this.resetSliderAnimate(0, () => {
          let sliderStyle = this.$slider.style
          sliderStyle.transition = sliderStyle['-webkit-transition'] = 'none'
          clearTimeout(this.markTimer)
        })
        this.resetPoz()
      }, 200)
      ev.stopPropagation()
    }, false)
    this.$delBtn.addEventListener('click', () => {
      this.opt.delete()
      this.destroy()
    }, false)
    this.bindEvent()
  },

  resetPoz () {
    this.startPoz = [0, 0]
    this.movePoz = [0, 0]
    this.endPoz = [0, 0]
    this.distancePoz = [0, 0]
  },

  bindEvent () {
    this.$slider.addEventListener('touchstart', e => {
      this.markTimer && clearTimeout(this.markTimer)
      this.startPoz[0] = e.changedTouches[0].pageX
      this.startPoz[1] = e.changedTouches[0].pageY
    }, false)

    this.$slider.addEventListener('touchmove', e => {
      this.movePoz[0] = e.changedTouches[0].pageX
      this.movePoz[1] = e.changedTouches[0].pageY
      let minPoz = this.opt.range * -1
      let distancePozX = this.distancePoz[0] = this.movePoz[0] - this.startPoz[0]
      let distancePozY = this.distancePoz[1] = this.movePoz[1] - this.startPoz[1]
      if (Math.abs(distancePozY) > Math.abs(distancePozX)) {
        return
      }
      if (!this.isActive && distancePozX < 0) {
        if (distancePozX < minPoz) {
          distancePozX = minPoz
        }
        this.setSliderTranslate(distancePozX)
        e.preventDefault()
      } else if (this.isActive && distancePozX > 0) {
        if (distancePozX > this.opt.range) {
          distancePozX = this.opt.range
        }
        this.setSliderTranslate(distancePozX - this.opt.range)
        e.preventDefault()
      }
    }, false)

    this.$slider.addEventListener('touchend', e => {
      this.endPoz[0] = e.changedTouches[0].pageX
      this.endPoz[1] = e.changedTouches[0].pageY
      if (Math.abs(this.distancePoz[1]) > Math.abs(this.distancePoz[0])) {
        this.isActive = false
        this.touchendHandle(0)
      }
      this.touchendHandle(this.distancePoz[0])
    }, false)
  },

  touchendHandle (distanceX) {
    let range
    if (this.isActive) {
      if (distanceX > this.opt.backThreshold) {
        range = 0
        this.isActive = false
      } else {
        range = this.opt.range * -1
        this.isActive = true
      }
    } else {
      if (distanceX < this.opt.threshold * -1) {
        range = this.opt.range * -1
        this.isActive = true
      } else {
        range = 0
        this.isActive = false
      }
    }
    this.resetSliderAnimate(range, () => {
      let sliderStyle = this.$slider.style
      sliderStyle.transition = sliderStyle['-webkit-transition'] = 'none'
    })
    this.resetPoz()
  },

  resetSliderAnimate (distance, cb) {
    let sliderStyle = this.$slider.style
    let transform = `translate3d(${distance}px, 0, 0)`
    let duration = `${this.opt.duration}ms`
    sliderStyle['-webkit-transition'] = `-webkit-transform ${duration}`
    sliderStyle.transition = `transform ${duration}`
    sliderStyle.transform = sliderStyle['-webkit-transform'] = transform
    this.$slider.addEventListener('webkitTransitionEnd', e => {
      cb && cb()
      e.preventDefault()
    }, false)
  },

  setSliderTranslate (move) {
    let sliderStyle = this.$slider.style
    sliderStyle['-webkit-transform'] = sliderStyle.transform = `translate3d(${move}px, 0, 0)`
  },

  destroy () {
    const wrap = this.$container.parentNode
    wrap.removeChild(this.$container)
  }

}