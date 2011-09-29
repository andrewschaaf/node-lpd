(function() {
  var k, name, names, v, _i, _len, _ref;
  var __hasProp = Object.prototype.hasOwnProperty;
  names = ['client', 'server'];
  for (_i = 0, _len = names.length; _i < _len; _i++) {
    name = names[_i];
    _ref = require("./" + name);
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      exports[k] = v;
    }
  }
}).call(this);
