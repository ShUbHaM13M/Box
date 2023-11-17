// TODO: Add a better logo

import * as Box from "../scripts/global.js";

const textArea = document.getElementById("text");
const addBtn = document.getElementById("add");
const savedContainer = document.getElementById("saved");
const itemTemplate = document.getElementById("item");
const searchInput = document.getElementById("search");

const TYPE_PREFIX = "#";
const TYPES = ["image", "link", "text"];

searchInput?.addEventListener("input", (e) => {
  let value = e.target.value.toLowerCase();
  const items = document.querySelectorAll(".item");
  if (!value) items.forEach((item) => item.classList.remove("hide"));
  let typeFilters = [];
  value.split(" ").forEach((v) => {
    if (
      v[0] === TYPE_PREFIX &&
      TYPES.includes(v.slice(1, v.length).toLowerCase())
    )
      typeFilters.push(v.slice(1, v.length).toLowerCase());
  });
  value = value.replaceAll(" ", "");
  value = value.replaceAll(TYPE_PREFIX, "");
  TYPES.forEach((type) => (value = value.replaceAll(type, "")));

  items.forEach((item) => {
    let typeMatched = true;
    if (typeFilters.length) {
      typeMatched = typeFilters.includes(item.getAttribute("data-type"));
    }
    if (typeMatched) {
      item.classList.remove("hide");
    } else {
      item.classList.add("hide");
      return;
    }

    const contentMatched = item
      .getAttribute("data-content")
      .toLowerCase()
      .includes(value);

    if (!contentMatched) item.classList.add("hide");
    else item.classList.remove("hide");
  });
});

addBtn?.addEventListener("click", async () => {
  if (!textArea.value) return;
  await Box.addItem(textArea.value);
  textArea.value = "";
});

async function fetchStoredBoxData() {
  let items = await Box.fetchItems();
  const entries = Object.entries(items);
  if (entries.length) {
    entries.forEach(([id, content]) => addToContainer({ id, ...content }));
  }
  // TODO: Add empty state
}

function removeFromContainer(id) {
  const item = savedContainer.querySelector(`.item[data-id="${id}"]`);
  savedContainer.removeChild(item);
}

function addToContainer(data, prepend = false) {
  const itemElement = itemTemplate.content.cloneNode(true);
  let container = itemElement.querySelector(".item");
  container.setAttribute("data-id", data.id);
  container.setAttribute("data-content", data.content);
  container.setAttribute("data-type", data.type);
  container = container.querySelector(".content");

  const deleteButton = itemElement.querySelector(".delete");
  deleteButton.addEventListener("click", () => Box.deleteItem(data.id));

  let element = null;
  switch (data.type) {
    case "link":
      element = document.createElement("a");
      element.classList.add("link");
      element.setAttribute("href", data.content);
      element.setAttribute("target", "_blank");
      element.innerHTML = data.content;
      break;
    case "image":
      element = document.createElement("img");
      element.classList.add("image");
      element.setAttribute("src", data.content);
      element.setAttribute("alt", data.content);
      break;
    case "text":
    default:
      element = document.createElement("div");
      element.classList.add("text");
      element.innerHTML = data.content;
  }

  container.append(element);
  if (prepend) savedContainer.prepend(itemElement);
  else savedContainer.append(itemElement);
}

fetchStoredBoxData();

chrome.runtime.onMessage.addListener(async function (request, _, sendResponse) {
  if (request.action === "add-to-box") {
    console.log(request.data);
    await Box.addItem(request.data.content, request.data.type);
    sendResponse({ suceess: true });
  }
});

chrome.storage.local.onChanged.addListener(function (changes) {
  let { newValue, oldValue } = changes[Box.BOX_DATA_KEY];
  if (!oldValue) oldValue = {};
  const combined = { ...newValue, ...oldValue };
  let diff = Object.entries(combined).reduce((acc, [key, value]) => {
    if (
      !Object.keys(newValue).includes(key) ||
      !Object.keys(oldValue).includes(key)
    )
      acc[key] = value;
    return acc;
  }, {});
  const id = Object.keys(diff)[0];
  const data = Object.values(diff)[0];
  diff = { ...data, id };
  const deleted = Object.keys(newValue).length < Object.keys(oldValue).length;
  if (deleted) removeFromContainer(id);
  else addToContainer(diff, true);
});
