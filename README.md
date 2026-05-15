# fullstack-forge

> 180 Full-Stack Web Projects — from **Beginner** to **Advanced** — auto-generated daily by AI.

A hands-on collection of **180 full-stack web projects**, published **2 per day** over **90 days**. Every project lives in its own folder with complete source code and a project-specific `README.md`.

---

## Structure

```
fullstack-forge/
├── beginner/        # Projects   1 –  60 (Days  1–30)
├── intermediate/    # Projects  61 – 120 (Days 31–60)
└── advanced/        # Projects 121 – 180 (Days 61–90)
```

Each project folder:

```
NNN-project-slug/
├── index.html        (or src/ for React)
├── style.css
├── script.js         (or App.jsx for React)
├── package.json      (for Node/React projects)
└── README.md
```

---

## Tech Stack Progression

| Phase | Days | Projects | Focus |
|-------|------|----------|-------|
| **Beginner** | 1–30 | 1–60 | HTML5, CSS3, Vanilla JavaScript, DOM API |
| **Intermediate** | 31–60 | 61–120 | React, Node.js, Express, APIs, Firebase |
| **Advanced** | 61–90 | 121–180 | Full Stack MERN, WebSockets, WebRTC, Docker, GraphQL |

---

## How The Automation Works

- A **GitHub Actions** workflow (`.github/workflows/daily.yml`) runs twice daily at **10 AM PKT** and **11 AM PKT**.
- `scripts/generate.py` reads `scripts/projects.json` and `progress.json`, generates the next **2 projects** via Gemini AI, and commits them.
- `progress.json` tracks which projects have been generated so days can be skipped without duplicating work.
- Manually triggerable from the Actions tab (`workflow_dispatch`).

## Run Any Project Locally

**Vanilla HTML/CSS/JS:**
```bash
cd beginner/001-personal-portfolio-page
open index.html
```

**React / Node.js:**
```bash
cd intermediate/061-counter-app-react
npm install
npm start
```

---

## Author

**HarisAhmed83** — https://github.com/Haris-Ahmed83
