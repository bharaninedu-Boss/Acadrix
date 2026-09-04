# Acadrix Website Improvements Roadmap

## Current Status
- **Latest PR:** UX follow-up (search keyboard navigation, unit deep-linking, download buttons)
- **Main branch:** Basic hash routing, department/semester/subject browsing
- **Coverage:** Only Mechanical Engineering has data; other 5 departments need JSON files

---

## Priority 1: Quick Wins (1-2 hours)

### 1.1 Mobile Menu Auto-Close ✅ READY
**Problem:** Mobile hamburger menu stays open after navigation  
**Impact:** Better mobile UX, fewer accidental clicks  
**File:** `script.js` - in `navigateTo()` function

```javascript
function navigateTo(view, params = {}, fromHash = false) {
    currentState = { view, ...params };
    // Close mobile menu after navigation
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('open');
    // ... rest of code
}
```

### 1.2 Search "No Results" Message ✅ READY
**Problem:** Search shows nothing when no matches; users confused  
**Impact:** Clear feedback, better UX  
**File:** `script.js` - in `handleSearch()` function around line 589

```javascript
// After line 589, add:
if (matches.length === 0 && resultsDiv) {
    resultsDiv.innerHTML = `<div class="search-item" style="text-align:center;padding:20px;color:var(--text-secondary)">
        <p><strong>No results found</strong></p>
        <p>Try searching by:</p>
        <small>• Subject code (e.g., ME4301)</small><br>
        <small>• Subject name</small><br>
        <small>• Unit topic</small>
    </div>`;
    resultsDiv.style.display = 'block';
    return;
}
```

### 1.3 Dynamic Meta Tags (SEO) ✅ READY
**Problem:** Social media shares don't show subject details  
**Impact:** Better SEO, shareable links  
**File:** `index.html` & `script.js`

Add function to update meta tags in `script.js`:

```javascript
function updateMetaTags(title, description) {
    document.title = title;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = description;
}

// Call in renderSubjectDetails:
const metaTitle = `${subject.name} (${subject.code}) - AU Notes`;
const metaDesc = `${subject.name} study materials: notes, PYQs, question bank, and videos for Anna University`;
updateMetaTags(metaTitle, metaDesc);
```

### 1.4 Resource Count Badge ✅ READY
**Problem:** Users don't know if a subject has complete materials  
**Impact:** Clear resource status  
**File:** `script.js` - in `renderSubjectDetails()`

```javascript
function getResourceCount(subject) {
    let count = 0;
    if (subject.units) count += subject.units.filter(u => u.notes || u.link).length;
    if (subject.pyqs) count += Array.isArray(subject.pyqs) ? subject.pyqs.length : 1;
    if (subject.questionBank) count++;
    if (subject.importantQuestions) count++;
    if (subject.formulaSheet) count++;
    if (subject.solvedProblems) count++;
    if (subject.videos) count += subject.videos.length;
    return count;
}

// Add to subject header in HTML:
const resourceCount = getResourceCount(subject);
const resourceText = `${resourceCount} resource${resourceCount !== 1 ? 's' : ''} available`;
```

---

## Priority 2: Medium Effort (2-4 hours)

### 2.1 Data Population for Other Departments
**Problem:** Only Mechanical Engineering populated; CSE, ECE, EEE, IT, Civil are empty  
**Impact:** Immediate 6x content increase  
**Steps:**
1. Extract text from `B.E.Mech.pdf` as template
2. Create `data/computer/sem1.json`, `data/electronics/sem1.json`, etc.
3. Use this template structure:

```json
[
  {
    "code": "CS4301",
    "name": "DATA STRUCTURES",
    "updated": "2026-09-04",
    "units": [
      { "name": "Arrays and Linked Lists", "notes": null },
      { "name": "Stacks and Queues", "notes": null }
    ],
    "pyqs": [],
    "videos": [],
    "questionBank": null,
    "importantQuestions": null,
    "formulaSheet": null,
    "solvedProblems": null
  }
]
```

4. Gradually populate PDFs as they're added to `data/computer/`, `data/electronics/`, etc.

### 2.2 Resource Availability Filter
**Problem:** No way to browse only "complete" subjects  
**Impact:** Better content discoverability  
**File:** `script.js` - new function + UI

```javascript
function renderSubjects(container, deptId, sem) {
    // Add filter buttons:
    // <button>All Subjects</button>
    // <button>With Notes</button>
    // <button>Complete (All Resources)</button>
}
```

