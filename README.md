# Low Code Platform

[中文版本](./README.zh.md) | English

## Overview

## Project Structure

```
low-code-platform/
├── backend/                 # Backend service
│   ├── src/
│   │   ├── db.ts           # SQLite database initialization
│   │   └── index.ts        # Express server entry point
│   └── data/
│       └── projects.db     # SQLite database file
│
└── frontend/               # Frontend application
    └── src/
        ├── components/     # Vue components
        │   ├── CanvasArea.vue         # Canvas area
        │   ├── RenderCanvasComponent.vue  # Component renderer
        │   ├── ComponentPanel.vue    # Left component panel
        │   ├── PropertyPanel.vue     # Right property panel
        │   └── useDragDrop.ts        # Drag-drop composable
        ├── stores/         # Pinia state management
        │   └── editor.ts   # Editor state store
        ├── composables/    # Vue composables
        ├── data/           # Static data
        │   └── component-definitions.ts  # Component definitions
        └── types/
            └── component.ts  # Component type definitions
```

## Tech Stack

- **Vue 3** - Frontend framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Pinia** - State management
- **Express.js** - Backend framework (not yet integrated)
- **better-sqlite3** - SQLite database (not yet integrated)

## Quick Start

```bash
# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`

## Features

- **Drag & Drop**: Drag components from left panel to canvas
- **Component Editing**: Click components to select and edit properties
- **Property Panel**: Modify padding, margin, text, styles on the right
- **Preview Mode**: Toggle preview to see final result
- **Export HTML**: Export canvas content as HTML file
- **Clear Canvas**: Reset the workspace

## Supported Components

| Component | Description |
|-----------|-------------|
| Text | Configurable content, font size, weight, color |
| Button | Configurable text, variant, size |
| Input | Text input with placeholder support |
| Textarea | Multi-line text input with resize |
| Image | Image with object-fit support |
| Link | Anchor with href and target |
| Divider | Horizontal separator |
| Container | Flex container for grouping |
| Row | Flex row layout |
| Card | Card container with padding |

## API Endpoints (Backend, Not Yet Integrated)

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | Get project list |
| GET | `/api/projects/:id` | Get single project |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Templates
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | Get template list |
| GET | `/api/templates/:id` | Get single template |
| POST | `/api/templates` | Create template |

## License

ISC
