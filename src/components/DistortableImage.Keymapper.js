L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;
// L.DistortableImageOverlay.addInitHook(function () {
//   console.log(this.ACTIONS);
// });
L.DistortableImage.Keymapper = L.Handler.extend({

  options: {
    position: 'topright'
  },

  initialize: function (map, options) {
    this._map = map;
    this.action_map = L.DistortableImage.action_map;
    L.setOptions(this, options);
  },

  addHooks: function () {
    if (!this._keymapper) {
      this._toggler = this._toggleButton();
      this._scrollWrapper = this._wrap();
      this._setMapper(this._toggler, this._scrollWrapper);

      L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.on(this._scrollWrapper, {
        click: L.DomEvent.stop,
        mouseenter: this._disableMap,
        mouseleave: this._enableMap,
      }, this);
    }
  },

  removeHooks: function () {
    if (this._keymapper) {
      L.DomEvent.off(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.off(this._scrollWrapper, {
        click: L.DomEvent.stop,
        mouseenter: this._disableMap,
        mouseleave: this._enableMap,
      }, this);

      L.DomUtil.remove(this._toggler);
      L.DomUtil.remove(this._scrollWrapper);
      L.DomUtil.remove(this._keymapper._container);
      this._keymapper = false;
    }
  },

  _toggleButton: function () {
    var toggler = L.DomUtil.create('a', '');
    toggler.setAttribute('id', 'toggle-keymapper');
    toggler.setAttribute('href', '#');
    toggler.setAttribute('role', 'button');
    toggler.setAttribute('title', 'Show Keybindings');
    toggler.innerHTML = L.IconUtil.create("keyboard_open");

    return toggler;
  },

  _wrap: function () {
    var wrap = L.DomUtil.create('div', '');
    wrap.setAttribute('id', 'keymapper-wrapper');
    wrap.style.display = 'none';

    return wrap;
  },

  _setMapper: function (button, wrap) {
    this._keymapper = L.control({ position: this.options.position });
    var actions = this.action_map;
    var action_map_str = '', buffer = '', val = '';
    for(var i = 0; i<Object.keys(actions).length; i++){
      if(Object.values(actions)[i].slice(1,4) === 'get') {
        val = 'Get' + Object.values(actions)[i].slice(4);
      }
      if(Object.values(actions)[i].slice(1,7) === 'remove') {
        val = 'Remove' + Object.values(actions)[i].slice(7);
      }
      if(Object.values(actions)[i].slice(1,7) === 'toggle') {
        val = 'Toggle' + Object.values(actions)[i].slice(7);
      }
      val = val.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
      if (Object.values(actions)[i] === Object.values(actions)[i+1]) {
        buffer = '</kbd><kbd>'+Object.keys(actions)[i];
        continue;
      }
      action_map_str += '<tr><td><div class="left"><span>' +
      val + '</span></div><div class="right"><kbd>' +
      Object.keys(actions)[i] + buffer +
      '</kbd></div></td></tr>';
      buffer = '';
      val = '';
    }
    this._container = this._keymapper.onAdd = function () {
      var el_wrapper = L.DomUtil.create('div', 'ldi-keymapper-hide');
      el_wrapper.setAttribute('id', 'ldi-keymapper');
      var divider = L.DomUtil.create('br', 'divider');
      el_wrapper.appendChild(divider);
      el_wrapper.appendChild(wrap);
      wrap.insertAdjacentHTML(
        'beforeend',
        '<table><tbody>' +
          '<hr id="keymapper-hr">' +
          action_map_str +
          '</tbody></table>'
      );
      el_wrapper.appendChild(button);
      return el_wrapper;
    };

    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function (e) {
    L.DomEvent.stop(e);
    var container = document.getElementById('ldi-keymapper');
    var keymapWrap = document.getElementById('keymapper-wrapper');

    var newClass = container.className === 'ldi-keymapper leaflet-control' ? 'ldi-keymapper-hide leaflet-control' : 'ldi-keymapper leaflet-control';
    var newStyle = keymapWrap.style.display === 'none' ? 'block' : 'none';

    container.className = newClass;
    keymapWrap.style.display = newStyle;

    L.IconUtil.toggleTooltip(this._toggler, 'Show Keybindings', 'Hide Keybindings');
    this._toggler.innerHTML = this._toggler.innerHTML === 'close' ? L.IconUtil.create('keyboard_open') : 'close';
    L.DomUtil.toggleClass(this._toggler, 'close-icon');
  },

  _disableMap: function() {
    this._map.scrollWheelZoom.disable();
    this._map.dragging.disable();
  },

  _enableMap: function() {
    this._map.scrollWheelZoom.enable();
    this._map.dragging.enable();
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) { return; }

    var el = document.createElement('div');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  }
});

L.DistortableImage.Keymapper.addInitHook(function() {
  L.DistortableImage.Keymapper.prototype._n =
    L.DistortableImage.Keymapper.prototype._n ? L.DistortableImage.Keymapper.prototype._n + 1 : 1;

  if (L.DistortableImage.Keymapper.prototype._n === 1) {
    this.enable();
    this._injectIconSet();
  }
});

L.distortableImage.keymapper = function (map, options) {
  return new L.DistortableImage.Keymapper(map, options);
};
