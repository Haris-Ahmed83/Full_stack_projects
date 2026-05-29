document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    // Function to hide all panels and deactivate all tabs
    function deactivateAllTabsAndHidePanels() {
        tabs.forEach(tab => {
            tab.setAttribute
