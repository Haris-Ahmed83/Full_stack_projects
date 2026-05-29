document.addEventListener('DOMContentLoaded', () => {
    const tooltipTargets = document.querySelectorAll('[data-tooltip]');
    const tooltipOffset = 10; // Distance in pixels between the target and the tooltip

    tooltipTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            const tooltipText = target.dataset.tooltip;
            if (!
