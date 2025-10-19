# Universal Ternary Logic Gates Documentation

A Next.js documentation site showcasing all 3,774 universal operators for ternary (3-valued) logic.

## Features

- **Color-coded truth tables** - Each ternary value (0, 1, 2) has a distinct color
- **Visual grid layout** - All gates displayed in an organized grid
- **Responsive design** - Works on all screen sizes
- **Fast performance** - Built with Next.js App Router
- **Pagination** - 60 gates per page for optimal loading speed

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Structure

- `/` - Home page with overview and statistics
- `/gates` - View all 3,774 universal gates with color-coded truth tables

## Color Legend

- **Blue** - Value 0
- **Green** - Value 1
- **Purple** - Value 2

## About Ternary Logic

Ternary logic extends binary logic by introducing a third value, allowing for more nuanced logical operations. A universal gate is one that can be used to implement any other logical function through composition.

This collection contains all 3,774 universal binary operators (gates with 2 inputs and 1 output) for ternary logic systems.

## Generate Gates

To regenerate all 3,774 gate JSON files from scratch:

```bash
python generate_gates.py
```

This will compute all universal ternary operators and save them to the `gates/` directory.

## Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Font:** Geist Sans & Geist Mono
- **Gate Generation:** Python (generate_gates.py)
