function updateBadge(tab) {
  browser.tabs.query({}).then((tabs) => {
    console.log("Tabs updated...", tabs.length);

    browser.browserAction.setBadgeText({ text: `${tabs.length}` });
  });
}

browser.tabs.onRemoved.addListener(updateBadge);
browser.tabs.onCreated.addListener(updateBadge);

browser.runtime.onInstalled.addListener(updateBadge);
