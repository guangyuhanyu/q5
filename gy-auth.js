/* Guangyu Hanyu · Quyển 5 · đăng nhập bằng mã học viên */
(function () {
  var SK = 'gy-q5-sess', DK = 'gy-dev';
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }
  function dev() {
    var d = ls(DK);
    if (!d) {
      d = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      ls(DK, d);
    }
    return d || 'nostore';
  }
  function label() {
    var u = navigator.userAgent || '', os = 'Máy khác', br = 'trình duyệt';
    if (/iPhone/.test(u)) os = 'iPhone'; else if (/iPad/.test(u)) os = 'iPad';
    else if (/Android/.test(u)) os = 'Android'; else if (/Windows/.test(u)) os = 'Windows';
    else if (/Mac OS X/.test(u)) os = 'Mac'; else if (/Linux/.test(u)) os = 'Linux';
    if (/Zalo/i.test(u)) br = 'Zalo'; else if (/FBAN|FBAV/.test(u)) br = 'Facebook';
    else if (/Edg\//.test(u)) br = 'Edge'; else if (/CriOS|Chrome\//.test(u)) br = 'Chrome';
    else if (/Firefox|FxiOS/.test(u)) br = 'Firefox'; else if (/Safari/.test(u)) br = 'Safari';
    return os + ' · ' + br;
  }
  function get() { try { return JSON.parse(ls(SK) || 'null'); } catch (e) { return null; } }
  function put(s) { ls(SK, JSON.stringify(s)); }
  function digits(c) { return String(c || '').replace(/\D/g, ''); }
  var MSG = {
    notfound: 'Mã không đúng. Bạn kiểm tra lại đủ 8 chữ số nhé.',
    expired: 'Mã đã hết hạn sử dụng. Bạn liên hệ Thầy để gia hạn nhé.',
    locked: 'Mã đang tạm khóa. Bạn liên hệ Thầy nhé.',
    nodate: 'Mã chưa được kích hoạt. Bạn liên hệ Thầy nhé.',
    missing: 'Bạn chưa nhập mã học viên.',
    config: 'Trang đang được cài đặt, bạn quay lại sau ít phút nhé.',
    network: 'Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.',
    nolesson: 'Mã đúng, nhưng bài này chưa được mở cho bạn. Bạn liên hệ Thầy nhé.'
  };
  async function ask(code) {
    code = digits(code);
    if (!code) return { ok: false, error: 'missing' };
    var base = window.GY_SCRIPT_URL || '';
    if (!/^https?:\/\//.test(base)) return { ok: false, error: 'config' };
    var url = base + (base.indexOf('?') < 0 ? '?' : '&') + 'code=' + code +
      '&dev=' + encodeURIComponent(dev()) + '&label=' + encodeURIComponent(label()) + '&t=' + Date.now();
    var j;
    try {
      var r = await fetch(url, { cache: 'no-store' });
      j = await r.json();
    } catch (e) { return { ok: false, error: 'network' }; }
    if (j && j.ok) {
      var s = { code: code, name: j.name, exp: j.exp, expires: j.expires, lessons: j.lessons || [], keys: j.keys || {}, total: j.total || 20, ts: Date.now() };
      put(s);
      s.ok = true;
      return s;
    }
    j = j || { ok: false, error: 'network' };
    if (/notfound|expired|locked|nodate/.test(j.error)) {
      var old = get();
      if (old && old.code === code) put({ code: code, name: old.name, lessons: [], keys: {}, error: j.error, ts: Date.now() });
    }
    return j;
  }
  window.GY = {
    session: get,
    login: ask,
    refresh: function () { var s = get(); return s && s.code ? ask(s.code) : Promise.resolve({ ok: false, error: 'missing' }); },
    logout: function () { ls(SK, null); },
    expired: function (s) { return !!(s && s.exp && Date.now() > s.exp); },
    key: function (unit) { var s = get(); return s && !this.expired(s) && s.keys && s.keys[unit] || null; },
    msg: function (e) { return MSG[e] || MSG.network; },
    zalo: function () { return 'https://zalo.me/' + (window.GY_ZALO || '0358840411'); }
  };
})();
