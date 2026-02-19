# Frontend Interface

This folder contains the static HTML, CSS, and JavaScript files for the user interface.

## 📂 Folder Structure

### `admin/`
Pages for Fund Managers (Admins).
-   **`dashboard.html`**: Main overview of all funds and system health.
-   **`funds.html`**: Create and manage savings funds.
-   **`users.html`**: Manage members (Approve, delete, view details).
-   **`tracking.html`**: Detailed monthly tracking grid for each fund.
-   **`user_report.html`**: Printable financial report for individual members.

### `user/`
Pages for Members (Users).
-   **`dashboard.html`**: view joined funds, upcoming payments, and notifications.
-   **`passbook.html`**: Detailed transaction history and passbook download.

### `css/`
-   **`style.css`**: Global styles, including dark mode, responsive layouts, and print styles.

### `js/`
-   **`api.js`**: Centralized API handler. Manages authentication tokens and API requests to the backend.

### Root Files
-   **`index.html`**: The Landing Page / Login Page.
