/**
 * Chrome extension background script.
 *
 * This script runs whenever the extension is loaded.
 * It listens for our button being clicked and creates a new tab for our UI.
 */
{
  /**
   * The listener for our browser action button click. This click is what kicks off the
   * creation of the playlist sorter page.
   */
  chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ "url": chrome.extension.getURL("app.html") }, () => {})
  })
}
