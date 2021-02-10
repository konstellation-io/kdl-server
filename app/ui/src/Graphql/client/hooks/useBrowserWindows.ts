import { browserWindows } from './../cache';
import { BrowserWindow } from '../models/BrowserWindow';

function useBrowserWindows() {
  function addBrowserWindow(browserWindow: BrowserWindow) {
    browserWindows([...browserWindows(), browserWindow]);
  }
  function removeBrowserWindow(key: string) {
    const newBrowserWindows = browserWindows().filter((bw) => bw.key !== key);
    browserWindows(newBrowserWindows);
  }

  return {
    addBrowserWindow,
    removeBrowserWindow,
  };
}

export default useBrowserWindows;
