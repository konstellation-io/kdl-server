export const channelName = 'send-message';

function useExternalBrowserWindows() {
  // const { data: windows } = useQuery(GET_BROWSER_WINDOWS);
  // const { addBrowserWindow, removeBrowserWindow } = useBrowserWindows();

  function getWindowsByType(type: string): any {
    // const window = windows.browserWindows.find(({ key }: BW) => key === type);
    // if (window) return BrowserWindow.fromId(window.id);
  }

  function openWindow(url: string, type: string, icon: string) {
    const window = getWindowsByType(type);
    if (window) {
      window.focus();
      return;
    }

    // const win = new BrowserWindow({
    //   icon,
    //   webPreferences: {
    //     nodeIntegration: true,
    //   },
    // });
    //
    // win.webContents.on('did-finish-load', () => {
    //   const componentAsString = ReactDOMServer.renderToString(<TopBar />);
    //   const code = addTopBar(componentAsString, channelName);
    //   win.webContents.executeJavaScript(code);
    // });
    // win.on('closed', () => removeBrowserWindow(type));
    // win.loadURL(url);
    // addBrowserWindow({ id: win.id, key: type });
  }

  // const addTopBar = (componentAsString: string, channel: string) => `
  //       document.body.innerHTML = '${componentAsString}' + document.body.innerHTML;
  //       const onButtonClick = (button) => {
  //         const { ipcRenderer } = require('electron')
  //         ipcRenderer.send('${channel}', 'Hi from ' + button + ' button!')
  //       }
  //       document.getElementById('sendFirstMessage').addEventListener('click', () => onButtonClick('first'))
  //       document.getElementById('sendSecondMessage').addEventListener('click', () => onButtonClick('second'))
  //     `;

  return {
    openWindow,
  };
}

export default useExternalBrowserWindows;
