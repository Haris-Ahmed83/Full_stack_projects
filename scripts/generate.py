"""
======================================================
  FullStack Forge - Daily Project Generator
  Generates web/full-stack projects using Google Gemini AI.
  Writes into beginner/, intermediate/, advanced/ folders.
  Tracks progress in progress.json so no project is skipped.
  Author: HarisAhmed83
======================================================
"""

import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

from google import genai
from google.genai import types

GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
PROJECTS_PER_RUN = int(os.environ.get("PROJECTS_PER_RUN", "2"))

REPO_ROOT = Path(__file__).resolve().parent.parent
PROJECTS_FILE = REPO_ROOT / "scripts" / "projects.json"
PROGRESS_FILE = REPO_ROOT / "progress.json"

TOKEN_LIMITS = {
    "beginner":      6000,
    "intermediate": 10000,
    "advanced":     16000,
}


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def strip_fences(text: str) -> str:
    t = text.strip()
    t = re.sub(r"^```[a-zA-Z]*\n?", "", t)
    t = re.sub(r"\n?```$", "", t.strip())
    return t.strip()


def load_projects():
    with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"next_number": 1, "completed": [], "last_run": None}


def save_progress(progress: dict):
    PROGRESS_FILE.write_text(
        json.dumps(progress, indent=2) + "\n", encoding="utf-8"
    )


def call_gemini(client, prompt: str, max_tokens: int, retries: int = 12) -> str:
    last_err = None
    for attempt in range(retries):
        try:
            res = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )
            return res.text or ""
        except Exception as e:
            last_err = e
            err_str = str(e)
            is_transient = "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str or "500" in err_str
            if not is_transient and attempt >= 2:
                break
            wait = 30 * (2 ** attempt)
            wait = min(wait, 600)
            print(f"    WARN: Gemini call failed (attempt {attempt + 1}/{retries}): {err_str[:200]}")
            print(f"    Retrying in {wait}s ...")
            time.sleep(wait)
    raise RuntimeError(f"Gemini call failed after {retries} retries: {last_err}")


def detect_project_type(project: dict) -> str:
    name = project["name"].lower()
    concepts = project["concepts"].lower()
    if any(k in concepts for k in ["react", "jsx", "next.js", "typescript"]):
        return "react"
    if any(k in name for k in ["api", "node.js", "express", "graphql", "docker", "dockerize"]):
        return "node"
    if any(k in name for k in ["mern", "full stack"]):
        return "fullstack"
    if any(k in concepts for k in ["canvas", "webgl", "webrtc", "websocket", "d3.js"]):
        return "advanced-web"
    return "vanilla"


VANILLA_TEMPLATE_PROMPT = (
    "Write a complete, self-contained web project in THREE separate files: index.html, style.css, and script.js.\n\n"
    "STRICT REQUIREMENTS:\n"
    "1. index.html: valid HTML5 boilerplate, link style.css and script.js.\n"
    "2. style.css: modern CSS (flexbox/grid, custom properties, responsive).\n"
    "3. script.js: vanilla JavaScript, no frameworks/libraries unless essential.\n"
    "4. Beautiful, modern UI with proper spacing, colors, and typography.\n"
    "5. Must be fully functional when opened in a browser (no build step).\n"
    "6. Inline brief comments on non-trivial logic.\n"
    "7. Reasonable default/sample data if needed.\n\n"
)

REACT_TEMPLATE_PROMPT = (
    "Write a complete React application with the following files:\n"
    "- src/App.jsx (main component)\n"
    "- src/index.js (entry point)\n"
    "- package.json\n"
    "- index.html (in public/)\n\n"
    "STRICT REQUIREMENTS:\n"
    "1. Use Create React App style structure (react-scripts).\n"
    "2. Modern React with hooks (useState, useEffect, useContext, etc.).\n"
    "3. Clean component structure, import/export patterns.\n"
    "4. Beautiful CSS (CSS Modules or plain CSS files).\n"
    "5. Fully functional, no placeholder UI.\n"
    "6. Include all dependencies in package.json.\n"
    "7. Brief inline comments on complex logic.\n\n"
)

NODE_TEMPLATE_PROMPT = (
    "Write a complete Node.js application with:\n"
    "- package.json\n"
    "- src/index.js (or app.js, main entry point)\n"
    "- README.md with setup instructions\n\n"
    "STRICT REQUIREMENTS:\n"
    "1. Express.js for HTTP server unless specified otherwise.\n"
    "2. Proper error handling, middleware, and validation.\n"
    "3. Include a .env.example for required environment variables.\n"
    "4. Well-structured routes, controllers, models pattern.\n"
    "5. Include startup script in package.json.\n\n"
)


def generate_files(client, project: dict, max_tokens: int):
    ptype = detect_project_type(project)
    number = project["number"]
    category = project["category"]
    name = project["name"]
    concepts = project["concepts"]

    prompt_base = (
        f"Project #{number}: {name}\n"
        f"Category: {category}\n"
        f"Key Concepts: {concepts}\n\n"
    )

    if ptype == "react":
        prompt = REACT_TEMPLATE_PROMPT + prompt_base + (
            "Return a JSON object with keys: 'package.json', 'src/App.jsx', 'src/index.js', "
            "'public/index.html', and optionally any CSS files. "
            "Each value is the file content. Return ONLY valid JSON. No markdown fences."
        )
    elif ptype == "node" or ptype == "fullstack":
        prompt = NODE_TEMPLATE_PROMPT + prompt_base + (
            "Return a JSON object with keys for each file (e.g., 'package.json', 'src/index.js', etc.). "
            "Each value is the file content. Return ONLY valid JSON. No markdown fences."
        )
    else:
        prompt = VANILLA_TEMPLATE_PROMPT + prompt_base + (
            "Return a JSON object with keys: 'index.html', 'style.css', 'script.js'. "
            "Each value is the file content. Return ONLY valid JSON. No markdown fences."
        )

    raw = call_gemini(client, prompt, max_tokens)
    raw = strip_fences(raw)

    try:
        files = json.loads(raw)
    except json.JSONDecodeError:
        print(f"    WARN: Could not parse JSON response for #{number}, retrying with raw file generation...")
        files = generate_files_flat(client, project, ptype, prompt_base, max_tokens)

    return files, ptype


