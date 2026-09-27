// Summary Generator Module
// Automatically generates concise summaries from document content

const SummaryGenerator = {
  // Generate summary from document content
  generateSummary(doc, maxLength = 200) {
    if (!doc || !doc.content) {
      return 'No summary available.';
    }
    
    // Extract key sentences
    const sentences = this.extractSentences(doc.content);
    
    // Score sentences based on importance
    const scoredSentences = sentences.map(sentence => ({
      text: sentence,
      score: this.scoreSentence(sentence, doc)
    }));
    
    // Sort by score and select top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    
    // Build summary
    let summary = '';
    let charCount = 0;
    
    for (const item of scoredSentences) {
      if (charCount + item.text.length > maxLength && summary.length > 0) {
        break;
      }
      summary += item.text + ' ';
      charCount += item.text.length + 1;
    }
    
    // Clean up
    summary = summary.trim();
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength).trim() + '...';
    }
    
    return summary;
  },
  
  // Extract sentences from text
  extractSentences(text) {
    // Split on sentence boundaries
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const matches = text.match(sentenceRegex);
    
    if (!matches) {
      // Fallback: split on periods
      return text.split('.').filter(s => s.trim().length > 0).map(s => s.trim() + '.');
    }
    
    return matches.map(s => s.trim()).filter(s => s.length > 10);
  },
  
  // Score a sentence for importance
  scoreSentence(sentence, doc) {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Bonus for first sentence (often contains main idea)
    if (sentence === this.extractSentences(doc.content)[0]) {
      score += 5;
    }
    
    // Bonus for containing keywords
    if (doc.keywords) {
      doc.keywords.forEach(keyword => {
        if (lowerSentence.includes(keyword.toLowerCase())) {
          score += 3;
        }
      });
    }
    
    // Bonus for containing subject terms
    doc.subject.forEach(subject => {
      if (lowerSentence.includes(subject.toLowerCase())) {
        score += 2;
      }
    });
    
    // Bonus for containing researcher names
    doc.researchers.forEach(researcher => {
      if (lowerSentence.includes(researcher.toLowerCase())) {
        score += 1;
      }
    });
    
    // Bonus for sentence length (not too short, not too long)
    const wordCount = sentence.split('\s+').length;
    if (wordCount >= 10 && wordCount <= 30) {
      score += 2;
    }
    
    // Bonus for containing action words
    const actionWords = ['demonstrate', 'show', 'reveal', 'indicate', 'suggest', 'prove', 'find', 'establish', 'propose'];
    actionWords.forEach(word => {
      if (lowerSentence.includes(word)) {
        score += 2;
      }
    });
    
    return score;
  },
  
  // Generate a short preview (for cards)
  generatePreview(doc, maxLength = 150) {
    return this.generateSummary(doc, maxLength);
  },
  
  // Generate a detailed summary (for modal)
  generateDetailedSummary(doc) {
    if (!doc || !doc.content) {
      return 'No detailed summary available.';
    }
    
    // For detailed summary, include more context
    const sentences = this.extractSentences(doc.content);
    
    // Take top 5-7 sentences
    const topSentences = sentences.slice(0, Math.min(7, sentences.length));
    
    return topSentences.join(' ');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SummaryGenerator };
}