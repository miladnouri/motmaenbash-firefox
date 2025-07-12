// Content script for MotmaenBash extension
// Create security verification overlay
function createSecurityOverlay(message) {
  const existingOverlay = document.getElementById('motmaenBashCornerSign');
  if (existingOverlay) existingOverlay.remove();

  const overlayDiv = document.createElement('div');
  overlayDiv.id = 'motmaenBashCornerSign';

  if (message.className) {
    overlayDiv.className = message.className;
  }

  let imgSrc = browser.runtime.getURL('assets/images/sign.png');
  if (message.icon && message.icon.includes('icon_danger.png')) {
    imgSrc = browser.runtime.getURL('assets/images/icon_danger.png');
  } else if (message.icon && message.icon.includes('icon_ok.png')) {
    imgSrc = browser.runtime.getURL('assets/images/sign.png');
  }

  overlayDiv.innerHTML = `<a href="https://motmaenbash.milad.nu" target="_blank">
    <img title="${message.description || 'مطمئن باش'}" 
    id="motmaenBashCornerSignLogo" 
    src="${imgSrc}"/>
  </a>`;

  document.body.insertBefore(overlayDiv, document.body.firstChild);
}

// Initial check for current URL
(async () => {
  const url = new URL(location.href);
  if (url.hostname.match(/\.shaparak\.ir$/i)) {
    try {
      const response = await browser.runtime.sendMessage({ action: 'checkSecurity', url: location.href });
      if (response && response.message) {
        createSecurityOverlay(response.message);
      } else if (url.protocol === 'https:') {
        createSecurityOverlay({
          description: 'این درگاه پرداخت معتبر و امن است',
          icon: 'assets/images/icon_ok.png'
        });
      }
    } catch (error) {
      console.error('Error sending checkSecurity message:', error);
    }
  }
})();

// Listen for security updates from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateSecurity') {
    createSecurityOverlay(message.message);
    return Promise.resolve({ success: true });
  }
});
