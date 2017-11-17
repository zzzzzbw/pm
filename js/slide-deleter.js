'use strict';

function slideDeleter(el, options) {
  this.$container = el;
  this.opt = {
    sliderName: '.slide-delete-slider',
    controlName: '.slide-delete-control',
    fnButtonName: '.slide-delete-fn-btn',
    delButtonName: '.slide-delete-del-btn',
    duration: 200,
    threshold: 80,
    backThreshold: 40,
    range: 140,
    fn: function fn() {},
    delete: function _delete() {}
  };
  for (var key in options) {
    this.opt[key] = options[key];
  }
  this.init();
}

slideDeleter.prototype = {
  init: function init() {
    var _this = this;

    this.resetPoz();
    this.$slider = this.$container.querySelector(this.opt.sliderName);
    this.$control = this.$container.querySelector(this.opt.controlName);
    this.$fnBtn = this.$control.querySelector(this.opt.fnButtonName);
    this.$delBtn = this.$control.querySelector(this.opt.delButtonName);
    this.$container.style.height = this.$slider.offsetHeight + 'px';
    this.$slider.style.cssText = 'position: absolute; left: 0; top: 0';
    this.$fnBtn.addEventListener('click', function (ev) {
      _this.opt.fn(_this.$fnBtn, _this.$container);
      _this.markTimer && clearTimeout(_this.markTimer);
      _this.markTimer = setTimeout(function () {
        _this.resetSliderAnimate(0, function () {
          var sliderStyle = _this.$slider.style;
          sliderStyle.transition = sliderStyle['-webkit-transition'] = 'none';
          clearTimeout(_this.markTimer);
        });
        _this.resetPoz();
      }, 200);
      ev.stopPropagation();
    }, false);
    this.$delBtn.addEventListener('click', function () {
      _this.opt.delete();
      _this.destroy();
    }, false);
    this.bindEvent();
  },
  resetPoz: function resetPoz() {
    this.startPoz = [0, 0];
    this.movePoz = [0, 0];
    this.endPoz = [0, 0];
    this.distancePoz = [0, 0];
  },
  bindEvent: function bindEvent() {
    var _this2 = this;

    this.$slider.addEventListener('touchstart', function (e) {
      _this2.markTimer && clearTimeout(_this2.markTimer);
      _this2.startPoz[0] = e.changedTouches[0].pageX;
      _this2.startPoz[1] = e.changedTouches[0].pageY;
    }, false);

    this.$slider.addEventListener('touchmove', function (e) {
      _this2.movePoz[0] = e.changedTouches[0].pageX;
      _this2.movePoz[1] = e.changedTouches[0].pageY;
      var minPoz = _this2.opt.range * -1;
      var distancePozX = _this2.distancePoz[0] = _this2.movePoz[0] - _this2.startPoz[0];
      var distancePozY = _this2.distancePoz[1] = _this2.movePoz[1] - _this2.startPoz[1];
      if (Math.abs(distancePozY) > Math.abs(distancePozX)) {
        return;
      }
      if (!_this2.isActive && distancePozX < 0) {
        if (distancePozX < minPoz) {
          distancePozX = minPoz;
        }
        _this2.setSliderTranslate(distancePozX);
        e.preventDefault();
      } else if (_this2.isActive && distancePozX > 0) {
        if (distancePozX > _this2.opt.range) {
          distancePozX = _this2.opt.range;
        }
        _this2.setSliderTranslate(distancePozX - _this2.opt.range);
        e.preventDefault();
      }
    }, false);

    this.$slider.addEventListener('touchend', function (e) {
      _this2.endPoz[0] = e.changedTouches[0].pageX;
      _this2.endPoz[1] = e.changedTouches[0].pageY;
      if (Math.abs(_this2.distancePoz[1]) > Math.abs(_this2.distancePoz[0])) {
        _this2.isActive = false;
        _this2.touchendHandle(0);
      }
      _this2.touchendHandle(_this2.distancePoz[0]);
    }, false);
  },
  touchendHandle: function touchendHandle(distanceX) {
    var _this3 = this;

    var range = void 0;
    if (this.isActive) {
      if (distanceX > this.opt.backThreshold) {
        range = 0;
        this.isActive = false;
      } else {
        range = this.opt.range * -1;
        this.isActive = true;
      }
    } else {
      if (distanceX < this.opt.threshold * -1) {
        range = this.opt.range * -1;
        this.isActive = true;
      } else {
        range = 0;
        this.isActive = false;
      }
    }
    this.resetSliderAnimate(range, function () {
      var sliderStyle = _this3.$slider.style;
      sliderStyle.transition = sliderStyle['-webkit-transition'] = 'none';
    });
    this.resetPoz();
  },
  resetSliderAnimate: function resetSliderAnimate(distance, cb) {
    var sliderStyle = this.$slider.style;
    var transform = 'translate3d(' + distance + 'px, 0, 0)';
    var duration = this.opt.duration + 'ms';
    sliderStyle['-webkit-transition'] = '-webkit-transform ' + duration;
    sliderStyle.transition = 'transform ' + duration;
    sliderStyle.transform = sliderStyle['-webkit-transform'] = transform;
    this.$slider.addEventListener('webkitTransitionEnd', function (e) {
      cb && cb();
      e.preventDefault();
    }, false);
  },
  setSliderTranslate: function setSliderTranslate(move) {
    var sliderStyle = this.$slider.style;
    sliderStyle['-webkit-transform'] = sliderStyle.transform = 'translate3d(' + move + 'px, 0, 0)';
  },
  destroy: function destroy() {
    var wrap = this.$container.parentNode;
    wrap.removeChild(this.$container);
  }
};