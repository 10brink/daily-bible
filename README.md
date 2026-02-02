# Daily Bible Verse

A React web app that displays a different Bible verse each day, set against classical religious artwork.
<img width="337" height="729" alt="image" src="https://github.com/user-attachments/assets/72d4763b-8f52-4a06-964b-10c0a902c41c" />

## Features

- **Daily verse** - A new verse each day, deterministically selected based on date
- **Similar verses** - Discover thematically related verses using semantic embeddings
- **Classical art backgrounds** - Paintings by Michelangelo, Da Vinci, Bouguereau, and more
- **Full chapter links** - Click any reference to read the full chapter on BibleGateway (NKJV)

## Running locally

```bash
npm install   # Install dependencies
npm run dev   # Start development server
npm run build # Production build
```

## Tech stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI / shadcn components

## Verse analysis (optional)

The `src/analysis/` directory contains Python scripts for semantic analysis of verses using sentence-transformers. This powers the "Similar Verse" feature.

```bash
cd src/analysis
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python analyze_verses.py
```
