// Main Application Module - Reeflect Research Archive
// Ties together all components with OWASP-compliant security
// Sources documents from Research Papers repository

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // Initialize all components
  initializeSearchEngine();
  setupEventListeners();
  populateFilterOptions();
  renderDocuments(DOCUMENTS);
  setupThemeToggle();
  
  console.log('Reeflect initialized - Research Papers archive loaded');
}

// Initialize search engine with documents from Research Papers
function initializeSearchEngine() {
  SearchEngine.initialize(DOCUMENTS);
}

// Setup all event listeners
function setupEventListeners() {
  // Search form
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearSearch');
  
  searchForm.addEventListener('submit', handleSearch);
  searchInput.addEventListener('input', handleSearchInput);
  clearButton.addEventListener('click', clearSearch);
  
  // Filter buttons
  const applyFiltersBtn = document.getElementById('applyFilters');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const toggleFiltersBtn = document.getElementById('toggleFilters');
  
  applyFiltersBtn.addEventListener('click', applyAllFilters);
  resetFiltersBtn.addEventListener('click', resetAllFilters);
  toggleFiltersBtn.addEventListener('click', toggleFilterPanel);
  
  // Filter inputs - apply on change
  ['filterTitle', 'filterResearcher', 'filterCategory', 'filterYear', 'filterSubject'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', applyAllFilters);
      element.addEventListener('input', debounce(applyAllFilters, 500));
    }
  });
  
  // Modal close
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.querySelector('.modal-overlay');
  
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Hover tooltip
  setupHoverTooltips();
}

// Handle search input changes
function handleSearchInput(e) {
  const clearButton = document.getElementById('clearSearch');
  const value = e.target.value;
  
  // Show/hide clear button
  clearButton.style.display = value ? 'flex' : 'none';
  
  // Debounced search
  debounceSearch(value);
}

// Debounced search function
let searchTimeout;
function debounceSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(query);
  }, 300);
}

// Perform search
function performSearch(query) {
  const sanitizedQuery = Sanitizer.sanitizeSearchInput(query);
  
  if (!sanitizedQuery) {
    // Reset to show all documents from Research Papers
    FilterEngine.resetFilters();
    renderDocuments(DOCUMENTS);
    updateResultsCount(DOCUMENTS.length);
    return;
  }
  
  // Get search results
  let results = SearchEngine.search(sanitizedQuery);
  
  // Apply any active filters
  results = FilterEngine.applyFilters(results);
  
  renderDocuments(results);
  updateResultsCount(results.length, sanitizedQuery);
}

// Handle search form submission
function handleSearch(e) {
  e.preventDefault();
  
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value;
  
  performSearch(query);
}

// Clear search
function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  
  document.getElementById('clearSearch').style.display = 'none';
  
  FilterEngine.resetFilters();
  renderDocuments(DOCUMENTS);
  updateResultsCount(DOCUMENTS.length);
  
  searchInput.focus();
}

// Apply all filters
function applyAllFilters() {
  // Get filter values
  const title = document.getElementById('filterTitle').value;
  const researcher = document.getElementById('filterResearcher').value;
  const category = document.getElementById('filterCategory').value;
  const year = document.getElementById('filterYear').value;
  const subject = document.getElementById('filterSubject').value;
  
  // Set filters
  FilterEngine.setFilter('title', title);
  FilterEngine.setFilter('researcher', researcher);
  FilterEngine.setFilter('category', category);
  FilterEngine.setFilter('year', year);
  FilterEngine.setFilter('subject', subject);
  
  // Get current search query
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value;
  
  // Perform search with filters
  let results = query ? SearchEngine.search(Sanitizer.sanitizeSearchInput(query)) : [...DOCUMENTS];
  results = FilterEngine.applyFilters(results);
  
  renderDocuments(results);
  updateResultsCount(results.length, query);
}

// Reset all filters
function resetAllFilters() {
  // Reset filter inputs
  document.getElementById('filterTitle').value = '';
  document.getElementById('filterResearcher').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterYear').value = '';
  document.getElementById('filterSubject').value = '';
  
  FilterEngine.resetFilters();
  
  // Also clear search
  clearSearch();
}

// Toggle filter panel
function toggleFilterPanel() {
  const filterContent = document.getElementById('filterContent');
  const button = document.getElementById('toggleFilters');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  filterContent.style.display = isExpanded ? 'none' : 'grid';
  button.setAttribute('aria-expanded', !isExpanded);
  
  const icon = button.querySelector('.toggle-icon');
  icon.textContent = isExpanded ? '▶' : '▼';
}

