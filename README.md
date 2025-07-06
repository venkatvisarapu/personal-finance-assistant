# Personal Finance Assistant

This is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to help users track, manage, and understand their financial activities. It features AI-powered receipt scanning, data visualization, and a clean, multi-user interface.

---
## 🎥 Video Demonstration

**[Watch a full demonstration of the application on YouTube](https://www.youtube.com/watch?v=em9ORzS0rxg)**

---


## Features

-   **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
-   **Transaction Management**: Full CRUD (Create, Read, Update, Delete) functionality for income and expense entries.
-   **AI-Powered Receipt Scanning**: Users can upload a receipt (image or PDF), and the application uses the Gemini Vision API to automatically extract the merchant, date, and total amount for quick entry.
-   **Interactive Data Visualization**: An analytics dashboard with dynamic charts showing:
    -   Expenses by Category (Doughnut Chart)
    -   Income vs. Expense Summary (Bar Chart)
    -   Daily Expense Trend (Line Chart)
-   **Advanced Filtering & Pagination**: The main transaction list can be filtered by date range and is fully paginated to handle large datasets efficiently.
-   **Responsive Design**: A clean, modern UI that works seamlessly on both desktop and mobile devices.

---

## Tech Stack

-   **Frontend**: React (with Vite), React Router, Axios, Chart.js
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (with Mongoose)
-   **AI / OCR**: Google Gemini API for intelligent receipt analysis.
-   **Authentication**: JSON Web Tokens (JWT)
-   **File Handling**: Multer for file uploads

---

## Local Setup & Installation

### Prerequisites

-   Node.js (v16 or later)
-   npm / yarn
-   MongoDB (A cloud instance from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) is recommended)
-   Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    -   Create a `.env` file in the `backend` directory.
    -   Copy the following and fill in your values:
        ```.env
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=a_strong_secret_key_of_your_choice
        PORT=5001
        GEMINI_API_KEY=your_google_gemini_api_key
        ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Run the Application:**
    -   Open two terminal windows.
    -   In the first terminal, start the backend:
        ```bash
        cd backend
        npm run server
        ```
    -   In the second terminal, start the frontend:
        ```bash
        cd frontend
        npm run dev
        ```
    -   Open your browser and navigate to `http://localhost:3000`.

---