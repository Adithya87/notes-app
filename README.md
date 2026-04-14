# Markdown Notes Application

A full-stack notes app with Markdown editing, live preview, and persistent storage.

## Tech Stack
- **Frontend:** React.js (HTML, CSS, JS)
- **Backend:** Node.js (Express)
- **Database:** SQLite (SQL)

## Features
- Create, edit, delete, and list notes
- Markdown editor (headings, bold, italic, lists, code, links)
- Live split-screen preview
- Persistent storage in SQLite
- RESTful API
- Clean, modular code structure

## Bonus Features (if implemented)
- JWT authentication
- Search notes
- Tags/categories
- Dark mode
- Responsive design
- Debounced autosave
- Version history

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd notes-app
```

### 2. Install dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd ../frontend
npm install
```

### 3. Configure environment variables
- Copy `.env.example` to `.env` in the backend folder and update as needed.

### 4. Run database migrations
```sh
cd backend
```

### 5. Run locally
#### Backend
```sh
cd backend
npm start
```
#### Frontend
```sh
cd frontend
npm start
```

### 6. Deployment
- Deploy backend (Render/Railway)
- Deploy frontend (Vercel/Netlify)

### 7. Demo Video
- Record a 2–3 minute demo showing all features and code structure.

---

For more details, see `SDE_Fresher_Assignment.md`.
