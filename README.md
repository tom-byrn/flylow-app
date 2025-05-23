# Flylow - Flight Price Tracker

Flylow is a modern web application built with **ReactJS** and **ViteJS** for finding the cheapest flights based on user preferences. It utilises a **flight price tracking API** to provide real-time data and allows users to save favourite flights, track price changes, and receive updates. The app supports user authentication with **Firebase** and offers both email/password and **Google sign-in options**.

---

## Features

- **Flight Search**: Search flights by specifying origin, destination, and dates.
- **Nearby Airports**: Option to include nearby airports for more flexibility.
- **Authentication**: Secure sign-up and sign-in using **Firebase Authentication**.
- **Google Sign-In**: Quick access with Google accounts.
- **Price Tracking**: Calculates the best time to buy tickets based on price trends.
- **Save Favourites**: Save flights to a favourites list using **Firestore Database**.
- **Responsive Design**: Mobile-friendly interface with **Tailwind CSS**.

---

## Technologies Used

- **Frontend**: ReactJS, ViteJS, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **API Integration**: Sky-Scrapper API via **Axios**
- **State Management**: React Hooks (`useState`, `useEffect`)
- **Routing**: React Router DOM

---

## Setup and Installation

### 1. Clone the Repository
```
git clone https://github.com/username/flylow.git
cd flylow
```

### 2. Install Dependencies
```
npm install
```

### 3. Create a .env File for RapidAPI & Firebase API Keys
```
REACT_APP_RAPIDAPI_KEY=...
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

### 4. Run the Development Server
```
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

