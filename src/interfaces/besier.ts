const tau = 2 * Math.PI;

function crt(v: number) {
  return (v < 0) ? -Math.pow(-v, 1 / 3) : Math.pow(v, 1 / 3);
}

function cardano(curve: number[], ratio: number) {
  const pa = ratio;
  const pb = ratio - curve[0];
  const pc = ratio - curve[2];
  const pd = ratio - 1;

  // to [t^3 + at^2 + bt + c] form:
  const pa3 = pa * 3;
  const pb3 = pb * 3;
  const pc3 = pc * 3;
  const d = (-pa + pb3 - pc3 + pd);
  const rd = 1 / d;
  const r3 = 1 / 3;
  const a = (pa3 - 6 * pb + pc3) * rd;
  const a3 = a * r3;
  const b = (-pa3 + pb3) * rd;
  const c = pa * rd;
  // then, determine p and q:
  const p = (3 * b - a * a) * r3;
  const p3 = p * r3;
  const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
  const q2 = q / 2;
  // and determine the discriminant:
  const discriminant = q2 * q2 + p3 * p3 * p3;

  // If the discriminant is negative, use polar coordinates
  // to get around square roots of negative numbers
  if (discriminant < 0) {
    const mp3 = -p * r3;
    const mp33 = mp3 * mp3 * mp3;
    const r = Math.sqrt(mp33);
    // compute cosphi corrected for IEEE float rounding:
    const t = -q / (2 * r);
    const cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
    const phi = Math.acos(cosphi);
    const crtr = crt(r);
    const t1 = 2 * crtr;
    const x1 = t1 * Math.cos(phi * r3) - a3;
    const x2 = t1 * Math.cos((phi + tau) * r3) - a3;
    const x3 = t1 * Math.cos((phi + 2 * tau) * r3) - a3;

    // choose best percentage
    if (0 <= x1 && x1 <= 1) {
      if (0 <= x2 && x2 <= 1) {
        return (0 <= x3 && x3 <= 1) ? Math.max(x1, x2, x3) : Math.max(x1, x2);
      } else {
        return (0 <= x3 && x3 <= 1) ? Math.max(x1, x3) : x1;
      }
    } else {
      if (0 <= x2 && x2 <= 1) {
        return (0 <= x3 && x3 <= 1) ? Math.max(x2, x3) : x2;
      } else {
        return x3;
      }
    }
  } else if (discriminant === 0) {
    const u1 = q2 < 0 ? crt(-q2) : -crt(q2);
    const x1 = 2 * u1 - a3;
    const x2 = -u1 - a3;

    // choose best percentage
    if (0 <= x1 && x1 <= 1) {
      return (0 <= x2 && x2 <= 1) ? Math.max(x1, x2) : x1;
    } else {
      return x2;
    }
  } else {
    // one real root, and two imaginary roots
    const sd = Math.sqrt(discriminant);
    return crt(-q2 + sd) - crt(q2 + sd) - a3;
  }
}

export default function bezierByTime(controlPoints: number[], ratio: number) {
  const percent = cardano(controlPoints, ratio);    // t
  // var p0y = 0;                // a
  // const p1y = controlPoints[1]; // b
  // const p2y = controlPoints[3]; // c
  // var p3y = 1;                // d
  const t1  = 1 - percent;
  return /* 0 * t1 * t1 * t1 + */ controlPoints[1] * 3 * percent * t1      * t1 +
         controlPoints[3] * 3 * percent * percent * t1 +
         /* 1 * */ percent * percent * percent;
}
