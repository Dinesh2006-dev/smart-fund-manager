# Backend API & Server

This folder contains the Node.js server, API routes, and database logic.

## 📂 Folder Structure

### `src/`
The core source code.

-   **`config/`**: Configuration files.
    -   `db.js`: Database connection setup (Knex.js with SQLite).
-   **`middleware/`**: Express middleware.
    -   `auth.js`: Handles JWT authentication and role-based access control (Admin vs User).
-   **`routes/`**: API Route definitions.
    -   `auth.routes.js`: Login/Register endpoints.
    -   `user.routes.js`: User management (Get profile, join funds).
    -   `fund.routes.js`: Fund management (Create, edit, delete, track).
    -   `payment.routes.js`: Payment processing and history.
    -   `dashboard.routes.js`: Aggregated data for dashboards.
-   **`services/`**: Business logic and helper functions.
    -   `balancservice.js`: Calculates fund balances, penalties, and payment schedules.
    -   `mailService.js`: Handles email notifications (OTP, Welcome emails).

### Root Files
-   **`index.js`**: The main entry point that starts the Express server.
-   **`database.sqlite`**: The SQLite database file (stores all data).
-   **`package.json`**: Lists dependencies (Express, Knex, Bcrypt, etc.).
