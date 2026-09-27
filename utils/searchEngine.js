// Search Engine Module - Full-text search with filtering capabilities
// Implements secure, efficient search with OWASP compliance
// Adapts to new keywords from Research Papers repository

const SearchEngine = {
  // Index for fast searching
  index: null,
  
  // Keyword adaptation tracking
  keywordFrequency: new Map(),
  
  // Initialize the search index from Research Papers
  initialize(documents) {
    this.index = {
      terms: new Map(),
      documents: new Map(),
      categories: new Set(),
      years: new Set(),
      subjects: new Set(),
      researchers: new Set(),
      keywords: new Set()
    };
    
    // Build the index from Research Papers
    documents.forEach(doc => {
      this.index.documents.set(doc.id, doc);
      this.index.categories.add(doc.category);
      this.index.years.add(doc.year);
      doc.subject.forEach(s => this.index.subjects.add(s));
      doc.researchers.forEach(r => this.index.researchers.add(r));
      
      // Index keywords for dynamic adaptation
      if (doc.keywords) {
        doc.keywords.forEach(k => this.index.keywords.add(k.toLowerCase()));
      }
      
      // Index content and metadata for full-text search
      const searchableText = this.buildSearchableText(doc);
      this.indexTerms(searchableText, doc.id);
      
      // Track keyword frequency for adaptation
      this.trackKeywords(doc);
    });
    
    console.log('Search index initialized with', documents.length, 'documents from Research Papers');
  },
  
  // Build searchable text from document
  buildSearchableText(doc) {
    return [
      doc.title,
      doc.content,
      doc.category,
      doc.subject.join(' '),
      doc.researchers.join(' '),
      doc.keywords ? doc.keywords.join(' ') : '',
      doc.publishedIn
    ].join(' ').toLowerCase();
  },
  
  // Index terms for fast lookup
  indexTerms(text, docId) {
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (word.length < 2) return; // Skip very short words
      
      if (!this.index.terms.has(word)) {
        this.index.terms.set(word, new Set());
      }
      this.index.terms.get(word).add(docId);
    });
  },
  
  // Track keyword frequency for dynamic adaptation
  trackKeywords(doc) {
    if (!doc.keywords) return;
    
    doc.keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      this.keywordFrequency.set(lowerKeyword, 
        (this.keywordFrequency.get(lowerKeyword) || 0) + 1
      );
    });
  },
  
  // Parse search query with special syntax
  parseQuery(query) {
    const filters = {
      category: null,
      year: null,
      researcher: null,
      subject: null,
      exactPhrase: null,
      freeText: []
    };
    
    // Extract exact phrases in quotes
    const phraseRegex = /"([^"]+)"/g;
    let match;
    while ((match = phraseRegex.exec(query)) !== null) {
      filters.exactPhrase = match[1].toLowerCase();
    }
    
    // Remove quoted phrases from query
    let remainingQuery = query.replace(phraseRegex, '');
    
    // Extract filters with prefix syntax
    const filterRegex = /(category|year|researcher|subject):([^\s]+)/gi;
    while ((match = filterRegex.exec(remainingQuery)) !== null) {
      const filterType = match[1].toLowerCase();
      const filterValue = match[2].toLowerCase();
      
      if (filterType === 'year') {
        filters.year = parseInt(filterValue, 10);
      } else {
        filters[filterType] = filterValue;
      }
    }
    
    // Remove filters from query
    remainingQuery = remainingQuery.replace(filterRegex, '');
    
    // Remaining words are free text
    const freeTextWords = remainingQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    filters.freeText = freeTextWords;
    
    return filters;
  },
  
  // Main search function
  search(query, documents = null) {
    // Sanitize input (OWASP A03: Injection)
    const sanitizedQuery = Sanitizer.sanitizeSearchInput(query);
    
    if (!sanitizedQuery) {
      return documents ? documents : Array.from(this.index.documents.values());
    }
    
    const parsedQuery = this.parseQuery(sanitizedQuery);
    let results = new Set();
    
    // Start with all documents from Research Papers
    let candidateDocs = documents ? documents : Array.from(this.index.documents.values());
    
    // Apply filters first
    if (parsedQuery.category) {
      candidateDocs = candidateDocs.filter(doc => 
        doc.category.toLowerCase().includes(parsedQuery.category)
      );
    }
    
    if (parsedQuery.year) {
      candidateDocs = candidateDocs.filter(doc => doc.year === parsedQuery.year);
    }
    
    if (parsedQuery.researcher) {
      candidateDocs = candidateDocs.filter(doc => 
        doc.researchers.some(r => r.toLowerCase().includes(parsedQuery.researcher))
      );
    }
    
    if (parsedQuery.subject) {
      candidateDocs = candidateDocs.filter(doc => 
        doc.subject.some(s => s.toLowerCase().includes(parsedQuery.subject))
      );
    }
    
    // Apply exact phrase search
    if (parsedQuery.exactPhrase) {
      candidateDocs = candidateDocs.filter(doc => {
        const searchText = this.buildSearchableText(doc);
        return searchText.includes(parsedQuery.exactPhrase);
      });
    }
    
    // Apply free text search with keyword adaptation
    if (parsedQuery.freeText.length > 0) {
      // For each document, calculate relevance score
      const scoredDocs = candidateDocs.map(doc => {
        const searchText = this.buildSearchableText(doc);
        let score = 0;
        
        parsedQuery.freeText.forEach(term => {
          // Term appears in text
          if (searchText.includes(term)) {
            score += 1;
            
            // Bonus for title match
            if (doc.title.toLowerCase().includes(term)) {
              score += 3;
            }
            
            // Bonus for keyword match (with adaptation)
            if (doc.keywords && doc.keywords.some(k => k.includes(term))) {
              score += 2;
              
              // Additional bonus if term is a frequent keyword (adaptation)
              const freq = this.keywordFrequency.get(term) || 0;
              if (freq > 2) {
                score += freq * 0.5;
              }
            }
            
            // Bonus for subject match
            if (doc.subject.some(s => s.toLowerCase().includes(term))) {
              score += 2;
            }
          }
        });
        
        return { doc, score };
      });
      
      // Filter and sort by relevance
      results = scoredDocs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.doc);
    } else {
      // No free text, just use filtered candidates
      results = candidateDocs;
    }
    
    return results;
  },
  
  // Search with highlighting
  searchWithHighlights(query, documents = null) {
    const results = this.search(query, documents);
    
    return results.map(doc => {
      const highlightedContent = this.highlightMatches(doc.content, query);
      return {
        ...doc,
        highlightedContent
      };
    });
  },
  
  // Highlight matching terms in text
  highlightMatches(text, query) {
    if (!query) return text;
    
    const sanitizedQuery = Sanitizer.sanitizeSearchInput(query);
    const terms = sanitizedQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    let highlighted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(\\b[^\\s]*${term}[^\\s]*\\b)`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  },
  
  // Get unique values for filters
  getUniqueFilters() {
    return {
      categories: Array.from(this.index.categories).sort(),
      years: Array.from(this.index.years).sort((a, b) => b - a),
      subjects: Array.from(this.index.subjects).sort(),
      researchers: Array.from(this.index.researchers).sort(),
      keywords: Array.from(this.index.keywords).sort()
    };
  },
  
  // Add new document to index from Research Papers
  addDocument(doc) {
    if (!this.index) {
      this.initialize([doc]);
      return;
    }
    
    this.index.documents.set(doc.id, doc);
    this.index.categories.add(doc.category);
    this.index.years.add(doc.year);
    doc.subject.forEach(s => this.index.subjects.add(s));
    doc.researchers.forEach(r => this.index.researchers.add(r));
    
    // Add keywords to index for adaptation
    if (doc.keywords) {
      doc.keywords.forEach(k => this.index.keywords.add(k.toLowerCase()));
    }
    
    const searchableText = this.buildSearchableText(doc);
    this.indexTerms(searchableText, doc.id);
    
    // Track new keywords for adaptation
    this.trackKeywords(doc);
    
    console.log('Document added to index from Research Papers:', doc.id);
  },
  
  // Remove document from index
  removeDocument(docId) {
    if (!this.index || !this.index.documents.has(docId)) {
      return;
    }
    
    const doc = this.index.documents.get(docId);
    this.index.documents.delete(docId);
    
    // Remove from term index
    const searchableText = this.buildSearchableText(doc);
    const words = searchableText.split(/\s+/);
    
    words.forEach(word => {
      if (this.index.terms.has(word)) {
        this.index.terms.get(word).delete(docId);
        if (this.index.terms.get(word).size === 0) {
          this.index.terms.delete(word);
        }
      }
    });
    
    console.log('Document removed from index:', docId);
  },
  
  // Get keyword frequency for adaptation analytics
  getKeywordAnalytics() {
    return Array.from(this.keywordFrequency.entries())
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchEngine };
}