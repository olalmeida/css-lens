// background.js

// Function to toggle the extension state
function toggleExtensionState(sendResponse) {
  chrome.storage.local.get("isActive", (data) => {
    const newState = !data.isActive;
    chrome.storage.local.set({ isActive: newState }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "toggle",
              isActive: newState,
            },
            () => {
              if (chrome.runtime.lastError) {
                console.warn(
                  "CSS Lens: Could not send message to content script:",
                  chrome.runtime.lastError.message
                );
              }
            }
          );
        }
      });
      if (sendResponse) {
        sendResponse({ isActive: newState });
      }
    });
  });
}

// Listen for the extension's installation event
chrome.runtime.onInstalled.addListener(() => {
  // Initialize the 'isActive' state in storage
  chrome.storage.local.set({ isActive: false });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    console.log("Background: Received 'toggle' message from popup.");
    toggleExtensionState(sendResponse);
    return true; // Indicates asynchronous response
  } else if (request.action === "getState") {
    console.log("Background: Received 'getState' message from popup.");
    chrome.storage.local.get("isActive", (data) => {
      console.log(`Background: Current state is isActive: ${data.isActive}`);
      sendResponse({ isActive: data.isActive });
    });
    return true;
  }
});

// Listen for the command to toggle the extension
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log("Background: Received '_execute_action' command.");
    toggleExtensionState();
  }
});
