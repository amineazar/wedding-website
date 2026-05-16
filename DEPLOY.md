# Deploy to Vercel

## One-time setup

### 1 — Install dependencies (first time only)
```bash
cd wedding-site
npm install
```

### 2 — Push to GitHub
Create a new (private) repo on GitHub, then:
```bash
git init
git add .
git commit -m "Wedding site"
git remote add origin https://github.com/YOUR_USERNAME/wedding-site.git
git push -u origin main
```

### 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New → Project**
3. Import your GitHub repo
4. Leave all settings as defaults — Vercel auto-detects Next.js
5. Click **Deploy**

Your site will be live in ~60 seconds at `https://wedding-site-xyz.vercel.app`.

---

## RSVP → Google Sheets (optional)

To receive RSVPs in a spreadsheet:

1. Create a Google Sheet
2. Go to **Extensions → Apps Script** and paste:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp, data.name, data.email, data.phone,
    data.attending, data.guestName, data.message
  ]);
  return ContentService.createTextOutput('OK');
}
```

3. Click **Deploy → New deployment → Web app** — set "Who has access" to **Anyone**
4. Copy the deployment URL
5. In `components/WeddingSite.js`, find the line:

```js
const SHEET_URL='YOUR_APPS_SCRIPT_URL_HERE';
```

Replace `YOUR_APPS_SCRIPT_URL_HERE` with your URL, then redeploy.

---

## Local preview
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
