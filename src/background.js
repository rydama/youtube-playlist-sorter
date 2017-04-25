/**
 * Chrome extension background script.
 *
 * This script runs whenever the extension is loaded.
 * It listens for our button being clicked and creates a new tab for our UI.
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
