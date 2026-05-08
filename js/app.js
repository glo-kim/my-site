// Theme toggle
(function () {
  var btn  = document.getElementById('themeToggle');
  var html = document.documentElement;
  if (!btn) return;
  btn.addEventListener('click', function () {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}());

// Weather widget
(function () {
  var statusEl = document.getElementById('wStatus');
  if (!statusEl) return;
  var bodyEl   = document.getElementById('wBody');
  var emojiEl  = document.getElementById('wEmoji');
  var tempEl   = document.getElementById('wTemp');
  var descEl   = document.getElementById('wDesc');
  var locEl    = document.getElementById('wLoc');

  function codeToInfo(c) {
    if (c === 0)              return { emoji: '☀️',  desc: 'Clear Sky' };
    if (c === 1)              return { emoji: '🌤️', desc: 'Mainly Clear' };
    if (c === 2)              return { emoji: '⛅',  desc: 'Partly Cloudy' };
    if (c === 3)              return { emoji: '☁️',  desc: 'Overcast' };
    if (c === 45 || c === 48) return { emoji: '🌫️', desc: 'Foggy' };
    if (c >= 51 && c <= 55)  return { emoji: '🌦️', desc: 'Drizzle' };
    if (c >= 56 && c <= 57)  return { emoji: '🌧️', desc: 'Freezing Drizzle' };
    if (c >= 61 && c <= 65)  return { emoji: '🌧️', desc: 'Rain' };
    if (c >= 66 && c <= 67)  return { emoji: '🌧️', desc: 'Freezing Rain' };
    if (c >= 71 && c <= 75)  return { emoji: '🌨️', desc: 'Snow' };
    if (c === 77)             return { emoji: '❄️',  desc: 'Snow Grains' };
    if (c >= 80 && c <= 82)  return { emoji: '🌦️', desc: 'Rain Showers' };
    if (c >= 85 && c <= 86)  return { emoji: '🌨️', desc: 'Snow Showers' };
    if (c === 95)             return { emoji: '⛈️', desc: 'Thunderstorm' };
    if (c >= 96)              return { emoji: '⛈️', desc: 'Thunderstorm & Hail' };
    return { emoji: '🌡️', desc: 'Unknown' };
  }

  if (!navigator.geolocation) {
    statusEl.textContent = 'Location not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat
        + '&longitude=' + lon
        + '&current_weather=true&temperature_unit=fahrenheit';
      var geoUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat
        + '&longitude=' + lon
        + '&localityLanguage=en';

      Promise.all([fetch(weatherUrl), fetch(geoUrl)])
        .then(function (rs) {
          return Promise.all([rs[0].json(), rs[1].json()]);
        })
        .then(function (data) {
          var cw   = data[0].current_weather;
          var geo  = data[1];
          var info = codeToInfo(cw.weathercode);
          var city = geo.city || geo.locality || geo.principalSubdivision || 'Your Location';

          emojiEl.textContent = info.emoji;
          tempEl.textContent  = Math.round(cw.temperature) + '°F';
          descEl.textContent  = info.desc;
          locEl.textContent   = city;

          statusEl.style.display = 'none';
          bodyEl.style.display   = 'flex';
        })
        .catch(function () {
          statusEl.textContent = 'Weather unavailable';
        });
    },
    function () {
      statusEl.textContent = 'Enable location to see your weather.';
    }
  );
}());

// Custom cursor
(function () {
  // Only run on devices with a fine pointer (mouse/trackpad)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var dot  = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var ringX  = mouseX;
  var ringY  = mouseY;

  // Snap dot; lerp ring
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Show / hide when entering or leaving the viewport
  document.addEventListener('mouseenter', function () {
    dot.classList.remove('cursor--hidden');
    ring.classList.remove('cursor--hidden');
  });
  document.addEventListener('mouseleave', function () {
    dot.classList.add('cursor--hidden');
    ring.classList.add('cursor--hidden');
  });

  // Hover state for interactive elements
  var hoverTargets = 'a, button, [role="button"], input, textarea, select, label, .btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('cursor--hover');
      ring.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('cursor--hover');
      ring.classList.remove('cursor--hover');
    }
  });

  // Smooth ring follow via lerp + rAF
  var LERP = 0.12;
  function animate() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}());
