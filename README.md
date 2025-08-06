# Username Login App

A React Native app with user authentication and product management features.

## Features

### Authentication
- User login with username and password
- Persistent login state using AsyncStorage
- Secure logout functionality

### Product Management
- **User-specific products**: Each user can only see their own products
- **Create Product**: Add new products with name, description, and price
- **Product List**: View all products created by the logged-in user
- **Data Persistence**: Products are stored locally and persist between app sessions
- **User Isolation**: When a user logs out and another user logs in, only the new user's products are displayed

## How It Works

### User Authentication
1. Users enter their username and password on the login screen
2. Upon successful login, the user is redirected to the home screen
3. Login state is persisted using AsyncStorage
4. Users can logout, which clears their session and returns them to the login screen

### Product Management
1. **Home Screen**: Displays a welcome message and shows all products created by the current user
2. **Create Product Button**: Located in the top-right corner of the home screen
3. **Product Screen**: 
   - Form to create new products (name, description, price)
   - List of all products created by the current user
   - Real-time updates when products are created
4. **User Isolation**: 
   - Products are tied to specific users via userId
   - When switching users, only that user's products are displayed
   - Previous user's products are completely hidden from other users

## Technical Implementation

### Context Providers
- **AuthContext**: Manages user authentication state
- **ProductContext**: Manages user-specific product data

### Data Storage
- Uses AsyncStorage for persistent data storage
- Products are stored with userId association for user isolation
- Automatic cleanup when users logout

### Navigation
- Stack navigation between Login, Home, and Product screens
- Automatic navigation based on authentication state

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   ```bash
   npm run android
   # or
   npm run ios
   # or
   npm run web
   ```

## Usage

1. **Login**: Enter any username and password to login
2. **View Products**: See your products on the home screen
3. **Create Product**: Tap "Create Product" button to add new products
4. **Logout**: Use the logout button to switch users
5. **User Switching**: Login with different usernames to see user-specific products

## File Structure

```
├── context/
│   ├── AuthContext.tsx      # User authentication management
│   └── ProductContext.tsx   # Product data management
├── screens/
│   ├── LoginScreen.tsx      # Login interface
│   ├── HomeScreen.tsx       # Main dashboard with products
│   └── ProductScreen.tsx    # Product creation and management
└── App.tsx                  # Main app with navigation setup
```
