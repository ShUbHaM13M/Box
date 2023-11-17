import * as Box from "./global.js";

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "box-menu",
  title: "Add to Box",
  contexts: ["selection", "link", "image"],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "box-menu") {
    let data = {};

    if (info.selectionText) {
      data["type"] = "text";
      data["content"] = info.selectionText;
    } else if (info.linkUrl) {
      data["type"] = "link";
      data["content"] = info.linkUrl;
    } else if (info.srcUrl && info.mediaType === "image") {
      data["type"] = "image";
      data["content"] = info.srcUrl;
    } else return;

    chrome.runtime.sendMessage({ action: "add-to-box", data }, function (res) {
      if (chrome.runtime.lastError) {
        Box.addItem(data.content, data.type);
      }
    });
  }
});
