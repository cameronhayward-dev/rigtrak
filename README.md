# RigTrak — Web App

RFID asset & compliance tracking for rigging gear. This is the Next.js (App Router,
TypeScript) port of the `index_36.html` proof-of-concept, which remains in the repo
root as the reference for behaviour and styling.

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build
```

## Structure

| Path | What lives there |
| --- | --- |
| `app/globals.css` | The PoC's stylesheet, carried over unchanged so the design is identical |
| `lib/firebase.ts` | Firestore collections, plus the RigTrak ID counter transaction |
| `lib/types.ts` | The data model (assets, schedules, inspectors, checkouts, company) |
| `lib/helpers.ts` | Date parsing, compliance derivation, image shrinking |
| `lib/exports.ts` | PDF (jsPDF) and Excel (SheetJS) exports |
| `lib/importFile.ts` | Register file (CSV/XLSX) column detection and parsing |
| `context/store.tsx` | All Firestore listeners, UI state, and mutations |
| `components/` | Views and modals |

## Notes carried over from the PoC

- **One scan listener, one active mode.** Every scan from the reader passes through
  a single dispatcher in `context/store.tsx` and is routed by whichever mode is
  active (Scan Mode, Check, Check Out, Check In, Hunt). Starting any mode stops the
  previous one, so a scan can never be picked up by two features at once.
- **Scan backlog.** The first snapshot of the `scans` collection is treated as old
  and marked handled without reacting to it; only scans arriving afterwards are
  dispatched. Timestamps are not compared — the reader app writes its own format.
- **Location seeding is guarded.** The locations listener only seeds defaults once
  per session, and only when Firestore confirms the empty list is settled data
  (`!fromCache && !hasPendingWrites`). Without that guard the momentarily-empty
  first paint creates duplicate locations.
- **`complianceDate` / `lastChecked` are derived.** An asset can carry several
  inspection schedules plus a retirement date; these two fields hold the soonest
  next-due and the most recent inspection, so cards, stats, reports and exports
  keep working off a single value.
- **Imports are always untagged.** EPC is never read from a register file even if
  the column exists — tags are linked later by scanning on site.
- **Images live inside records.** Firestore caps records at 1MB, so asset photos
  (800px) and the company logo (400px) are shrunk and re-compressed before saving.

## Port-specific decisions

- `jspdf` and `xlsx` are loaded with dynamic `import()` inside the export functions,
  so they stay out of the initial bundle and never run during server prerender.
- Tabler icons are loaded from the same CDN stylesheet the PoC used, via `app/layout.tsx`.
- The PoC avoided re-rendering the schedule editor while typing a date (it rebuilt the
  input under the user). React controlled inputs make that unnecessary — state is the
  source of truth, so `AssetModal` re-renders freely.
