chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // chrome.storage.sync.clear()
  if (tab.url?.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});
