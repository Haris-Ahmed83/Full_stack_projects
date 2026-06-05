const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const angleInput = document.getElementById('angle');
const gradientPreview = document.getElementById('gradient-preview');
const cssOutput = document.getElementById('css-output');
const randomBtn = document.getElementById('random-btn');
const copyBtn = document.getElementById('copy-btn');

function updateGradient() {
    const color1 = color1Input.value;
    const color2 = color2Input.value;
    const angle = angleInput.value;

    const gradientString = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

    gradientPreview.style.background = gradientString;
    cssOutput.value = `background: ${gradientString};\n-webkit-background: ${gradientString};\n-moz-background: ${gradientString};`;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateRandomGradient() {
    color1Input.value = getRandomColor();
    color2Input.value = getRandomColor();
    angleInput.value = Math.floor(Math.random() * 361); // 0 to 360 degrees
    updateGradient();
}

function copyToClipboard() {
    cssOutput.select();
    navigator.clipboard.writeText(cssOutput.value)
        .then(() => {
            // Optional: Provide user feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        })
        .catch(err => {
            console.error('Failed to copy CSS: ', err);
            alert('Failed to copy CSS. Please try again or copy manually.');
        });
}

// Event Listeners
color1Input.addEventListener('input', updateGradient);
color2Input.addEventListener('input', updateGradient);
angleInput.addEventListener('input', updateGradient);
randomBtn.addEventListener('click', generateRandomGradient);
copyBtn.addEventListener('click', copyToClipboard);

// Initial gradient generation on page load
updateGradient();
