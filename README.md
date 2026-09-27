# 🔬 Reeflect – Research Archive

> "...reflect on the past, to assess the present and imagine the future." — Dr. Sylvia Earle

**Reeflect is an archive of research, scientific papers, studies and findings of researchers.** This archive and the data hosted will be developed into a searchable archive that will be simple, easy to use, and highly accessible to those that wish to use it.

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| 🔍 **Full-Text Search** | Search across all document content, metadata, references, and keywords |
| 🏷️ **Multi-Criteria Filtering** | Filter by title, researcher names, category, year, and subject |
| 🔗 **Connected Research** | Every document shows related and referencing research automatically |
| 🔄 **Adaptive Indexing** | New documents auto-integrate into search, filters, and keyword discovery |
| 📸 **Cover Previews** | First-page images displayed on cards and in hover popups |
| ⌨️ **Accessible** | WCAG 2.1 AA, keyboard navigation, screen reader support |
| 🔒 **OWASP Compliant** | All inputs sanitized against XSS, injection, and abuse |
| 📱 **Responsive** | Works on all devices from mobile to desktop |
| 🌙 **Dark Mode** | Toggleable theme with system preference detection |

---

## 📂 Repository Structure

```
├── index.html                  # Main Reeflect interface
├── styles.css                  # Design system (colorful, accessible)
├── app.js                      # Application logic & data loading
├── 404.html                    # Custom error page
├── .nojekyll                   # GitHub Pages compatibility
├── .gitignore
├── README.md
│
├── Research Papers/            # ⭐ SOURCE FOLDER for all research
│   ├── manifest.json           # Index of all documents
│   ├── doc-001.json            # Individual research documents
│   ├── doc-002.json
│   ├── ...
│   └── cover/                  # First-page images
│       ├── doc-001-cover.svg
│       ├── doc-002.svg
│       └── ...
│
└── utils/                      # Application modules
    ├── sanitizer.js            # OWASP input sanitization
    ├── searchEngine.js         # Full-text search & adaptive keywords
    ├── filterEngine.js         # Multi-criteria filtering
    ├── summaryGenerator.js     # Auto-generated summaries
    └── relatedDocuments.js     # Similarity & citation linking
```

---

## 📝 Adding New Documents

All research is sourced from the **`Research Papers/`** folder at the repository root.

### Step 1: Create the document JSON

Add a new file to `Research Papers/`:

```json
{
  "id": "doc-013",
  "title": "Your Research Title Here",
  "researchers": ["Dr. First Author", "Prof. Second Author"],
  "year": 2024,
  "publishedIn": "Journal Name, Vol. X(Y), pp. Z-W",
  "category": "Your Category",
  "subject": ["Subject 1", "Subject 2", "Subject 3"],
  "content": "Full text content of the research document. This is used for full-text search indexing and summary generation...",
  "references": ["doc-001", "doc-005"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "coverImage": "cover/doc-013-cover.svg"
}
```

### Step 2: Add a first-page cover image

Place an image (SVG, PNG, or JPG) in `Research Papers/cover/` and reference it in the `coverImage` field.

### Step 3: Update the manifest

Add an entry to `Research Papers/manifest.json`:

```json
{ "id": "doc-013", "file": "doc-013.json", "title": "Your Research Title Here" }
```

### Step 4: Push to GitHub

That's it! The new document will **automatically**:
- ✅ Appear in full-text search
- ✅ Be filterable by all criteria (title, researcher, category, year, subject)
- ✅ Show in related document suggestions
- ✅ Have its keywords added to the adaptive index
- ✅ Display in the document grid with cover image

---

## 🔍 Search Guide

### Basic Search
Simply type any keyword or phrase:
```
climate change
gene editing
neural networks
```

### Exact Phrase
Use double quotes:
```
"machine learning"
"dark matter"
```

### Filtered Search
Use prefixes for precise filtering:
```
category:physics
year:2023
researcher:johnson
subject:quantum
```

### Combined Search
Mix filters with keywords:
```
category:biology year:2023 gene
researcher:chen climate
```

### Advanced Filters Panel
Use the dropdown filters for:
- Title (partial match)
- Researcher names (partial match)
- Category (exact match)
- Year (exact match)
- Subject (exact match)

---

## 🔒 Security (OWASP Top 10)

All user inputs are sanitized following OWASP guidelines:

| Threat | Mitigation |
|--------|-----------|
| XSS (A03) | HTML entity encoding on all outputs, no eval(), CSP-ready |
| Injection (A03) | Input length limits, pattern validation, no raw SQL/command execution |
| Broken Access (A01) | Static site – no server-side access control needed |
| Security Misconfig (A05) | Minimal attack surface, no server-side processing |
| Vulnerable Components (A06) | No external dependencies, all code is self-contained |
| Known Vulns (A02) | All code audited, no known vulnerable patterns |
| Identity Mgmt (A07) | N/A – no authentication (by design) |
| Data Integrity (A08) | Input validation, type checking, schema validation |
| Logging (A09) | Client-side console logging for errors |
| SSRF (A10) | No server-side requests, fetch limited to same-origin |

---

## ♿ Accessibility (WCAG 2.1 AA)

- ✅ Skip navigation links
- ✅ Keyboard navigation (Tab, Enter, Space, Escape)
- ✅ ARIA labels, roles, and live regions
- ✅ Semantic HTML5 structure
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Focus indicators on all interactive elements
- ✅ Reduced motion support
- ✅ High contrast mode support
- ✅ Screen reader announcements for search results
- ✅ Alt text on all images
- ✅ Sufficient touch target sizes (44px minimum)

---

## 🚀 Deployment

### GitHub Pages (Recommended)

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)**
5. Click **Save**
6. Site goes live at `https://username.github.io/repo-name`

### Local Testing

Simply open `index.html` in a browser. No build step needed!

> ⚠️ Note: The `fetch()` API requires a web server. For local testing:
> ```bash
> # Python
> python -m http.server 8000
> 
> # Node
> npx serve .
> ```

---

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

---

## 📄 License

MIT License – Free to use, modify, and distribute.

---

*Built with ❤️ for open science, accessibility, and the future of research.*
