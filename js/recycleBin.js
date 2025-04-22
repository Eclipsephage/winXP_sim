import { updateFileExplorer } from "./updateFileExplorer.js";

export function initRecycleBin(win, showNotification) {
  updateFileExplorer(win, "C:/Recycle Bin/");
}