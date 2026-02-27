# Build Instructions

## Project Overview

**Project Type**: Pure Frontend (HTML + CSS + Vanilla JavaScript)  
**Build Tool**: None required — no compilation, no bundler  
**Runtime**: Any modern web browser (Chrome 90+, Edge 90+, Firefox 88+)  
**Storage**: `localStorage` (browser built-in)  
**Dependencies**: CDN-loaded libraries (no install required)

---

## Prerequisites

| Requirement | Detail |
|---|---|
| Web Browser | Chrome 90+ / Edge 90+ / Firefox 88+ |
| Internet (first load) | CDN libraries: Chart.js, SheetJS, jsPDF |
| VS Code (optional) | Live Server extension for local serving |
| No Node.js needed | Pure static files |

---

## "Build" Steps

This project has no compile step. "Building" means verifying all files are present and the folder structure is correct.

### 1. Verify Folder Structure

```
HeThongTracNghiem/
├── index.html              ← Student exam list (HOME)
├── login.html              ← Student login
├── register.html           ← Student registration
├── exam.html               ← Exam taking page
├── result.html             ← Exam result page
├── css/
│   ├── main.css
│   ├── auth.css
│   ├── exam.css
│   └── admin.css
├── data/
│   └── mock-data.js
├── js/
│   ├── data-service.js
│   ├── auth.js
│   ├── exam-service.js
│   ├── import-service.js
│   ├── statistics-service.js
│   ├── export-service.js
│   ├── main.js
│   ├── exam.js
│   ├── result.js
│   └── admin/
│       ├── dashboard.js
│       ├── exam-editor.js
│       ├── statistics.js
│       └── student-results.js
└── admin/
    ├── login.html
    ├── dashboard.html
    ├── exam-editor.html
    ├── statistics.html
    └── student-results.html
```

**Total files**: 28 application files (5 root HTML, 5 admin HTML, 4 CSS, 14 JS)

### 2. Launch the Application

**Option A — VS Code Live Server (Recommended)**
1. Open VS Code in `HeThongTracNghiem/` folder
2. Install Live Server extension (ritwickdey.LiveServer)
3. Right-click `login.html` → "Open with Live Server"
4. Browser opens at `http://127.0.0.1:5500/login.html`

**Option B — Direct File Open**
1. Open File Explorer → navigate to `HeThongTracNghiem/`
2. Double-click `login.html`
3. Opens in default browser with `file:///` URL
4. Note: Some browsers restrict `localStorage` on `file://` — use Live Server if issues occur

**Option C — Python HTTP Server**
```bash
cd HeThongTracNghiem
python -m http.server 8080
# Then open: http://localhost:8080/login.html
```

### 3. Verify CDN Dependencies Load

On first page load, open Browser DevTools (F12) → Network tab. Confirm these CDN scripts load (HTTP 200):
- `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js` — used on result.html, statistics.html
- `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js` — used on exam-editor.html
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` — used on statistics.html, student-results.html

If CDN fails (no internet), the charts and Excel/PDF features will not work. All other features work offline.

### 4. Verify localStorage Initialization

1. Open `login.html` in browser
2. Open DevTools (F12) → Application → Local Storage → `localhost` (or `127.0.0.1:5500`)
3. Confirm keys exist after page loads:
   - `httn_initialized` = `"true"`
   - `httn_users` = JSON array with 6 users
   - `httn_exams` = JSON array with 2 exams
   - `httn_results` = JSON array with 5 results

---

## Build Artifacts

| Artifact | Location | Description |
|---|---|---|
| Student App Entry | `login.html` | Main entry point |
| Admin App Entry | `admin/login.html` | Admin entry point |
| All Source Files | (as listed above) | Static files, no compilation output |

---

## Troubleshooting

### localStorage is empty / app doesn't load data
- **Cause**: `DataService.init()` did not run, or localStorage was cleared
- **Solution**: Hard-reload (Ctrl+Shift+R) to re-trigger init, or clear localStorage and reload

### "Cannot read properties of undefined" JS errors
- **Cause**: Script loading order issue — a service used before it was loaded
- **Solution**: Verify the `<script>` tags in the HTML follow this order: `mock-data.js` → `data-service.js` → `auth.js` → page-specific services → page controller

### Charts not rendering
- **Cause**: Chart.js CDN failed to load, or `canvas` element not found
- **Solution**: Check Network tab for CDN errors; confirm internet connection

### PDF export produces blank/broken file
- **Cause**: jsPDF CDN failed to load, or `window.jspdf` not available
- **Solution**: Check Network tab; try reloading the page

### Admin pages show 403 page
- **Cause**: Correct behaviour when accessing admin pages without admin session
- **Solution**: Login via `admin/login.html` with credentials `admin` / `admin123`

---

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Student 1 | `sv001` | `123456` |
| Student 2 | `sv002` | `123456` |
| Student 3 | `sv003` | `123456` |
| Student 4 | `sv004` | `123456` |
| Student 5 | `sv005` | `123456` |