// Populate filter dropdown options
function populateFilterOptions() {
  const filters = SearchEngine.getUniqueFilters();
  
  // Populate categories
  const categorySelect = document.getElementById('filterCategory');
  filters.categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  
  // Populate years
  const yearSelect = document.getElementById('filterYear');
  filters.years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
  
  // Populate subjects
  const subjectSelect = document.getElementById('filterSubject');
  filters.subjects.forEach(subj => {
    const option = document.createElement('option');
    option.value = subj;
    option.textContent = subj;
    subjectSelect.appendChild(option);
  });
}

// Render documents to the grid
function renderDocuments(documents) {
  const grid = document.getElementById('documentsGrid');
  const noResults = document.getElementById('noResults');
  
  // Clear existing content
  grid.innerHTML = '';
  
  if (documents.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  
  // Render each document from Research Papers
  documents.forEach(doc => {
    const card = createDocumentCard(doc);
    grid.appendChild(card);
  });
}

// Create a document card element
function createDocumentCard(doc) {
  const card = document.createElement('article');
  card.className = 'document-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-id', doc.id);
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Document: ${doc.title}`);
  
  // Sanitize all content (OWASP A07: XSS)
  const safeTitle = Sanitizer.sanitizeHTML(doc.title);
  const safeResearchers = Sanitizer.sanitizeHTML(doc.researchers.join(', '));
  const safeCategory = Sanitizer.sanitizeHTML(doc.category);
  const safeYear = doc.year.toString();
  const safeSubject = doc.subject.map(s => Sanitizer.sanitizeHTML(s));
  const safeSnippet = Sanitizer.sanitizeHTML(SummaryGenerator.generatePreview(doc, 150));
  
  // Count related documents
  const relatedCount = RelatedDocuments.findRelated(doc, DOCUMENTS).length;
  
  card.innerHTML = `
    <div class="document-card-header">
      <span class="document-category">${safeCategory}</span>
      <span class="document-year">${safeYear}</span>
    </div>
    <h3 class="document-title">${safeTitle}</h3>
    <p class="document-researchers">By ${safeResearchers}</p>
    <div class="document-subjects">
      ${safeSubject.map(s => `<span class="document-subject">${s}</span>`).join('')}
    </div>
    <p class="document-snippet">${safeSnippet}</p>
    <div class="document-related-count">
      <span aria-hidden="true">🔗</span>
      <span>${relatedCount} related document${relatedCount !== 1 ? 's' : ''}</span>
    </div>
  `;
  
  // Add click handler
  card.addEventListener('click', () => openModal(doc));
  
  // Add keyboard handler
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(doc);
    }
  });
  
  return card;
}

// Update results count display
function updateResultsCount(count, query = '') {
  const resultsCount = document.getElementById('resultsCount');
  
  if (query) {
    resultsCount.textContent = `Found ${count} document${count !== 1 ? 's' : ''} for "${Sanitizer.sanitizeHTML(query)}"`;
  } else {
    resultsCount.textContent = `Showing ${count} document${count !== 1 ? 's' : ''} from Research Papers`;
  }
}

// Open modal with document details
function openModal(doc) {
  const modal = document.getElementById('documentModal');
  
  // Set image (first page preview)
  const modalImage = document.getElementById('modalImage');
  if (doc.image) {
    modalImage.src = doc.image;
    modalImage.alt = `First page of ${doc.title}`;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }
  
  // Populate modal content (OWASP A07: XSS - sanitize all)
  document.getElementById('modalTitle').textContent = doc.title;
  document.getElementById('modalResearchers').textContent = doc.researchers.join(', ');
  document.getElementById('modalYear').textContent = doc.year;
  document.getElementById('modalPublishedIn').textContent = doc.publishedIn;
  document.getElementById('modalCategory').textContent = doc.category;
  document.getElementById('modalSubject').textContent = doc.subject.join(', ');
  document.getElementById('modalKeywords').textContent = doc.keywords ? doc.keywords.join(', ') : 'None';
  document.getElementById('modalSummary').textContent = SummaryGenerator.generateDetailedSummary(doc);
  
  // Populate related documents
  const relatedList = document.getElementById('modalRelated');
  relatedList.innerHTML = '';
  
  const relatedDocs = RelatedDocuments.findRelated(doc, DOCUMENTS);
  
  if (relatedDocs.length === 0) {
    relatedList.innerHTML = '<p>No related documents found.</p>';
  } else {
    relatedDocs.forEach(relatedDoc => {
      const relatedItem = createRelatedItem(relatedDoc);
      relatedList.appendChild(relatedItem);
    });
  }
  
  // Show modal
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  // Focus trap
  document.getElementById('modalClose').focus();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Create related document item
function createRelatedItem(doc) {
  const item = document.createElement('div');
  item.className = 'related-item';
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  
  const safeTitle = Sanitizer.sanitizeHTML(doc.title);
  const safeResearchers = Sanitizer.sanitizeHTML(doc.researchers.join(', '));
  
  item.innerHTML = `
    <h4>${safeTitle}</h4>
    <p>${safeResearchers} • ${doc.year}</p>
  `;
  
  item.addEventListener('click', () => {
    closeModal();
    setTimeout(() => openModal(doc), 300);
  });
  
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal();
      setTimeout(() => openModal(doc), 300);
    }
  });
  
  return item;
}

// Close modal
function closeModal() {
  const modal = document.getElementById('documentModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Return focus to triggering element if possible
  const lastFocus = document.querySelector('.document-card:focus');
  if (lastFocus) {
    lastFocus.focus();
  }
}

// Setup hover tooltips
function setupHoverTooltips() {
  const tooltip = document.getElementById('hoverTooltip');
  let tooltipTimeout;
  
  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.document-card');
    if (!card) return;
    
    const docId = card.getAttribute('data-id');
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) return;
    
    // Clear any existing timeout
    clearTimeout(tooltipTimeout);
    
    // Show tooltip after delay
    tooltipTimeout = setTimeout(() => {
      showTooltip(doc, card);
    }, 500);
  });
  
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.document-card');
    if (!card) return;
    
    clearTimeout(tooltipTimeout);
    hideTooltip();
  });
  
  document.addEventListener('mouseleave', (e) => {
    if (e.target.closest('.document-card')) {
      hideTooltip();
    }
  });
}

// Show tooltip with document preview
function showTooltip(doc, card) {
  const tooltip = document.getElementById('hoverTooltip');
  
  // Set image for tooltip
  const tooltipImage = document.getElementById('tooltipImage');
  if (doc.image) {
    tooltipImage.src = doc.image;
    tooltipImage.alt = `Preview of ${doc.title}`;
    tooltipImage.style.display = 'block';
  } else {
    tooltipImage.style.display = 'none';
  }
  
  // Populate tooltip content (OWASP A07: XSS - sanitize all)
  document.getElementById('tooltipTitle').textContent = doc.title;
  document.getElementById('tooltipResearchers').textContent = doc.researchers.join(', ');
  document.getElementById('tooltipYear').textContent = doc.year;
  document.getElementById('tooltipPublishedIn').textContent = doc.publishedIn;
  document.getElementById('tooltipCategory').textContent = doc.category;
  document.getElementById('tooltipKeywords').textContent = doc.keywords ? doc.keywords.join(', ') : 'None';
  document.getElementById('tooltipSummary').textContent = SummaryGenerator.generatePreview(doc, 120);
  
  // Position tooltip
  const rect = card.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let top = rect.bottom + 10;
  let left = rect.left;
  
  // Ensure tooltip stays within viewport
  if (left + tooltipRect.width > window.innerWidth - 20) {
    left = window.innerWidth - tooltipRect.width - 20;
  }
  if (left < 20) {
    left = 20;
  }
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  
  tooltip.classList.add('visible');
  tooltip.setAttribute('aria-hidden', 'false');
}

// Hide tooltip
function hideTooltip() {
  const tooltip = document.getElementById('hoverTooltip');
  tooltip.classList.remove('visible');
  tooltip.setAttribute('aria-hidden', 'true');
}

// Setup theme toggle
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }
  
  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

// Update theme icon
function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add new document to the Research Papers repository
function addDocument(newDoc) {
  // Validate document structure
  if (!validateDocument(newDoc)) {
    console.error('Invalid document structure');
    return false;
  }
  
  // Add to global DOCUMENTS array
  DOCUMENTS.push(newDoc);
  
  // Add to search index
  SearchEngine.addDocument(newDoc);
  
  // Re-render documents
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value;
  
  if (query) {
    performSearch(query);
  } else {
    renderDocuments(DOCUMENTS);
    updateResultsCount(DOCUMENTS.length);
  }
  
  // Update filter options if needed
  populateFilterOptions();
  
  console.log('Document added to Research Papers:', newDoc.id);
  return true;
}

// Validate document structure
function validateDocument(doc) {
  const requiredFields = ['id', 'title', 'researchers', 'year', 'publishedIn', 'category', 'subject', 'content'];
  
  for (const field of requiredFields) {
    if (!doc.hasOwnProperty(field)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate types
  if (typeof doc.id !== 'string' || doc.id.length === 0) return false;
  if (typeof doc.title !== 'string' || doc.title.length === 0) return false;
  if (!Array.isArray(doc.researchers) || doc.researchers.length === 0) return false;
  if (typeof doc.year !== 'number' || isNaN(doc.year)) return false;
  if (typeof doc.publishedIn !== 'string') return false;
  if (typeof doc.category !== 'string') return false;
  if (!Array.isArray(doc.subject)) return false;
  if (typeof doc.content !== 'string') return false;
  
  return true;
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addDocument, validateDocument };
}