def generate_files_flat(client, project, ptype, prompt_base, max_tokens):
    files = {}
    if ptype == "react":
        for fname in ["package.json", "src/App.jsx", "src/index.js", "public/index.html"]:
            p = f"Write ONLY the content of '{fname}' for:\n\n" + prompt_base
            if fname.endswith(".json"):
                p += "\nReturn ONLY raw JSON. No markdown."
            elif fname.endswith(".jsx") or fname.endswith(".js"):
                p += "\nReturn ONLY raw code. No markdown."
            else:
                p += "\nReturn ONLY raw content. No markdown."
            files[fname] = strip_fences(call_gemini(client, p, max_tokens // 3))
    elif ptype == "node":
        for fname in ["package.json", "src/index.js"]:
            p = f"Write ONLY the content of '{fname}' for:\n\n" + prompt_base
            p += "\nReturn ONLY raw content. No markdown."
            files[fname] = strip_fences(call_gemini(client, p, max_tokens // 2))
    else:
        for fname in ["index.html", "style.css", "script.js"]:
            p = f"Write ONLY the content of '{fname}' for:\n\n" + prompt_base
            p += "\nReturn ONLY raw content. No markdown."
            files[fname] = strip_fences(call_gemini(client, p, max_tokens // 3))
    return files


def generate_readme(client, project: dict) -> str:
    prompt = (
        f"Write a professional README.md for this web project.\n\n"
        f"Project #{project['number']}: {project['name']}\n"
        f"Category: {project['category'].capitalize()}\n"
        f"Key Concepts: {project['concepts']}\n\n"
        f"Sections in order:\n"
        f"# Title (relevant emoji at end)\n"
        f"> one-line tagline\n\n"
        f"## Description (2-3 sentences)\n"
        f"## Features (5-7 bullets)\n"
        f"## Tech Stack (list technologies used)\n"
        f"## Key Concepts Demonstrated (bullets mapping to: {project['concepts']})\n"
        f"## Getting Started\n"
        f"- Open index.html in browser (or npm install && npm start for React/Node)\n"
        f"## Screenshots (placeholder note)\n"
        f"## Author\n"
        f"- HarisAhmed83 - https://github.com/Haris-Ahmed83\n\n"
        f"Part of the [Full_stack_projects](https://github.com/Haris-Ahmed83/Full_stack_projects) series.\n\n"
        f"Return ONLY markdown. No backticks wrapping."
    )
    return strip_fences(call_gemini(client, prompt, 2000))


def write_project_files(project_dir: Path, files: dict, project_type: str):
    for rel_path, content in files.items():
        full_path = project_dir / rel_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content.strip() + "\n", encoding="utf-8")


def generate_project(client, project: dict) -> Path:
    number = project["number"]
    category = project["category"]
    name = project["name"]
    slug = slugify(name)
    folder_name = f"{number:03d}-{slug}"
    project_dir = REPO_ROOT / category / folder_name

    print(f"\n--- Generating #{number:03d} [{category}] {name} ---")
    max_tokens = TOKEN_LIMITS[category]

    print("  Generating project files ...")
    files, ptype = generate_files(client, project, max_tokens)

    print("  Writing README.md ...")
    readme = generate_readme(client, project)

    write_project_files(project_dir, files, ptype)
    (project_dir / "README.md").write_text(readme + "\n", encoding="utf-8")

    print(f"  -> {category}/{folder_name} ({ptype})")
    return project_dir


def main():
    if not GEMINI_KEY:
        print("ERROR: GEMINI_API_KEY is not set.")
        sys.exit(1)

    projects = load_projects()
    progress = load_progress()
    start = progress["next_number"]
    total = len(projects)

    if start > total:
        print(f"All {total} projects already generated. Nothing to do.")
        return

    print(f"Starting from project #{start}. Will generate {PROJECTS_PER_RUN} project(s) this run.")
    print(f"Using model: {MODEL}")
    client = genai.Client(api_key=GEMINI_KEY)

    generated_numbers = []
    for i in range(PROJECTS_PER_RUN):
        number = start + i
        if number > total:
            break
        project = next((p for p in projects if p["number"] == number), None)
        if project is None:
            print(f"WARN: project #{number} not found in projects.json - stopping.")
            break
        generate_project(client, project)
        generated_numbers.append(number)

    if not generated_numbers:
        print("No projects generated this run.")
        return

    progress["next_number"] = generated_numbers[-1] + 1
    progress["completed"] = sorted(set(progress.get("completed", []) + generated_numbers))
    progress["last_run"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    save_progress(progress)

    print(f"\n=== Summary ===")
    print(f"Generated projects: {generated_numbers}")
    print(f"Next project number: {progress['next_number']} / {total}")
    print(f"Days completed: {len(progress['completed']) // 2} / {total // 2}")


if __name__ == "__main__":
    main()
