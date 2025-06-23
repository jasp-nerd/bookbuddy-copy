# BookBuddy - Book Recommendation System

## Quick User Guide 📚

**Getting Started:** Enter any User ID and name to sign in (try the demo users!)

**Key Features:**
- **Click book thumbnails** to see details, reviews, and book info
- **Search** for books or browse popular ones on the homepage
- **Add books** to Favorites, Read, or Want to Read lists
- **Manage your library** - switch between collections and remove books
- **Chat with AI** for personalized book recommendations
- **Write reviews** and rate books 1-5 stars

## Features

BookBuddy is a digital library web application that allows users to manage their personal book lists, including books they have read, want to read, and their favorites. Users can search for books, get personalized recommendations, and write/read reviews. The app uses the Google Books API and integrates with Gemini AI for chat-based book recommendations.

## Prerequisites

### Backend Requirements
- **Python 3.8+** and pip
- **Google Books API Key** - Get one from [Google Cloud Console](https://console.cloud.google.com/)
- **Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/apikey)

### Frontend Requirements
- **Node.js 16+** and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/VU-Applied-Programming-for-AI-2025/hactics-jasp-nerd-omarouaissa-s2486-general-template
cd hactics-jasp-nerd-omarouaissa-s2486-general-template
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the root directory with the following keys:
```env
API_KEY=your_google_books_api_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Run the Backend
```bash
python backend/app.py
```
The backend will start on `http://127.0.0.1:5000/` by default.

### 3. Frontend Setup

#### Install Node.js Dependencies
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

#### Run the Frontend Development Server
```bash
npm start
```
The frontend will start on `http://localhost:3000/` by default.


## Troubleshooting

If you encounter database issues, delete the database file:
```bash
rm backend/instance/bookbuddy.db
```

Tested and made using WSL ubuntu. (Guaranteed working.)

