Math.smallestAngle = function smallestAngle(y, x) {
  y = Math.mod2pi(y);
  x = Math.mod2pi(x);
  var delta = Math.min((2 * Math.PI) - Math.abs(x - y), Math.abs(x - y));
  if (Math.abs(Math.mod2pi(delta + x) - y) < 0.0001) {
    return delta;
  } else {
    return -delta;
  }
}

Math.smallestAngleAbs = function smallestAngleAbs(y, x) {
  y = Math.mod2pi(y);
  x = Math.mod2pi(x);
  return Math.min((2 * Math.PI) - Math.abs(x - y), Math.abs(x - y));
}

Math.mod2pi = function mod2pi(a) {
  const mod = Math.PI * 2;
  return a - (mod * Math.floor(a / mod));
}

Math.random2 = function random2(size, exclude) {
  let value = Math.floor(Math.random() * (size - 0.00001));
  if (size < 2) return value;
  while (value === exclude) {
    value = Math.floor(Math.random() * (size - 0.00001));
  }
  return value;
}
