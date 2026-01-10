# Vaia Form

A Vue 3 form application built with TypeScript, Vite, Firebase, and OpenAI integration.

## Prerequisites

Before running this project locally, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vaia
```

### 2. Install Dependencies

```bash
npm install
```


### 4. Run the Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Run on Network (Optional)

To access the development server from other devices on your network:

```bash
npm run host
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run host` - Start development server accessible on network
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint and auto-fix issues

## Project Structure

```
src/
├── assets/          # Static assets (fonts, images, styles)
├── components/      # Vue components
├── firebase/        # Firebase configuration and services
├── router/          # Vue Router configuration
├── stores/          # Pinia state management
├── typings/         # TypeScript type definitions
├── utils/           # Utility functions
└── views/           # Page components
```

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Firebase** - Backend services (Firestore, Functions)
- **OpenAI** - AI integration
- **Vue Router** - Client-side routing
- **CKEditor 5** - Rich text editing
- **SCSS** - CSS preprocessing

## Development Setup

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed)

### Type Support for `.vue` Imports

This project uses `vue-tsc` for TypeScript type checking with Vue single-file components. The Volar extension provides TypeScript language service support for `.vue` files in your editor.

## Building for Production

1. **Type check and build:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

The built files will be in the `dist/` directory, ready for deployment.

## Firebase Integration

The project is configured to work with Firebase services:
- **Firestore** - Database
- **Functions** - Serverless functions
- **Hosting** - Web hosting (configured in `firebase.json`)

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 5173 is busy, Vite will automatically use the next available port
2. **Node version**: Ensure you're using Node.js 18 or higher
3. **Dependencies**: If you encounter issues, try deleting `node_modules` and running `npm install` again

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the terminal output for build errors
3. Ensure all dependencies are properly installed
4. Verify your Node.js version meets requirements

## Configuration

For advanced configuration options, see:
- [Vite Configuration Reference](https://vite.dev/config/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
