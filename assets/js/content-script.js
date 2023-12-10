var url = new URL(location.href);
if( (url.hostname=='ipg.cbinasim.ir' || url.hostname.match(/\.shaparak\.ir$/i) ) && url.protocol == "https:" ){

  var overlayDiv=document.createElement("div");
  overlayDiv.id = "motmaenBashCornerSign";
  overlayDiv.innerHTML = '<a id="motmaenBashCornerSignLink" href="https://tookan.tech/?utm_source=firefox&utm_medium=motmaenbash&utm_campaign=extensions&utm_term=sign_logo" target="_blank"></a>'
  document.body.insertBefore(overlayDiv, document.body.firstChild);

  var motmaenBashLogoImg = document.createElement("img");
  motmaenBashLogoImg.setAttribute("src", chrome.runtime.getURL('assets/images/sign.png'));
  motmaenBashLogoImg.setAttribute("title", "این درگاه پرداخت معتبر و امن است");
  motmaenBashLogoImg.setAttribute("target", "_blank");
  motmaenBashLogoImg.id = "motmaenBashCornerSignLogo";
  document.getElementById('motmaenBashCornerSignLink').appendChild(motmaenBashLogoImg);

}
