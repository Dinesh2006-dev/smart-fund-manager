# Smart Fund Manager

A comprehensive web application for managing community savings groups (Chit Funds).

## 📂 Project Structure

### `server/`
The backend API and database logic.
-   **`src/`**: Contains all source code including models, routes, and services.
-   **`database.sqlite`**: The local SQLite database file (not uploaded to git).
-   **`index.js`**: Main entry point for the Node.js server.

### `public/`
The frontend user interface.
-   **`admin/`**: Dashboard pages for Fund Managers (Create funds, track users).
-   **`user/`**: Dashboard pages for Members (View progress, make payments).
-   **`css/`** & **`js/`**: Styling and client-side logic.

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    cd server
    npm install
    ```
2.  **Start the Server:**
    ```bash
    npm start
    ```
3.  **Access the App:**
    Open `http://localhost:5000` in your browser.
