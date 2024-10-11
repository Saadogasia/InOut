# InOUt - Expense & Wallet Tracker 💼

**InOUt** is a simple and effective expense tracking app designed to help you manage your personal wallet. Track your income and expenses, categorize your transactions, and stay on top of your spending with ease. Built using **React Native** and powered by **Firebase**, InOUt provides secure and seamless financial tracking for users on the go.

## Features 🚀
- **Track Income & Expenses**: Log your daily transactions and manage your wallet efficiently.
- **Transaction History**: View and filter your past transactions easily.
- **Cross-platform**: Works on both Android and iOS devices.

## Technologies Used 🛠️
- **React Native**: For building a cross-platform mobile application.
- **Firebase**: Backend as a service for authentication and database storage.
  - **Firestore**: For storing and retrieving user data.
  - **Firebase Auth**: For handling user sign-up and login securely.

## Firebase Setup 🔧

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Set up Firestore and Firebase Authentication in your project.
3. Replace the Firebase configuration in `firebaseConfig` inside your project with your own Firebase credentials.

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

 Installation & Setup 📲

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/your-username/inout-expense-tracker.git

2. Navigate to the project directory:

   cd inout-expense-tracker

3. Install the dependencies:

   npm install

4. Run the app:

   npm start



