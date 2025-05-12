// --- 地図の初期化 ---
const map = L.map('map').setView([37.75, 140.47], 13); // 福島市周辺

// --- OpenStreetMap タイル ---
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// --- CORS対応プロキシ経由でGTFS-RT取得（Cloudflare WorkersのURLに置き換えてください） ---
const proxyUrl = 'https://fujimaru703.workers.dev';
const gtfsRtSource = 'https://www.ptd-hs.jp/GetVehiclePosition?uid=zvL5QEwjF2YDmBaVcHbIM5lTLgu1&agency_id=0704&output=json';
const url = `${proxyUrl}/?url=${encodeURIComponent(gtfsRtSource)}`;

// --- バスマーカーを取得・表示 ---
function loadBusPositions() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      // 一度既存マーカーを削除する場合はここで管理する

      data.entity.forEach(entity => {
        const vehicle = entity.vehicle;
        const pos = vehicle?.position;
        const label = vehicle?.vehicle?.label || '車両';
        const speed = pos?.speed;

        if (pos?.latitude && pos?.longitude) {
          L.marker([pos.latitude, pos.longitude])
            .addTo(map)
            .bindPopup(`
              <b>車両番号:</b> ${label}<br>
              <b>速度:</b> ${speed ? speed.toFixed(1) + ' km/h' : '不明'}
            `);
        }
      });
    })
    .catch(err => {
      console.error('バス位置情報の取得に失敗:', err);
    });
}

// --- 初回ロード ＋ 任意の間隔で自動更新 ---
loadBusPositions();
setInterval(loadBusPositions, 15000); // 15秒ごとに更新