### 2.3 Search Performance (Debounce & Cache)
**Problem:** Search rebuilds index every time; lag on first search  
**Impact:** Faster search, better UX  
**File:** `script.js`

```javascript
let searchDebounceTimer = null;

function handleSearch() {
    clearTimeout(searchDebounceTimer);
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim();
    
    if (query.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        return;
    }
    
    searchDebounceTimer = setTimeout(() => {
        // perform search
    }, 300);
}
```

### 2.4 Recently Updated Badge
**Problem:** "Recently Added" only shows if updated date exists; no visual highlight  
**Impact:** Better content discoverability  
**File:** `style.css` - add new class

```css
.recently-added-badge {
    display: inline-block;
    background: #10b981;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 8px;
}
```

---

## Priority 3: Polish & Advanced (4-8 hours)

### 3.1 Content Statistics Dashboard
**Problem:** No way to see what's been completed  
**Impact:** Transparency; motivation to populate more content  
**New route:** `#/stats` or footer widget

```
✅ 1 Department loaded
📚 20 Subjects organized
📄 45 Unit notes available
📝 8 Previous year questions
🎥 12 Video resources
🎯 70% content complete
```

### 3.2 Bulk Download per Semester
**Problem:** Users can't download all materials for offline study  
**Impact:** Works for low-bandwidth users  
**Complexity:** Need to generate ZIP files (use JSZip library)

```javascript
// Add button: "Download All Resources (ZIP)"
// Generate zip of all PDFs for selected semester
```

### 3.3 Offline Support (Service Worker)
**Problem:** App doesn't work without internet  
**Impact:** Reliable access  
**Complexity:** High; requires service worker registration

### 3.4 Admin Panel (JSON Editor)
**Problem:** Content management requires Git knowledge  
**Impact:** Non-technical users can add/edit data  
**Route:** `#/admin` - password protected
**Features:**
- Edit subject JSON in-browser
- Preview changes live
- Export as JSON

### 3.5 PDF Metadata Extraction
**Problem:** Extracting syllabus topics manually is tedious  
**Impact:** Faster content population  
**Complexity:** High; requires PDF parsing library

---

## Priority 4: Community Features (Future)

### 4.1 Ratings & Reviews
- Add "helpful" buttons to resources
- Show which resources are most used

### 4.2 Contributions
- Allow students to upload study materials
- Community-driven content

### 4.3 Discussion Forum
- Q&A per subject
- Student collaboration

### 4.4 Analytics
- Track most searched subjects
- Popular topics
- Drop-off points

---

## Quick Implementation Checklist

### Merge PR #1 First ✅
- [x] Keyboard search navigation
- [x] Unit deep-linking
- [x] Download buttons for PDFs
- [ ] Review & test on mobile
- [ ] Merge to main

### Then Implement Priority 1 (This Week)
- [ ] Mobile menu auto-close
- [ ] Search "no results" message
- [ ] Dynamic meta tags
- [ ] Resource count badge

### Week 2
- [ ] Populate CSE Sem 1-2 JSON
- [ ] Populate ECE Sem 1-2 JSON
- [ ] Add resource availability filter
- [ ] Search debounce/cache

### Week 3+
- [ ] Complete remaining departments
- [ ] Statistics dashboard
- [ ] Admin panel (if needed)

---

## Testing Checklist

Before each deploy, verify:
- [ ] Search works with 2+ characters
- [ ] Search results show with keyboard (ArrowUp/Down/Enter)
- [ ] Mobile menu closes on navigation
- [ ] Dark mode theme persists
- [ ] Subject detail pages load without errors
- [ ] PDF links open in new tab
- [ ] Breadcrumbs navigate correctly
- [ ] Mobile responsive (320px, 768px, 1200px widths)

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `script.js` | Auto-close menu, no-results, meta tags, resource count, debounce | 1-2 |
| `style.css` | Badge styles, resource count display | 1 |
| `index.html` | Meta tag hooks for dynamic updates | 1 |
| `data/*/sem*.json` | Populate other departments | 2-3 |
| New: `admin.html` | Admin JSON editor (optional) | 3 |
| New: `.github/workflows/validate.yml` | JSON validation on commit | 2 |

---

## Notes
- Keep design consistent with current theme (light/dark mode)
- Test on mobile (iOS Safari, Chrome Android)
- Accessibility: maintain keyboard navigation, ARIA labels
- Performance: lazy-load large datasets
- SEO: update meta tags dynamically

