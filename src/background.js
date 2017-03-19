/**
 * Chrome extension background script.
 *
 * This script runs whenever the extension is loaded. It manages the listeners and sends messages
 * to control the playlist-manager script.
 */
{
  /**
   * The listener for our browser action button click. This click is what kicks off the
   * creation of the playlist manager page.
   */
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({ "url": chrome.extension.getURL("app.html") }, function(newTab) {
    });

  });


  /**
   * Add a listener for tab removal.
   */
  chrome.tabs.onRemoved.addListener(function(tabId) {
  });
}
