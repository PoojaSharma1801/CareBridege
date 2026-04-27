# CareBridge Frontend

A modern, responsive healthcare platform frontend built with React and Bootstrap.

## Features

- 🏥 **Healthcare-focused Design**: Clean, professional interface optimized for healthcare applications
- 🔐 **Secure Authentication**: Login and signup with form validation
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX**: Gradient backgrounds, smooth animations, and intuitive interactions
- 🔥 **Firebase Ready**: Pre-configured for Firebase Authentication integration

## Technologies Used

- **React 18**: Modern React with hooks
- **Bootstrap 5**: Responsive CSS framework
- **CSS3**: Custom animations and gradients
- **HTML5**: Semantic markup
- **JavaScript ES6+**: Modern JavaScript features

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Features Overview

### Authentication System
- **Login Form**: Email and password authentication
- **Signup Form**: Registration with full name, email, phone, and password
- **Form Validation**: Real-time validation and error handling
- **Loading States**: Visual feedback during API calls
- **Tab Navigation**: Smooth switching between login and signup

### Design Elements
- **Gradient Backgrounds**: Modern purple-blue gradient
- **Glass Morphism**: Frosted glass effect on cards
- **Hover Effects**: Interactive elements with smooth transitions
- **Responsive Layout**: Mobile-first design approach
- **Professional Typography**: Clean, readable fonts

### User Experience
- **Intuitive Navigation**: Clear tab-based interface
- **Visual Feedback**: Loading spinners and success/error messages
- **Accessibility**: Semantic HTML and proper form labels
- **Performance**: Optimized for fast loading

## Project Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── App.css            # Custom styles and animations
│   ├── App.js             # Main application component
│   └── index.js           # React DOM entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Customization

### Colors and Theme
The application uses a healthcare-appropriate color scheme:
- Primary: Blue gradients (#4facfe to #00f2fe)
- Background: Purple gradients (#667eea to #764ba2)
- Success: Green (#d4edda)
- Error: Red (#f8d7da)

### Firebase Integration
To integrate Firebase Authentication:

1. Create a Firebase project at https://console.firebase.google.com
2. Add your Firebase config to a new `firebase.js` file
3. Update the authentication functions in `App.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
