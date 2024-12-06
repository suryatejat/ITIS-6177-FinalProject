---

# **Azure AI Translator API Documentation**

This documentation provides detailed information on how to set up, run, and use the REST API that leverages Azure AI Translator for translation, transliteration, language detection, and more.

---

## **Prerequisites**

1. **Node.js & npm:** Ensure you have Node.js installed (preferably v14+).
2. **Azure Translator Service:** Sign up for an Azure account and create a Translator service instance. Note down:
   - API Key
   - Endpoint URL
   - Location (Region)
3. **Environment Setup:** Create a `.env` file with the following variables:
   ```env
   TRANSLATOR_KEY=your_api_key
   TRANSLATOR_ENDPOINT=https://your_endpoint.cognitiveservices.azure.com
   TRANSLATOR_LOCATION=your_region
   PORT=3000
   ```

---

## **Setup Instructions**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/suryatejat/ITIS-6177-FinalProject.git
   cd ITIS-6177-FinalProject
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Server:**
   ```bash
   node translator.js
   ```
   The server will run on the specified port (default is `3000`).

---

## **Endpoints**

### **1. POST `/translate`**
- **Purpose:** Translates text from one language to another.
- **Description:** Accepts input text and translates it into the specified target language. Optionally, a source language can be specified.
- **Request Body:**
  ```json
  {
    "text": "Hello",
    "targetLanguage": "fr",
    "sourceLanguage": "en" // optional
  }
  ```
- **Response:**
  ```json
  {
    "translatedText": "Bonjour"
  }
  ```

---

### **2. POST `/detect`**
- **Purpose:** Detects the language of a given text.
- **Description:** Analyzes input text and identifies its language.
- **Request Body:**
  ```json
  {
    "text": "Hola"
  }
  ```
- **Response:**
  ```json
  {
    "detectedLanguage": "es"
  }
  ```

---

### **3. GET `/languages/:name?`**
- **Purpose:** Retrieves a list of supported languages or a specific language's name by code.
- **Description:** Fetches all supported languages by the Translator service. Optionally, you can specify a language code to retrieve its name.
- **Request Parameter:** 
  - `name` (optional): Language code to get its name.
- **Responses:**
  - Without `name`:
    ```json
    {
      "en": "English",
      "fr": "French",
      ...
    }
    ```
  - With `name` (e.g., `/languages/fr`):
    ```json
    {
      "Language Name": "French"
    }
    ```

---

### **4. GET `/languageCode/:name`**
- **Purpose:** Retrieves the language code for a given language name.
- **Description:** Searches the list of supported languages for the code corresponding to the specified language name.
- **Request Parameter:** 
  - `name` (required): Language name in English or native form.
- **Response (e.g., `/languageCode/french`):**
  ```json
  {
    "languageCode": "fr"
  }
  ```

---

### **5. POST `/transliterate`**
- **Purpose:** Transliterates text between scripts.
- **Description:** Converts text from one script to another within the same language (e.g., Japanese Kanji to Romaji).
- **Request Body:**
  ```json
  {
    "text": "こんにちは",
    "language": "ja",
    "fromScript": "Jpan",
    "toScript": "Latn"
  }
  ```
- **Response:**
  ```json
  {
    "transliteratedText": "konnichiwa"
  }
  ```

---

### **6. POST `/breaksentence`**
- **Purpose:** Breaks text into sentences or phrases.
- **Description:** Analyzes text and splits it into sentence or phrase boundaries.
- **Request Body:**
  ```json
  {
    "text": "Hello world! How are you?",
    "language": "en"
  }
  ```
- **Response:**
  ```json
  {
    "sentences": [12, 13] // Length of sentences in characters
  }
  ```

---

### **7. POST `/dictionarylookup`**
- **Purpose:** Looks up dictionary entries for a word.
- **Description:** Fetches dictionary-style translations and details for the input text in the specified language.
- **Request Body:**
  ```json
  {
    "text": "run",
    "language": "en"
  }
  ```
- **Response:**
  ```json
  {
    "entries": [
      {
        "normalizedTarget": "run",
        "displayTarget": "run",
        ...
      }
    ]
  }
  ```

---

### **8. Error Handling**
- **Validation Errors (400):**  
  - Missing or invalid parameters.
  ```json
  {
    "errors": [
      {
        "msg": "Text is required",
        "param": "text",
        "location": "body"
      }
    ]
  }
  ```
- **Server Errors (500):**  
  - Issues with Azure Translator service or misconfiguration.
  ```json
  {
    "error": "Invalid subscription key"
  }
  ```

---

## **Testing the API**

- Use tools like **Postman** or **cURL** to test endpoints.
- Example cURL for translation:
  ```bash
  curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "targetLanguage": "es"}'
  ```

---

## **Security Considerations**
- Never expose your `.env` file or API key.
- Use environment variables to store sensitive credentials.

--- 
