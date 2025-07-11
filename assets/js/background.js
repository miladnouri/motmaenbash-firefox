// Listen for any changes to the URL of any tab.
browser.tabs.onUpdated.addListener(checkForValidUrl);

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url !== undefined && changeInfo.status === "complete") {
    // Show the page action.
    browser.pageAction.show(tabId);
    let url = new URL(tab.url);
    if (url.hostname.match(/\.shaparak\.ir$/i) && url.protocol === "https:") {
      browser.pageAction.setIcon({
        tabId: tabId,
        path: {
          128: "/assets/images/icon_ok.png"
        }
      });
      browser.pageAction.setTitle({
        tabId: tabId,
        title: "درگاه پرداخت امن، مطمئن باش"
      });
    } else {
      // Do Nothing
    }
  }
}

// open Web Site Motmaenbash After Install 
browser.runtime.onInstalled.addListener(() => {
  browser.tabs.create({
    url: "https://motmaenbash.ir/"
  });
});
;
