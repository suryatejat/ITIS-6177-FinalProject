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
   git clone <repository_url>
   cd <repository_folder>
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Server:**
   ```bash
   node app.js
   ```
   The server will run on the specified port (default is `3000`).

---

## **Endpoints**

### **1. POST `/translate`**
- **Purpose:** Translates text from one language to another.
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
- **Error Cases:**
  - `400`: Validation errors, e.g., missing `text` or invalid language codes.
  - `500`: Issues with the Azure Translator API.

---

### **2. POST `/detect`**
- **Purpose:** Detects the language of a given text.
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
- **Error Cases:**
  - `400`: Missing `text` in the request.
  - `500`: Issues with the Azure Translator API.

---

### **3. GET `/languages/:name?`**
- **Purpose:** Retrieves a list of supported languages or a specific language's name by code.
- **Parameters:** 
  - `name` (optional): Language code to retrieve the name of the language.
- **Response:**
  - **Without `name`:**
    ```json
    {
      "en": "English",
      "fr": "French",
      ...
    }
    ```
  - **With `name` (e.g., `/languages/fr`):**
    ```json
    {
      "Language Name": "French"
    }
    ```
- **Error Cases:**
  - `500`: Issues with the Azure Translator API.

---

### **4. GET `/languageCode/:name`**
- **Purpose:** Retrieves the language code for a given language name.
- **Parameters:**
  - `name` (required): Language name in English or its native form.
- **Response (e.g., `/languageCode/french`):**
  ```json
  {
    "languageCode": "fr"
  }
  ```
- **Error Cases:**
  - `400`: Missing `name` parameter.
  - `404`: Language not found.
  - `500`: Issues with the Azure Translator API.

---

### **5. POST `/transliterate`**
- **Purpose:** Transliterates text between scripts.
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
- **Error Cases:**
  - `400`: Validation errors, e.g., missing required fields.
  - `500`: Issues with the Azure Translator API.

---

### **6. POST `/breaksentence`**
- **Purpose:** Breaks text into sentences or phrases.
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
    "sentences": [12, 13]
  }
  ```
- **Error Cases:**
  - `400`: Missing `text` or invalid `language` field.
  - `500`: Issues with the Azure Translator API.

---

### **7. POST `/dictionarylookup`**
- **Purpose:** Looks up dictionary entries for a word.
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
- **Error Cases:**
  - `400`: Validation errors, e.g., missing required fields.
  - `500`: Issues with the Azure Translator API.

---

### **9. Error Handling**
- **Validation Errors (400):**
  Returned when required parameters are missing or invalid:
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
  Issues with Azure Translator service or misconfiguration:
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
- Consider using HTTPS in production environments.

--- 