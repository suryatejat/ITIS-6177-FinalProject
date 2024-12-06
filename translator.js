require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Framework for building web applications
const axios = require('axios'); // HTTP client for making API requests
const { body, validationResult } = require('express-validator'); // Middleware for validating and sanitizing input
const app = express(); // Initialize Express application
app.use(express.json()); // Middleware to parse JSON request bodies

// Environment Variables
const key = process.env.TRANSLATOR_KEY; // API key for the Translator service
const endpoint = process.env.TRANSLATOR_ENDPOINT; // Endpoint URL for the Translator service
const location = process.env.TRANSLATOR_LOCATION; // Azure region of the Translator service

// Middleware for input sanitization
// This removes HTML tags and trims input to prevent injection attacks
const sanitizeInput = (text) => {
    return text.trim().replace(/<[^>]*>/g, ''); // Basic sanitization
};

// Validation rules for /translate endpoint
const translateValidation = [
    body('text').isString().withMessage('Text must be a string').notEmpty().withMessage('Text is required'),
    body('targetLanguage').isAlpha().withMessage('Target language must be a valid language code')
        .isLength({ min: 2, max: 5 }).withMessage('Target language code length is invalid'),
    body('sourceLanguage').optional().isAlpha().withMessage('Source language must be a valid language code')
        .isLength({ min: 2, max: 5 }).withMessage('Source language code length is invalid')
];

// Reusable function for setting up API request headers
const getApiHeaders = () => ({
    'Ocp-Apim-Subscription-Key': key, // API key for authentication
    'Ocp-Apim-Subscription-Region': location, // Azure region for the API
    'Content-type': 'application/json' // Content type for JSON payloads
});

