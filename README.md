# DevFlow — Professional Developer Productivity Workspace

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Deployment](https://img.shields.io/badge/deployment-GitHub%20Pages-success.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)

DevFlow is an all-in-one developer productivity workspace built with React 19, TypeScript, and Tailwind CSS. It unifies project roadmaps, Kanban task management, syntax-highlighted code snippets, Markdown developer notes, bookmarks, a Pomodoro focus timer with background time reconciliation, and productivity analytics.

Designed for modern software engineers, DevFlow runs 100% client-side with offline-first browser storage and can be deployed directly to **GitHub Pages** for free with zero runtime server costs.

---

## ✨ Features

- **📊 Dashboard:**
  - Real-time productivity metrics derived strictly from local records.
  - Active projects count, open tasks, completed tasks, and total focus hours.
  - Interactive productivity velocity chart (7d / 14d / 30d).
  - Today's priority tasks and upcoming deadlines.
  - Live activity audit log reflecting genuine application mutations.

- **📁 Project Management:**
  - Full CRUD operations with color tags, status tracking, start dates, and deadlines.
  - Dynamic completion progress calculated from associated tasks.
  - Repository URL validation with safe external navigation.
  - Safe deletion workflow (option to preserve child tasks or batch delete).

- **📋 Kanban & Task Management:**
  - Backlog, To Do, In Progress, and Done workflow columns.
  - Fluid drag-and-drop between columns with keyboard-accessible dropdown fallback.
  - List view with multi-faceted search, status, project, and priority filters.
  - Priority badges (Urgent, High, Medium, Low) and relative deadline indicators (Overdue, Due Today, Tomorrow).

- **💻 Code Snippet Library:**
  - Code storage with language classification (TypeScript, JavaScript, Python, SQL, Bash, HTML, CSS, JSON, Plaintext).
  - Secure tokenized syntax highlighting with line numbering.
  - 1-click clipboard copy with immediate visual confirmation.
  - Tag filtering and favorite bookmarking.

- **📝 Developer Notes:**
  - Responsive split-pane note editor with markdown preview mode.
  - Debounced autosave mechanism with live saving/saved status indicators.
  - Tagging and favorite pinning.
  - Safe markdown parsing preventing arbitrary script execution.

- **🔖 Developer Bookmarks:**
  - Categorized bookmarks (Documentation, GitHub, Articles, Tools, Inspiration, Other).
  - Strict HTTP/HTTPS protocol validation preventing `javascript:` and dangerous URI injection.
  - Domain extraction and secure external opening with `rel="noopener noreferrer"`.

- **⏱️ Focus Timer & Pomodoro:**
  - Singleton timer state preserved across tab transitions.
  - Timestamp reconciliation (`targetEndTime`) ensuring accurate countdown even when tabs are throttled in the background.
  - Association of focus blocks with specific projects and tasks.
  - Customizable focus, short break, and long break intervals.
  - Synthesized Web Audio API harmonic completion chimes (no external audio assets required).

- **📈 Productivity Analytics:**
  - Real metrics calculated from persistent workspace records.
  - Responsive SVG bar chart for daily focus activity.
  - Task priority distribution charts and project focus time breakdowns.

- **⚙️ Settings & Data Governance:**
  - Dark Mode, Light Mode, and System Theme synchronization.
  - Real-time browser `localStorage` usage gauge and quota monitor.
  - One-click JSON schema export for full backups.
  - Validated JSON import with diff comparison preview before applying changes.
  - Demo data clearly flagged with a 1-click purge button and reset option.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/devflow.git
cd devflow

# Install dependencies
npm install

# Start the local Vite development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Running Unit Tests

DevFlow uses [Vitest](https://vitest.dev/) to test business logic, URL security validators, and storage schema validations:

```bash
npm run test
```

### Production Build

```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

---

## 🌐 Deploying to Free GitHub Pages

DevFlow is designed specifically to work cleanly on GitHub Pages:
- Configured with `base: './'` in `vite.config.ts` so assets resolve properly on user or project page subpaths (`username.github.io/devflow/`).
- Uses hash-based routing (`#dashboard`, `#projects`, `#tasks`) so refreshing any page never triggers a 404 error on static hosts.
- Includes a fully automated GitHub Actions workflow in `.github/workflows/deploy.yml`.

### One-Time Setup Instructions:

1. Push your repository to GitHub on `main` or `master`.
2. Navigate to your repository on GitHub.
3. Go to **Settings** → **Pages** (in the left sidebar).
4. Under **Build and deployment** → **Source**, select **GitHub Actions**.
5. Push a commit or trigger the workflow manually from the **Actions** tab.
6. Once the workflow completes, GitHub will provide your live deployment URL (e.g., `https://<username>.github.io/<repo-name>/`).

---

## 🔒 Security & Architecture

- **No Remote Telemetry or Tracking:** Zero analytics scripts or third-party cookies.
- **Protocol Enforced:** All external repository and bookmark URLs require HTTP/HTTPS and explicitly reject `javascript:`, `data:`, and `file:` schemes.
- **Client-Side Data Ownership:** All workspace data resides in browser `localStorage` under `devflow_workspace_v1`. You own and control your data with exportable JSON schemas.
