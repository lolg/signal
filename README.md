# Signal — lightweight ODI / JTBD survey collector

**Signal** is a tiny, self-hosted survey app for Outcome-Driven Innovation (ODI) and Jobs-To-Be-Done (JTBD) research.

## 🤔 Why Signal?

| Problem | Signal’s antidote |
|---------|-------------------|
| *“I spend hours turning outcomes into survey questions.”* | **Outcome-in, Question-out** — just list outcomes in `outcomes.json`; the app auto‑phrases the two rating prompts. |
| *“Respondents get lost in a 100‑row matrix.”* | **Category‑aware flow** — add a `category` ID and Signal pages outcomes one logical section at a time, with a progress indicator. |
| *“Raw exports need a weekend of VLOOKUP.”* | **Analysis‑ready JSON** — each rating is saved as a clean row in `responses.json`, perfect for PCA, clustering, opportunity scoring. |
| *“We already capture meta-data elsewhere.”* | **Token links** — use your CRM / panel to mint tokens + meta; Signal just handles the ratings. |

Put simply: **stay in outcome‑land**; Signal handles the form mechanics.

---

## ✨ What you get

- Zero‑bloat setup — drop in JSON, share link, collect data  
- Clean two‑column 5‑point scale (Importance / Satisfaction)  
- Category paging + progress indicators  
- Welcome & thank‑you screens (uses respondent name if provided)  
- Single‑use token access  
- Dynamic time estimate  
- Flat‑file config, no DB required  
- Output: `server/responses.json` (array)
- Mobile-friendly by default — the card layout stacks gracefully on phones, so respondents can rate outcomes on the go.  
- Share via one-time token links — just email each participant a unique URL (`?token=abc123`) and Signal handles the rest.
- Tool-chain friendly — tokens carry the respondent ID; all other customer meta-data stays in your CRM. Join on respondentId after export for flexibility.

Built with:

- ⚛️ React (Vite)  
- 🐍 Flask (API)  
- 📄 JSON config files  
- 🔑 Token auth header

---

## 🖼 UI Preview

![Survey UI screenshot](screenshots/survey-example.png)

---

## 🚀 Quick start

```bash
git clone https://github.com/YOUR_USERNAME/signal.git
cd signal

# 🔧 backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python server/app.py

# 🎨 frontend
cd client
npm install
npm run dev
```

Visit `http://localhost:5173/?token=abc123`, start rating, then grab `server/responses.json`.

---

## 🔐 Token model

```json
{
  "abc123": { "respondentId": "r001", "name": "Alice Becker" },
  "def456": { "respondentId": "r002" }
}
```

Distribute links such as `https://yourdomain.com/?token=abc123`

---

## 📂 Config files

| File | Purpose |
|------|---------|
| `outcomes.json` | Outcome statements + category IDs |
| `categories.json` | Category title / subtitle text |
| `survey-meta.json` | Global survey title & subtitle |
| `strings.json` | UI labels & button text |
| `tokens.json` | Token → respondent map |

---

## 💾 Output

`server/responses.json`

```json
[
  {
	"timestamp": "2025-07-31T12:34:56Z",
	"respondentId": "r001",
	"outcomeId": "42",
	"importance": 4,
	"satisfaction": 2
  }
]
```

---

## 📦 Project layout
```
signal/
├── client/
│   └── src/App.jsx
├── server/
│   ├── app.py
│   ├── outcomes.json
│   ├── categories.json
│   ├── survey-meta.json
│   ├── strings.json
│   └── tokens.json
└── responses.json
```

---

## ☁️ Free deployment

**Backend → Render**

| Setting | Value |
|---------|-------|
| Runtime | Python 3 |
| Build   | `pip install -r requirements.txt` |
| Start   | `python app.py` |
| Env var | `PORT=5000` |

**Frontend → Netlify / Vercel / GH Pages**

```bash
cd client && npm run build
# deploy contents of client/dist
```

---

## 📚 Learn the full workflow

See **[Practical Outcome‑Driven Innovation](https://redlandroad.com/2024/05/27/practical-outcome-driven-innovation/)** for the PCA + clustering notebook.

---

## 🪪 License

MIT — fork, tweak, ship.  
Smaller feedback loops → better products.