
document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.getElementById("toggle-switch");

  // Get the initial state from storage and set the switch state
  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    if (response && response.isActive) {
      toggleSwitch.checked = true;
    } else {
      toggleSwitch.checked = false;
    }
  });

  // Add a change listener to the toggle switch
  toggleSwitch.addEventListener("change", () => {
    // Send a message to the background script to toggle the state
    chrome.runtime.sendMessage({ action: "toggle" }, (response) => {
      if (response && response.isActive) {
        toggleSwitch.checked = true;
      } else {
        toggleSwitch.checked = false;
      }
    });
  });
});
