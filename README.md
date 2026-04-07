# 🛡️ Zero-Inbox Dashboard

> ⚠️ **STATUS: ARCHIVED — Deprioritized**
>
> This project has been **superseded** by the [Zero-Inbox Engine CLI](https://github.com/yallabalaji/zero-inbox-engine), which now generates CSV reports directly — no web dashboard needed.
>
> **Will revisit in H2 2026** if a visual dashboard becomes necessary. The CLI + CSV approach covers the current workflow.

---

### What this was

A web-based dashboard (Vanilla JS + Chart.js) that visualized email analytics from the Zero-Inbox Engine. It connected to the Rust backend via a local dev server and rendered:

- Sender leaderboard with pagination
- Unsubscribe candidate tags
- Year-over-year email volume charts
- Real-time progress bar during scans

### Why it was archived

The project pivoted to a **pure CLI tool** that exports CSV files directly. This approach is:
- **Simpler** — no web server, no browser dependency
- **More portable** — single 2.7MB binary, runs anywhere
- **Better for analysis** — CSV opens in Excel, Google Sheets, or any data pipeline

### If picking this up later

1. The Rust engine now uses **in-memory SQLite** and outputs CSV instead of JSON
2. The old `analytics.json` API no longer exists
3. To resurrect this dashboard, you'd need to either:
   - Read from the CSV files directly
   - Add a JSON export flag back to the engine

---

> See the active project: [zero-inbox-engine](https://github.com/yallabalaji/zero-inbox-engine)
