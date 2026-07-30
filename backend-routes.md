# Backend Routes, Data Model & AI Services

This application is completely "serverless" and client-side driven. It doesn't use a traditional backend server like Express.js or Node.js. Instead, the "backend" consists of direct integrations with Firebase (Firestore Database & Authentication) and the Google Gemini API, all managed securely from the client SDKs.

Below is the comprehensive list of all routes, collections, data models, and services from the backend layer to the database.

---

## 1. Authentication (Firebase Auth)

Login data and credentials come directly from the **Firebase Console** (Google's backend).
The main provider being used is **Email and Password**.

### Login Flow Constraints
*   **No UI Sign up:** The application does not allow "Account Creation" natively. It acts as a locked portal.
*   **Provisioning:** Users access the platform using credentials previously provisioned from external sales/membership platforms (e.g., Hotmart) via Firebase Admin or pre-cadred directly inside the Firebase Console.
*   The application connects to Google Firebase Auth using SDK `signInWithEmailAndPassword`.

---

## 2. Firestore Database Routes / Collections

Access to these collections is restricted by Firestore Security Rules (`firestore.rules`). All write operations validate schema and types before saving.

### 👥 Users Collection
Contains user profiles, progression states, and roles.
*   **Path:** `/users/{userId}`
*   **Access Rules:** Read/Write by Owner or Admins. Users cannot change their own role to 'admin'.
*   **Fields:**
    *   `name` (string, required)
    *   `email` (string, optional)
    *   `phone` (string, optional)
    *   `startDate` (string, optional)
    *   `awakeningScore` (number, optional)
    *   `hasSeenWarning` (boolean, required)
    *   `hasAcceptedTerms` (boolean, required)
    *   `isOnPath` (boolean, optional)
    *   `role` (string, default: 'client')

#### ➡️ 1A. User Logs Subcollection
Daily reflection logs and tracking, generated or entered daily.
*   **Path:** `/users/{userId}/logs/{logId}` (Where `logId` is usually `YYYY-MM-DD`)
*   **Access Rules:** Owner or Admin only.
*   **Fields:**
    *   `date` (string)
    *   `reflection` (string, optional)
    *   `energyLevel` (number, 1-5, optional)
    *   `awarenessLevel` (number, 1-5, optional)
    *   `completedActions` (map/object, optional)

#### ➡️ 1B. User Journey Subcollection
Stores states of long-term challenges or journeys (e.g., the 21 days reset).
*   **Path:** `/users/{userId}/journey/{docId}`
*   **Access Rules:** Owner or Admin only.

---

### 🌐 Posts Collection
Community feed, social sharing, and user engagement posts.
*   **Path:** `/posts/{postId}`
*   **Access Rules:**
    *   **Read:** Any authenticated user.
    *   **Create:** Any authenticated user (must be authored by them).
    *   **Update:** Author (or any authenticated user, if only updating `likes`).
    *   **Delete:** Author or Admins.
*   **Fields:**
    *   `author` (string, required)
    *   `authorId` (string, matches `auth.uid`, required)
    *   `avatar` (string, optional)
    *   `content` (string, < 2000 chars, required)
    *   `timestamp` (number, required)
    *   `likes` (number, optional)

#### ➡️ 2A. Post Comments Subcollection
Replies and conversations embedded inside a specific post.
*   **Path:** `/posts/{postId}/comments/{commentId}`
*   **Access Rules:** Read/Create by any authenticated user. Delete by Author or Admin.
*   **Fields:**
    *   `author` (string, required)
    *   `authorId` (string, matches `auth.uid`, required)
    *   `text` (string, < 500 chars, required)
    *   `timestamp` (number, required)

---

## 3. Roles and Admin Access

*   The system uses Role-Based Access Control (RBAC).
*   A user can be granted the `admin` role by manually setting `role: 'admin'` on their user document in the **Firebase Console**.
*   **Super Admin:** The email `chrislucena@gmail.com` is hardcoded as an Admin when their email is strictly verified.
*   Admin users bypass the "Owner Only" constraints and have global read/write/delete access across all users, logs, and posts.

---

## 4. Artificial Intelligence Services (Gemini API)

The backend logic for AI content generation acts dynamically through the **Google GenAI SDK** (located in `services/geminiService.ts`). It makes secure HTTP serverless calls to the Gemini models to compute data in real-time.

### Text & JSON Generation (Model: `gemini-3-flash-preview` and `gemini-3-pro-preview`)
*   **`generateDailyInsight()`**: Generates daily spiritual guidance, exercises (safe bioenergetics), and reflections (JSON response).
*   **`analyzeSoulJourney(logs)`**: Deep semantic analysis of the last 5 days of a user's logs to return an evolutionary insight.
*   **`generateDailyContent()`**: Generates nutrition plans free of gluten, dairy, sugar, and veg oils.
*   **`generateRecipeOptions(mealType)`**: Generates 5 dietary-compliant recipe variations.
*   **`generateFermentationRecipe()`**: Returns recipes for probiotic healing (Kefir, Kombucha, etc.).
*   **`generatePurificationTips()`**: Tips for natural biological purification.
*   **`generateAlchemistRecipe(ingredients)`**: Analyzes the user's available ingredients and creates a compliant custom recipe.
*   **`moderateContent(text)`**: Auto-moderation tool for social posts (checks for hate speech, spam, violence).

### Image Generation (Model: `gemini-2.5-flash-image`)
*   **`generateAppCover()`**: Dynamically prompts for mystical and atmospheric background artwork generation.

### Audio Generation (Model: `gemini-2.5-flash-preview-tts`)
*   **`generateSpeech(text, instruction)`**: Converts generated guided texts and instructions into a soothing audio narration using Text-to-Speech (Kore voice profile).