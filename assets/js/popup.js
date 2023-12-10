let statusIcon, statusTitle;
browser.tabs.query({
  active: true,
  currentWindow: true
}).then((tabs) => {
  let url = new URL(tabs[0].url);
  statusIcon = document.getElementById('status_icon');
  statusTitle = document.getElementById('status_title');
  if (url.hostname.match(/\.shaparak\.ir$/i) && url.protocol == "https:") {
    statusTitle.classList.add("status_title_ok");
    statusTitle.textContent = 'درگاه پرداخت امن، مطمئن باش';
    statusIcon.src = 'assets/images/icon_ok.png';
  } else {
    statusTitle.classList.add("status_title_nok");
    statusTitle.textContent = 'این صفحه یک درگاه پرداخت نیست. تنها در صورت مشاهده تیک سبز رنگ، مطمئن باش که یک درگاه امن و معتبر است.';
    statusIcon.src = 'assets/images/icon_128.png';
  }
}).catch((error) => {
  console.error("Error:", error);
});