// POST /translate
// Translates text from one language to another
app.post('/translate', translateValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors
        return res.status(400).json({ errors: errors.array() });
    }

    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    // Sanitize input
    const sanitizedText = sanitizeInput(text);
    const sanitizedSourceLanguage = sanitizeInput(sourceLanguage);
    const sanitizedTargetLanguage = sanitizeInput(targetLanguage);

    const route = `/translate?api-version=3.0&from=${sanitizedSourceLanguage}&to=${sanitizedTargetLanguage}`;
    const url = endpoint + route;

    const headers = getApiHeaders();

    const body = [{ 'text': sanitizedText }]; // API payload

    try {
        // Send translation request to the API
        const response = await axios.post(url, body, { headers: headers });
        const translatedText = response.data[0].translations[0].text; // Extract translated text
        return res.json({ translatedText }); // Respond with the translated text
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// POST /detect
// Detects the language of the given text
app.post('/detect', body('text').isString().withMessage('Text must be a string').notEmpty().withMessage('Text is required'), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors
        return res.status(400).json({ errors: errors.array() });
    }

    let text = req.body.text;

    // Sanitize input
    text = sanitizeInput(text);

    const route = '/detect?api-version=3.0';
    const url = endpoint + route;

    const headers = getApiHeaders();

    const body = [{ 'text': text }]; // API payload

    try {
        // Send language detection request
        const response = await axios.post(url, body, { headers: headers });
        const detectedLanguage = response.data[0].language; // Extract detected language
        return res.json({ detectedLanguage }); // Respond with the detected language
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// GET /languages
// Retrieves the list of supported languages
app.get('/languages/:name?', async (req, res) => {
    const route = '/languages?api-version=3.0';
    const url = endpoint + route;
    var languageName = null; 
    if(req.params.name != null){
        languageName = req.params.name.toLowerCase().trim(); // Sanitize the parameter
    }
    const headers = getApiHeaders();

    try {
        // Send request to retrieve supported languages
        const response = await axios.get(url, { headers: headers });
        const supportedLanguages = response.data.translation; // Extract languages data
        for(lang in supportedLanguages){
            supportedLanguages[lang] = supportedLanguages[lang]["name"]
        }
        if(languageName != null){
            return res.json({"Language Name" : supportedLanguages[languageName]});
        }
        return res.json(supportedLanguages); // Respond with the list of supported languages
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// GET /languageCode/:name
// Retrieves the language code for a given language name
app.get('/languageCode/:name', async (req, res) => {
    const languageName = req.params.name.toLowerCase().trim(); // Sanitize the parameter

    if (!languageName) {
        // Return error if language name is missing
        return res.status(400).json({ error: 'Language name is required' });
    }

    const route = '/languages?api-version=3.0';
    const url = endpoint + route;

    const headers = getApiHeaders();

    try {
        // Send request to retrieve supported languages
        const response = await axios.get(url, { headers: headers });
        const languages = response.data.translation; // Extract translation languages

        // Find language code by name
        for (const [code, lang] of Object.entries(languages)) {
            if (lang.name.toLowerCase() === languageName || lang.nativeName.toLowerCase() === languageName) {
                return res.json({ languageCode: code }); // Respond with the language code
            }
        }

        return res.status(404).json({ error: 'Language not found' }); // Respond if language is not found
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// POST /transliterate
// Transliterate text between scripts
app.post('/transliterate', [
    // Validate that 'text' is a non-empty string
    body('text').isString().withMessage('Text must be a string').notEmpty().withMessage('Text is required'),
    // Validate that 'language' is an alphabetic string between 2 to 5 characters
    body('language').isAlpha().withMessage('Language must be a valid language code')
        .isLength({ min: 2, max: 5 }).withMessage('Language code length is invalid'),
    // Validate that 'fromScript' is provided as a string
    body('fromScript').isString().withMessage('Source script is required'),
    // Validate that 'toScript' is provided as a string
    body('toScript').isString().withMessage('Target script is required')
], async (req, res) => {
    const errors = validationResult(req); // Collect validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Respond with validation errors if any
    }

    // Destructure the validated fields from the request body
    const { text, language, fromScript, toScript } = req.body;

    // Construct the API endpoint URL with query parameters
    const route = `/transliterate?api-version=3.0&language=${language}&fromScript=${fromScript}&toScript=${toScript}`;
    const url = endpoint + route;

    const headers = getApiHeaders(); // Set up the API request headers

    try {
        // Send a POST request to the transliterate API
        const response = await axios.post(url, [{ text }], { headers });
        const transliteratedText = response.data[0].text; // Extract transliterated text
        return res.json({ transliteratedText }); // Send response with the transliterated text
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message); // Log error details
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message }); // Respond with error message
    }
});

// POST /breaksentence
// Break text into phrases or sentences
app.post('/breaksentence', [
    // Validate that 'text' is a non-empty string
    body('text').isString().withMessage('Text must be a string').notEmpty().withMessage('Text is required'),
    // Validate that 'language' is an alphabetic string between 2 to 5 characters
    body('language').isAlpha().withMessage('Language must be a valid language code')
        .isLength({ min: 2, max: 5 }).withMessage('Language code length is invalid')
], async (req, res) => {
    const errors = validationResult(req); // Collect validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Respond with validation errors if any
    }

    const { text, language } = req.body; // Destructure the validated fields from the request body

    const route = `/breaksentence?api-version=3.0`; // Define API route for sentence breaking
    const url = endpoint + route;

    const headers = getApiHeaders(); // Set up the API request headers

    try {
        // Send a POST request to the sentence breaking API
        const response = await axios.post(url, [{ text }], { headers });
        const sentences = response.data[0].sentLen; // Extract sentence lengths
        return res.json({ sentences }); // Send response with sentence lengths
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message); // Log error details
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message }); // Respond with error message
    }
});

// POST /dictionarylookup
// Look up dictionary entries for a word
app.post('/dictionarylookup', [
    body('text').isString().withMessage('Text must be a string').notEmpty().withMessage('Text is required'),
    body('language').isAlpha().withMessage('Language must be a valid language code')
        .isLength({ min: 2, max: 5 }).withMessage('Language code length is invalid')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { text, language } = req.body;

    const toLanguage = language === "en" ? "es" : language; // Fallback target language
    const route = `/dictionary/lookup?api-version=3.0&from=${language}&to=${toLanguage}`;
    const url = endpoint + route;

    const headers = getApiHeaders();

    try {
        const response = await axios.post(url, [{ text }], { headers });
        const entries = response.data[0].translations;
        return res.json({ entries });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data.error.message : error.message });
    }
});

// Retrieving all the Invalid routes
app.use((req, res) => {
    res.status(404).json({ error: "Invalid route"});
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));