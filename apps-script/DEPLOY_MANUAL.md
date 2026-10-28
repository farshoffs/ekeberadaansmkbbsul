# Manual Apps Script deployment

This project intentionally does not use `clasp`. The GitHub folder `apps-script/` is the canonical backend source.

## Important safety rules

- Use the EXISTING eKeberadaan Apps Script project. Do not create a new project.
- Do not delete or change Script Properties such as PIN pepper/session secrets.
- Keep the existing Web App deployment and publish a New Version so the `/exec` URL remains unchanged.
- Do not paste any secret into GitHub Pages.

## Critical migration warning

Google Apps Script compiles every `.gs` file in one shared global scope. The modular backend declares `const EK` in `00_Core.gs`. The old monolithic `Code.gs` also declared `EK`, so both cannot exist together with their old contents.

Before creating `00_Core`, first make an external backup of the old Apps Script source, then REMOVE or completely EMPTY every legacy `.gs` file that contains the previous backend code, especially `Code.gs`.

Renaming an old script file does not isolate it; any `.gs` file in the project is still compiled into the same global scope.

If you see:

`SyntaxError: Identifier 'EK' has already been declared (line 1, file "00_Core")`

there is still another `.gs` file in the Apps Script project declaring `EK`.

## Files to create/replace in Apps Script

Apps Script has no folders. Create Script files using these names (Apps Script adds `.gs`):

1. `00_Core`
2. `10_Auth`
3. `11_Sessions`
4. `20_UserApi`
5. `21_AdminApi`
6. `30_Reporting`
7. `40_UsersData`
8. `41_AttendanceData`
9. `42_Settings`
10. `50_Notifications`
11. `60_TimeReview`
12. `61_Absence`
13. `70_Profile`
14. `80_Utilities`
15. `90_Setup`
16. `95_Diagnostics`
17. `Bridges`

Create one HTML file named `Bridge` from `apps-script/Bridge.html`.

Replace the manifest with `apps-script/appsscript.json` and verify:

```json
"timeZone": "Asia/Kuala_Lumpur"
```

## Migration from the old monolithic backend

1. Back up the existing Apps Script source outside the project.
2. Remove or empty the old `Code.gs` and any other legacy `.gs` backend files before adding `00_Core`.
3. Keep Script Properties unchanged.
4. Create all modular `.gs` files listed above from `apps-script/`.
5. Add/update `Bridge.html`.
6. Replace `appsscript.json`.
7. `Index.html`, `Scripts.html`, `Styles.html` and `Logo.html` are no longer required by the backend because `doGet()` redirects normal visits to GitHub Pages. They may be kept temporarily; HTML files do not cause the `const EK` duplicate error.
8. Save the project.

At the end, the Apps Script project should contain no legacy backend `.gs` file alongside the modular files.

## Pre-deploy checks in Apps Script editor

Run these manually from the editor where applicable:

- `diagnoseLoginSecurity()` — existing security diagnostic.
- `diagnosePerformanceBackend()` — read-only performance/data-access diagnostic from `95_Diagnostics.gs`.

`diagnosePerformanceBackend()` must return `ok: true`, timezone `Asia/Kuala_Lumpur`, and timing/count information. It does not modify attendance or user data.

## Publish without changing the URL

Go to:

`Deploy -> Manage deployments -> existing Web App -> Edit -> New version -> Deploy`

Keep the existing execution/access configuration. Do not create a new deployment unless intentionally changing the backend URL.

## Post-deploy checks

1. Open the existing `/exec?bridge=1` endpoint and confirm it loads.
2. Open the GitHub Pages site.
3. Test returning-device/session resume.
4. Test DELIMa + PIN login.
5. Test one normal punch flow when operationally safe.
6. Test Kad Perakam Waktu Saya.
7. Test Tidak Hadir / Keberadaan.
8. As admin, test Semakan Lewat/Balik Awal and admin screen.
9. Re-run `diagnosePerformanceBackend()` and retain the timing output if comparing performance later.

If a problem appears before publishing a new version, do not deploy. If a deployed version regresses, Apps Script Manage deployments can be edited back to a previously known-good version.
