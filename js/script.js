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
  const container = document.getElementById("news-list");
  if (!container) return;
  fetch("https://nagaokakyo-sc.hatenablog.com/rss")
  .then(res => res.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
      const items = data.querySelectorAll("item");
      let html = "";
      items.forEach((item, i) => {
          if (i >= 10) return;
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
          html += `
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
      });
      container.innerHTML = html;
  });
});

function setCalendar() {
  const iframe = document.getElementById("calendar");
  if (!iframe) return;
  const isMobile = window.innerWidth <= 768;
  const base = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&src=bmFnYW9rYWt5by5zYy5zZW5pb3JAZ21haWwuY29t&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%230b8043&color=%23d50000";
  iframe.src = isMobile
    ? base + "&mode=AGENDA"
    : base + "&mode=MONTH";
}
window.addEventListener("DOMContentLoaded", setCalendar);
window.addEventListener("resize", setCalendar);
