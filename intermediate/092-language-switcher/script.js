/**
 * @file script.js
 * Handles language switching functionality for the web page.
 * Utilizes a simple module pattern to manage state (current language) and logic.
 */

// 1. Translation Data
// This object acts as our 'translation files', holding strings for different languages.
const translations = {
    en: {
        page_title: "Language Switcher",
        header_title: "Application Title",
        select_language_label: "Select Language:",
        welcome_message: "Welcome to Our Application!",
        intro_paragraph: "This is a simple demonstration of a language switcher using vanilla JavaScript. You can change the language using the dropdown above.",
        feature_description: "Our application offers various features to help you manage your tasks efficiently. Explore the options and customize your experience.",
        learn_more_button: "Learn More",
        footer_text: "© 2023 Language Switcher Demo. All rights reserved."
    },
    es: {
        page_title: "Cambiador de Idioma",
        header_title: "Título de la Aplicación",
        select_language_label: "Seleccionar Idioma:",
        welcome_message: "¡Bienvenido a Nuestra Aplicación!",
        intro_paragraph: "Esta es una simple demostración de un cambiador de idioma usando JavaScript puro. Puedes cambiar el idioma usando el selector de arriba.",
        feature_description: "Nuestra aplicación ofrece varias características para ayudarte a gestionar tus tareas de manera eficiente. Explora las opciones y personaliza tu experiencia.",
        learn_more_button: "Saber Más",
        footer_text: "© 2023 Demostración de Cambiador de Idioma. Todos los derechos reservados."
    },
    fr: {
        page_title: "Sélecteur de Langue",
        header_title: "Titre de l'Application",
        select_language_label: "Sélectionner la Langue :",
        welcome_message: "Bienvenue sur Notre Application !",
        intro_paragraph: "Ceci est une simple démonstration d'un sélecteur de langue utilisant JavaScript pur. Vous pouvez changer la langue en utilisant la liste déroulante ci-dessus.",
        feature_description: "Notre application offre diverses fonctionnalités pour vous aider à gérer vos tâches efficacement. Explorez les options et personnalisez votre expérience.",
        learn_more_button: "En Savoir Plus",
        footer_text: "© 2023 Démo du Sélecteur de Langue. Tous droits réservés."
    },
    de: {
        page_title: "Sprachwechsler",
        header_title: "Anwendungstitel",
        select_language_label: "Sprache auswählen:",
        welcome_message: "Willkommen in unserer Anwendung!",
        intro_paragraph: "Dies ist eine einfache Demonstration eines Sprachwechslers mit Vanilla JavaScript. Sie können die Sprache über das Dropdown-Menü oben ändern.",
        feature_description: "Unsere Anwendung bietet verschiedene Funktionen, die Ihnen helfen, Ihre Aufgaben effizient zu verwalten. Entdecken Sie die Optionen und passen Sie Ihr Erlebnis an.",
        learn_more_button: "Mehr erfahren",
        footer_text: "© 2023 Sprachwechsler-Demo. Alle Rechte vorbehalten."
    }
};

// Helper map for displaying full language names in the dropdown.
const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch"
};

// 2. Language Module (Simulated Context API)
// This IIFE (Immediately Invoked Function Expression) creates a private scope
// for our language state and exposes an API to interact with it.
const languageModule = (function() {
    let currentLanguage = 'en'; // Default language fallback

    /**
     * Determines the preferred language based on browser settings or stored preference.
     * Prioritizes localStorage, then browser language, then falls back to 'en'.
     * @returns {string} The determined language code.
     */
    function getInitialLanguage() {
        // 1. Check if user has a preference stored in localStorage
        const storedLang = localStorage.getItem('userLanguage');
        if (storedLang && translations[storedLang]) {
            return storedLang;
        }

        // 2. Check browser language preferences
        const browserLang = navigator.language || navigator.userLanguage;
        const availableLangs = Object.keys(translations);

        // Check for exact match (e.g., 'en-US' if 'en-US' is a key in translations)
        if (availableLangs.includes(browserLang)) {
            return browserLang;
        }

        // Check for base language match (e.g., 'en' for 'en-US')
        const baseLang = browserLang.split('-')[0];
        if (availableLangs.includes(baseLang)) {
            return baseLang;
        }

        // 3. Fallback to default English
        return 'en';
    }

    // Initialize currentLanguage when the module loads.
    currentLanguage = getInitialLanguage();

    /**
     * Retrieves a translated string for a given key in the current language.
     * Falls back to the key itself if no translation is found.
     * @param {string} key - The translation key.
     * @returns {string} The translated string or the key itself.
     */
    function getTranslation(key) {
        return translations[currentLanguage][key] || key;
    }

    /**
     * Applies translations to all elements with a 'data-translate-key' attribute.
     * Also updates the page title and the HTML lang attribute.
     */
    function applyTranslations() {
        // Update page title using its data-translate-key
        const pageTitleElement = document.querySelector('title');
        if (pageTitleElement) {
            const key = pageTitleElement.getAttribute('data-translate-key');
            if (key) {
                pageTitleElement.textContent = getTranslation(key);
            }
        }

        // Update all elements with the 'data-translate-key' attribute
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (key) {
                element.textContent = getTranslation(key);
            }
        });

        // Update the HTML lang attribute for accessibility and SEO
        document.documentElement.lang = currentLanguage;
    }

    /**
     * Sets a new language and triggers a re-translation of the page.
     * Stores the selected language in localStorage.
     * @param {string} langCode - The new language code (e.g., 'en', 'es').
     */
    function setLanguage(langCode) {
        if (translations[langCode]) {
            currentLanguage = langCode;
            applyTranslations();
            localStorage.setItem('userLanguage', langCode); // Store user preference
        } else {
            console.warn(`Language '${langCode}' not supported.`);
        }
    }

    // Expose public methods and properties of the module.
    return {
        get currentLanguage() { return currentLanguage; }, // Getter for current language
        setLanguage: setLanguage,
        getTranslation: getTranslation,
        applyTranslations: applyTranslations // Expose for initial page load
    };
})();

// 3. DOM Manipulation and Event Handling
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');

    // Populate the language dropdown with options based on available translations.
    for (const langCode in translations) {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = languageNames[langCode] || langCode; // Use full name if available, else code
        languageSelect.appendChild(option);
    }

    // Set the dropdown's selected value to the currently active language.
    languageSelect.value = languageModule.currentLanguage;

    // Add an event listener to the dropdown to handle language changes.
    languageSelect.addEventListener('change', (event) => {
        // When the dropdown value changes, update the language via our module.
        languageModule.setLanguage(event.target.value);
    });

    // Perform the initial translation of the page content
    // using the language determined by the module (browser preference or default).
    languageModule.applyTranslations();
});
