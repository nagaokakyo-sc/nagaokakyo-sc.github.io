function loadParts() {
  fetch("/parts/header.html")
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById("header");
      if (header) header.innerHTML = data;
    });
  fetch("/parts/footer.html")
    .then(res => res.text())
    .then(data => {
      const footer = document.getElementById("footer");
      if (footer) footer.innerHTML = data;
    });
}
window.addEventListener("DOMContentLoaded", loadParts);

window.addEventListener("DOMContentLoaded", () => {
  const newsList = document.getElementById("news-list");
  const topNews = document.getElementById("top-news");
  // 両方なければ何もしない
  if (!newsList && !topNews) return;
  fetch("https://nagaokakyo-sc.hatenablog.com/rss")
    .then(res => res.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("item");
      let newsHTML = "";
      let topHTML = "";
      items.forEach((item, i) => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        const date = new Date(item.querySelector("pubDate").textContent)
                        .toLocaleDateString("ja-JP");
        let content = item.querySelector("content\\:encoded") 
                    || item.querySelector("description");
        content = content ? content.textContent : "";
        const imgMatch = content.match(/<img.*?src="(.*?)"/);
        const img = imgMatch ? imgMatch[1] : "images/no-image.png";
        const text = content.replace(/<[^>]+>/g, "").slice(0, 80) + "...";
        // ▼ お知らせページ（10件）
        if (newsList && i < 10) {
          newsHTML += `
          <div class="feed-item">
            <a href="${link}">
              <img src="${img}" class="feed-thumb">
            </a>
            <div class="feed-content">
              <a href="${link}" class="feed-title">${title}</a>
              <div class="feed-text">${text}</div>
              <div class="feed-date">${date}</div>
            </div>
          </div>
          `;
        }
        // ▼ トップページ（3件だけ＆軽量）
        if (topNews && i < 3) {
          topHTML += `
          <div class="top-news-item">
            <a href="${link}">
              <span class="date">${date}</span> ${title}
            </a>
          </div>
          `;
        }
      });
      if (newsList) newsList.innerHTML = newsHTML;
      if (topNews) topNews.innerHTML = topHTML;
    });
});

function setCalendar() {
  const iframe = document.getElementById("calendar");
  if (!iframe) return;
  const isMobile = window.innerWidth <= 768;
  const basePC = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&src=bmFnYW9rYWt5by5zYy5zZW5pb3JAZ21haWwuY29t&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%230b8043&color=%23d50000";
  const baseMobile = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&src=bmFnYW9rYWt5by5zYy5zZW5pb3JAZ21haWwuY29t&color=%230b8043";
  iframe.src = isMobile
    ? baseMobile + "&mode=AGENDA"
    : basePC + "&mode=MONTH";
}
window.addEventListener("DOMContentLoaded", setCalendar);
window.addEventListener("resize", setCalendar);

async function loadTopSchedule() {
  console.log("top schedule start");
  const container = document.getElementById("top-schedule");
  if (!container) return;
  try {
    const res = await fetch(
      "https://corsproxy.io/?https://calendar.google.com/calendar/ical/nagaokakyo.sc.senior%40gmail.com/public/basic.ics"
    );
    const text = await res.text();
    console.log(text.slice(0, 200));
    const events = [];
    const lines = text.split("\n");
    let event = {};
    let currentKey = "";
    lines.forEach(line => {
      // 折り返し行（SUMMARYの続き）
      if (line.startsWith(" ")) {
        if (currentKey === "title" && event.title) {
          event.title += line.trim();
        }
        return;
      }
      if (line.startsWith("BEGIN:VEVENT")) {
        event = {};
        currentKey = "";
      }
      if (line.startsWith("DTSTART")) {
        event.start = line.split(":")[1];
        currentKey = "start";
      }
      if (line.startsWith("SUMMARY")) {
        event.title = line.substring(line.indexOf(":") + 1);
        currentKey = "title";
      }
      if (line.startsWith("END:VEVENT")) {
        events.push(event);
      }
    });
    // 日付順にソート
    events.sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const now = new Date();
    // 未来の予定3件
    const upcoming = events.filter(e => {
      if (!e.start) return false;
      const raw = e.start;
      const dateStr = raw.slice(0, 8);
      const d = new Date(
        `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
      );
      return d >= now;
    }).slice(0, 3);
    if (upcoming.length === 0) {
      container.innerHTML = "<li>予定はありません</li>";
      return;
    }
    // 表示
    container.innerHTML = upcoming.map(e => {
      const raw = e.start;
      const dateStr = raw.slice(0, 8);
      const date = `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
      return `<li><span class="date">${date}</span> ${e.title || ""}</li>`;
    }).join("");
  } catch (e) {
    console.error(e);
    container.innerHTML = "<li>読み込みに失敗しました</li>";
  }
}
window.addEventListener("DOMContentLoaded", loadTopSchedule);