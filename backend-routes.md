# Backend Routes & Data Model (Firebase)

This application is completely "serverless" and client-side driven, meaning it does not have a traditional Express.js or Node.js backend. Instead, it interacts directly with Firebase services (Firestore Database & Firebase Authentication) from the client SDK (`firebase.ts`).

The "routes" are effectively the paths to collections and documents within the Firestore database, governed by security rules (`firestore.rules`).

---

## Authentication

Authentication is handled securely via Firebase Authentication.
The main provider being used is:
*   **Email and Password**

### Login Flow Constraints
*   The application does not allow "Account Creation/Sign Up" from the UI. It expects users to use specific credentials provisioned externally (e.g., via Hotmart/Firebase Admin).
*   Users must authenticate with their registered Email and Password.

---

## Firestore Database Routes / Collections

Access to these collections is restricted by Firestore Security Rules. All write operations validate schema and types before saving.

### 1. Users Collection

Contains user profiles and progression states.
*   **Path:** `/users/{userId}`
*   **Access:**
    *   **Read:** Only the owner (`userId == auth.uid`) or Admins.
    *   **Write:** Only the owner or Admins. Users cannot change their own role to 'admin'.
*   **Fields:**
    *   `name` (string)
    *   `email` (string, optional)
    *   `phone` (string, optional)
    *   `startDate` (string, optional)
    *   `awakeningScore` (number, optional)
    *   `hasSeenWarning` (boolean)
    *   `hasAcceptedTerms` (boolean)
    *   `isOnPath` (boolean, optional)
    *   `role` (string, default: 'client')

#### 1A. User Logs Subcollection
Contains daily reflection logs and tracking.
*   **Path:** `/users/{userId}/logs/{logId}` (Where `logId` is usually `YYYY-MM-DD`)
*   **Access:** Owner or Admin only.
*   **Fields:**
    *   `date` (string)
    *   `reflection` (string, optional)
    *   `energyLevel` (number, 1-5, optional)
    *   `awarenessLevel` (number, 1-5, optional)
    *   `completedActions` (map/object, optional)

#### 1B. User Journey Subcollection
*   **Path:** `/users/{userId}/journey/{docId}`
*   **Access:** Owner or Admin only.

---

### 2. Posts Collection

Contains social sharing and community engagement posts.
*   **Path:** `/posts/{postId}`
*   **Access:**
    *   **Read:** Any authenticated user.
    *   **Create:** Any authenticated user (must be authored by them).
    *   **Update:** Only the author (or any authenticated user, if only updating `likes`).
    *   **Delete:** Only the author or Admins.
*   **Fields:**
    *   `author` (string)
    *   `authorId` (string, matches `auth.uid`)
    *   `avatar` (string, optional)
    *   `content` (string, < 2000 chars)
    *   `timestamp` (number)
    *   `likes` (number, optional)

#### 2A. Post Comments Subcollection
Contains replies to posts.
*   **Path:** `/posts/{postId}/comments/{commentId}`
*   **Access:**
    *   **Read:** Any authenticated user.
    *   **Create:** Any authenticated user (must be authored by them).
    *   **Delete:** Only the author or Admins.
*   **Fields:**
    *   `author` (string)
    *   `authorId` (string, matches `auth.uid`)
    *   `text` (string, < 500 chars)
    *   `timestamp` (number)

---

## Roles and Admin Access

*   The system uses Role-Based Access Control (RBAC).
*   A user can be granted the `admin` role by manually setting `role: 'admin'` on their user document in the Firebase Console.
*   Additionally, the email `chrislucena@gmail.com` is hardcoded as an Admin when their email is strictly verified.
*   Admin users have global read/write/delete access across all users, logs, and posts.
