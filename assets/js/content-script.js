let url = new URL(window.location.href);
if (url.hostname.match(/\.shaparak\.ir$/i) && url.protocol == "https:") {
  let overlayDiv = document.createElement("div");
  overlayDiv.id = "motmaenBashCornerSign";
  overlayDiv.innerHTML = '<a href="https://motmaenbash.milad.nu" target="_blank"><img title="این درگاه پرداخت معتبر و امن است" id="motmaenBashCornerSignLogo" src="' + browser.runtime.getURL('assets/images/sign.png') + '"/></a>';
  document.body.insertBefore(overlayDiv, document.body.firstChild);
}
