import browser from "webextension-polyfill";

browser.tabs.onUpdated.addListener(function (tabID, info, tab) {
  const isDashboard = tab.url === "https://nettenshop.webshopapp.com/admin/";

  if (isDashboard)
    browser.scripting.executeScript({
      target: { tabId: tabID, allFrames: true },
      files: ["dashboard.js"],
    });
});
