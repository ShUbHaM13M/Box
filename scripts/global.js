export const KEY = "BOX";
export const BOX_DATA_KEY = `${KEY}-DATA`;
export const ID_LENGTH = 8;

function generateID(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export async function addItem(data, type = "text") {
  chrome.storage.local.get(BOX_DATA_KEY, function (prev) {
    let items = prev[BOX_DATA_KEY] || {};
    const id = generateID(ID_LENGTH);
    items[id] = { type, content: data };
    const updated = {};
    updated[BOX_DATA_KEY] = items;
    chrome.storage.local.set(updated, function () {});
  });
}
export async function deleteItem(id) {
  let items = await chrome.storage.local.get(BOX_DATA_KEY);
  items = items[BOX_DATA_KEY];
  delete items[id];
  const updated = {};
  updated[BOX_DATA_KEY] = items;
  chrome.storage.local.set(updated, function () {});
}

export async function fetchItems() {
  const items = await chrome.storage.local.get(BOX_DATA_KEY);
  return items[BOX_DATA_KEY] || {};
}
