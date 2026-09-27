// Related Documents Module
// Automatically finds related research based on content similarity and references

const RelatedDocuments = {
  // Find related documents for a given document
  findRelated(doc, allDocuments, maxResults = 5) {
    if (!doc || !allDocuments) return [];
    
    const scoredDocs = allDocuments
      .filter(d => d.id !== doc.id)
      .map(d => ({
        doc: d,
        score: this.calculateSimilarity(doc, d)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return scoredDocs.slice(0, maxResults).map(item => item.doc);
  },
  
  // Calculate similarity score between two documents
  calculateSimilarity(doc1, doc2) {
    let score = 0;
    
    // Check direct references
    if (doc1.references && doc1.references.includes(doc2.id)) {
      score += 10;
    }
    if (doc2.references && doc2.references.includes(doc1.id)) {
      score += 10;
    }
    
    // Category match
    if (doc1.category === doc2.category) {
      score += 5;
    }
    
    // Subject overlap
    const subjectOverlap = doc1.subject.filter(s => 
      doc2.subject.includes(s)
    ).length;
    score += subjectOverlap * 3;
    
    // Researcher overlap
    const researcherOverlap = doc1.researchers.filter(r => 
      doc2.researchers.includes(r)
    ).length;
    score += researcherOverlap * 4;
    
    // Year proximity (closer years = higher score)
    const yearDiff = Math.abs(doc1.year - doc2.year);
    if (yearDiff === 0) {
      score += 3;
    } else if (yearDiff <= 2) {
      score += 2;
    } else if (yearDiff <= 5) {
      score += 1;
    }
    
    // Keyword overlap
    if (doc1.keywords && doc2.keywords) {
      const keywordOverlap = doc1.keywords.filter(k => 
        doc2.keywords.some(kw => kw.includes(k) || k.includes(kw))
      ).length;
      score += keywordOverlap * 2;
    }
    
    // Content similarity (simple word overlap)
    const contentSimilarity = this.calculateContentSimilarity(doc1.content, doc2.content);
    score += contentSimilarity * 5;
    
    return score;
  },
  
  // Calculate content similarity based on word overlap
  calculateContentSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  },
  
  // Get related documents with reasons
  findRelatedWithReasons(doc, allDocuments, maxResults = 5) {
    if (!doc || !allDocuments) return [];
    
    const scoredDocs = allDocuments
      .filter(d => d.id !== doc.id)
      .map(d => {
        const reasons = this.getSimilarityReasons(doc, d);
        const score = this.calculateSimilarity(doc, d);
        return { doc: d, score, reasons };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return scoredDocs.slice(0, maxResults);
  },
  
  // Get reasons for similarity
  getSimilarityReasons(doc1, doc2) {
    const reasons = [];
    
    if (doc1.references && doc1.references.includes(doc2.id)) {
      reasons.push('Directly referenced');
    }
    if (doc2.references && doc2.references.includes(doc1.id)) {
      reasons.push('References this document');
    }
    if (doc1.category === doc2.category) {
      reasons.push('Same category');
    }
    
    const subjectOverlap = doc1.subject.filter(s => doc2.subject.includes(s));
    if (subjectOverlap.length > 0) {
      reasons.push(`Shared subjects: ${subjectOverlap.join(', ')}`);
    }
    
    const researcherOverlap = doc1.researchers.filter(r => doc2.researchers.includes(r));
    if (researcherOverlap.length > 0) {
      reasons.push(`Common researchers: ${researcherOverlap.join(', ')}`);
    }
    
    return reasons;
  },
  
  // Build a citation network
  buildCitationNetwork(allDocuments) {
    const network = new Map();
    
    allDocuments.forEach(doc => {
      if (!network.has(doc.id)) {
        network.set(doc.id, { cited: [], citing: [] });
      }
      
      if (doc.references) {
        doc.references.forEach(refId => {
          if (!network.has(refId)) {
            network.set(refId, { cited: [], citing: [] });
          }
          network.get(doc.id).citing.push(refId);
          network.get(refId).cited.push(doc.id);
        });
      }
    });
    
    return network;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RelatedDocuments };
}