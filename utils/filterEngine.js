// Filter Engine Module
// Implements multi-criteria filtering with OWASP compliance

const FilterEngine = {
  // Current active filters
  activeFilters: {
    title: '',
    researcher: '',
    category: '',
    year: '',
    subject: ''
  },
  
  // Apply all active filters to document list
  applyFilters(documents) {
    let filtered = [...documents];
    
    // Filter by title
    if (this.activeFilters.title) {
      const sanitizedTitle = Sanitizer.sanitizeFilterInput(this.activeFilters.title).toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(sanitizedTitle)
      );
    }
    
    // Filter by researcher
    if (this.activeFilters.researcher) {
      const sanitizedResearcher = Sanitizer.sanitizeFilterInput(this.activeFilters.researcher).toLowerCase();
      filtered = filtered.filter(doc => 
        doc.researchers.some(r => r.toLowerCase().includes(sanitizedResearcher))
      );
    }
    
    // Filter by category
    if (this.activeFilters.category) {
      const sanitizedCategory = Sanitizer.sanitizeFilterInput(this.activeFilters.category).toLowerCase();
      filtered = filtered.filter(doc => 
        doc.category.toLowerCase() === sanitizedCategory
      );
    }
    
    // Filter by year
    if (this.activeFilters.year) {
      const year = parseInt(this.activeFilters.year, 10);
      filtered = filtered.filter(doc => doc.year === year);
    }
    
    // Filter by subject
    if (this.activeFilters.subject) {
      const sanitizedSubject = Sanitizer.sanitizeFilterInput(this.activeFilters.subject).toLowerCase();
      filtered = filtered.filter(doc => 
        doc.subject.some(s => s.toLowerCase() === sanitizedSubject)
      );
    }
    
    return filtered;
  },
  
  // Set a specific filter
  setFilter(filterName, value) {
    if (this.activeFilters.hasOwnProperty(filterName)) {
      this.activeFilters[filterName] = value;
    }
  },
  
  // Reset all filters
  resetFilters() {
    this.activeFilters = {
      title: '',
      researcher: '',
      category: '',
      year: '',
      subject: ''
    };
  },
  
  // Get current filter state
  getFilters() {
    return { ...this.activeFilters };
  },
  
  // Check if any filters are active
  hasActiveFilters() {
    return Object.values(this.activeFilters).some(v => v !== '');
  },
  
  // Get filter summary for display
  getFilterSummary() {
    const active = [];
    
    if (this.activeFilters.title) {
      active.push(`Title: "${this.activeFilters.title}"`);
    }
    if (this.activeFilters.researcher) {
      active.push(`Researcher: "${this.activeFilters.researcher}"`);
    }
    if (this.activeFilters.category) {
      active.push(`Category: "${this.activeFilters.category}"`);
    }
    if (this.activeFilters.year) {
      active.push(`Year: ${this.activeFilters.year}`);
    }
    if (this.activeFilters.subject) {
      active.push(`Subject: "${this.activeFilters.subject}"`);
    }
    
    return active;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FilterEngine };
}