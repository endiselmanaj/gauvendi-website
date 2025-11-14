# GauVendi ChatGPT App - Architecture Website

A two-page React website showcasing the GauVendi ChatGPT App architecture and technical implementation details.

## Overview

This website presents:
- **Architecture Overview** - High-level architecture, business value, and implementation approach
- **Technical Details** - Comprehensive technical specifications including database schema, MCP server implementation, and web component specifications

## Technology Stack

- **React 18+** - Frontend framework
- **React Router 6** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **Vite 5** - Build tool and development server

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## Installation

1. Navigate to the project directory:
```bash
cd gauvendi-website
```

2. Install dependencies:
```bash
npm install
```

## Running the Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## Building for Production

Create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
gauvendi-website/
├── src/
│   ├── components/
│   │   └── Navigation.jsx      # Navigation bar component
│   ├── pages/
│   │   ├── ArchitectureOverview.jsx  # Main architecture page
│   │   └── TechnicalDetails.jsx      # Technical implementation page
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind directives
├── index.html                 # HTML template
├── package.json               # Project dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # This file
```

## Features

### Architecture Overview Page
- Executive summary and solution overview
- MCP tool capabilities
- Architecture component diagrams
- Key differentiators
- Business value proposition
- Example user journey
- Technology stack and implementation approach

### Technical Details Page
- Comprehensive database schema specifications
- MCP server implementation details
- Web component specifications
- Data flow and integration patterns
- Error handling and validation rules
- Complete feature code master list
- Technical glossary

## Navigation

The website includes a navigation bar that allows seamless switching between:
- **Architecture Overview** - `/`
- **Technical Details** - `/technical`

## Styling

The website uses Tailwind CSS with custom styling including:
- Responsive design for mobile, tablet, and desktop
- Custom color scheme with GauVendi branding
- Prose styling for readable documentation
- Interactive components with hover states
- Professional typography and spacing

## Browser Support

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is proprietary to GauVendi.

## Contact

For questions or support, please contact the GauVendi technical team.
