// Popup script for MotmaenBash extension
// Handles displaying security information in the popup
async function updatePopupContent() {
  const statusIcon = document.getElementById('status_icon');
  const statusTitle = document.getElementById('status_title');
  let detailsContainer = document.getElementById('security_details') || document.createElement('div');
  detailsContainer.id = 'security_details';

  detailsContainer.innerHTML = '';
  if (detailsContainer.parentNode) {
    detailsContainer.parentNode.removeChild(detailsContainer);
  }

  try {
    const data = await browser.storage.local.get(['currentUrl', 'securityResult', 'message']);
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs && tabs[0] && tabs[0].url) {
      const currentTabUrl = tabs[0].url;

      if (data.currentUrl && data.message && data.currentUrl === currentTabUrl) {
        statusIcon.src = data.message.icon;
        statusTitle.className = data.message.className || 'status_title_nok';
        statusTitle.innerHTML = data.message.title;

        if (data.securityResult && data.securityResult.secure === false) {
          const typeName = getTypeName(data.securityResult.type);
          const levelName = getLevelName(data.securityResult.level);
          const matchType = data.securityResult.match === 1 ? 'دامنه' : 'آدرس کامل';

          detailsContainer.innerHTML = `
            <div class="security_detail">
              <span class="detail_label">نوع تهدید:</span> 
              <span class="detail_value">${typeName}</span>
            </div>
            <div class="security_detail">
              <span class="detail_label">سطح هشدار:</span> 
              <span class="detail_value">${levelName}</span>
            </div>
            <div class="security_detail">
              <span class="detail_label">تطابق:</span> 
              <span class="detail_value">${matchType}</span>
            </div>
          `;

          statusTitle.parentNode.insertBefore(detailsContainer, statusTitle.nextSibling);
        }
      } else {
        const url = new URL(currentTabUrl);

        if (url.hostname.match(/\.shaparak\.ir$/i) && url.protocol === 'https:') {
          statusTitle.className = 'status_title_ok';
          statusTitle.innerHTML = 'درگاه پرداخت امن، مطمئن باش';
          statusIcon.src = 'assets/images/icon_ok.png';
        } else {
          statusTitle.className = 'status_title_nok';
          statusTitle.innerHTML = 'این صفحه یک درگاه پرداخت نیست.';
          statusIcon.src = 'assets/images/icon_128.png';
        }
      }
    }
  } catch (error) {
    console.error('Error updating popup content:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updatePopupContent();

  browser.tabs.onActivated.addListener(() => {
    updatePopupContent();
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      updatePopupContent();
    }
  });

  const updateButton = document.getElementById('update_database');
  if (updateButton) {
    updateButton.addEventListener('click', async () => {
      updateButton.textContent = 'در حال بروزرسانی...';
      updateButton.disabled = true;

      try {
        const response = await browser.runtime.sendMessage({ action: 'updateDatabase' });
        if (response && response.success) {
          updateButton.textContent = 'بروزرسانی با موفقیت انجام شد';
          setTimeout(() => {
            updateButton.textContent = 'بروزرسانی پایگاه داده';
            updateButton.disabled = false;
          }, 2000);
        } else {
          updateButton.textContent = 'خطا در بروزرسانی';
          updateButton.disabled = false;
        }
      } catch (error) {
        updateButton.textContent = 'خطا در بروزرسانی';
        updateButton.disabled = false;
      }
    });
  }
});
