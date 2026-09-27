// Input Sanitization Module - OWASP Top 10 Compliant
// Implements defense-in-depth for XSS, injection, and other security vulnerabilities
// Excludes password/username/login validation as this site has no authentication

const Sanitizer = {
  // OWASP A01: Broken Access Control - Input validation
  validateInput(value, type, options = {}) {
    const { minLength, maxLength, pattern, required, allowedValues } = options;
    
    // Check required
    if (required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'Required field' };
    }
    
    // Type validation
    if (type === 'string' && typeof value !== 'string') {
      return { valid: false, error: 'Invalid type' };
    }
    
    if (type === 'number' && (typeof value !== 'number' || isNaN(value))) {
      return { valid: false, error: 'Invalid number' };
    }
    
    if (type === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
    }
    
    // Length validation
    if (type === 'string' || typeof value === 'string') {
      if (minLength && value.length < minLength) {
        return { valid: false, error: `Minimum length is ${minLength}` };
      }
      if (maxLength && value.length > maxLength) {
        return { valid: false, error: `Maximum length is ${maxLength}` };
      }
    }
    
    // Pattern validation
    if (pattern && typeof value === 'string') {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return { valid: false, error: 'Invalid format' };
      }
    }
    
    // Allowed values validation
    if (allowedValues && !allowedValues.includes(value)) {
      return { valid: false, error: 'Invalid value' };
    }
    
    return { valid: true, error: null };
  },
  
  // OWASP A03: Injection - HTML sanitization
  sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    // Create a temporary element for safe text encoding
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    
    // Return the sanitized text (entities encoded)
    return tempDiv.innerHTML;
  },
  
  // OWASP A03: Injection - Attribute sanitization
  sanitizeAttribute(str) {
    if (typeof str !== 'string') return '';
    
    // Remove potentially dangerous characters for attributes
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(///g, '&#x2F;')
      .replace(/\0/g, ''); // Remove null bytes
  },
  
  // OWASP A03: Injection - Search input sanitization
  sanitizeSearchInput(input) {
    if (typeof input !== 'string') return '';
    
    // Limit length to prevent buffer overflow attempts (OWASP A06: Security Misconfiguration)
    if (input.length > 2000) {
      input = input.substring(0, 2000);
    }
    
    // Remove null bytes (OWASP A03: Injection)
    input = input.replace(/\0/g, '');
    
    // Remove control characters (OWASP A03: Injection)
    input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Escape regex special characters for safe pattern matching (OWASP A03: Injection)
    input = input.replace(/[.*+?^${}()|[]\]/g, '\\$&');
    
    // Remove HTML tags (OWASP A07: XSS)
    input = input.replace(/<[^>]*>/g, '');
    
    // Remove javascript: protocol (OWASP A07: XSS)
    input = input.replace(/javascript:/gi, '');
    
    // Remove event handlers (OWASP A07: XSS)
    input = input.replace(/on\w+=/gi, '');
    
    // Remove data: protocol (OWASP A07: XSS)
    input = input.replace(/data:/gi, '');
    
    // Remove vbscript: protocol (OWASP A07: XSS)
    input = input.replace(/vbscript:/gi, '');
    
    return input.trim();
  },
  
  // OWASP A03: Injection - Filter input sanitization
  sanitizeFilterInput(input) {
    if (typeof input !== 'string') return '';
    
    // Limit length (OWASP A06: Security Misconfiguration)
    if (input.length > 500) {
      input = input.substring(0, 500);
    }
    
    // Remove potentially dangerous patterns (OWASP A03: Injection, A07: XSS)
    input = input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
    
    return input.trim();
  },
  
  // OWASP A03: Injection - ID sanitization
  sanitizeId(id) {
    if (typeof id !== 'string') return '';
    
    // Only allow alphanumeric, hyphens, and underscores (OWASP A03: Injection)
    return id.replace(/[^a-zA-Z0-9_-]/g, '');
  },
  
  // OWASP A03: Injection - URL sanitization
  sanitizeURL(url) {
    if (typeof url !== 'string') return '';
    
    try {
      const parsed = new URL(url);
      
      // Only allow http and https protocols (OWASP A03: Injection)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      
      return parsed.href;
    } catch (e) {
      return '';
    }
  },
  
  // OWASP A07: XSS - Content Security Policy compliant script evaluation
  safeEvaluate(code) {
    // NEVER evaluate user input directly (OWASP A03: Injection, A07: XSS)
    console.warn('Direct code evaluation is disabled for security');
    return null;
  },
  
  // OWASP A04: Insecure Design - Rate limiting helper
  createRateLimiter(maxCalls, windowMs) {
    const calls = [];
    
    return function() {
      const now = Date.now();
      
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] < now - windowMs) {
        calls.shift();
      }
      
      // Check if limit exceeded (OWASP A04: Insecure Design)
      if (calls.length >= maxCalls) {
        console.warn('Rate limit exceeded');
        return false;
      }
      
      calls.push(now);
      return true;
    };
  },
  
  // OWASP A07: XSS - Comprehensive input sanitization pipeline
  sanitizeInput(input, context = 'html') {
    if (input === null || input === undefined) return '';
    
    let sanitized = String(input);
    
    // Context-specific sanitization (OWASP A03: Injection, A07: XSS)
    switch (context) {
      case 'html':
        return this.sanitizeHTML(sanitized);
      case 'attribute':
        return this.sanitizeAttribute(sanitized);
      case 'search':
        return this.sanitizeSearchInput(sanitized);
      case 'filter':
        return this.sanitizeFilterInput(sanitized);
      case 'id':
        return this.sanitizeId(sanitized);
      case 'url':
        return this.sanitizeURL(sanitized);
      case 'keyword':
        // Sanitize for keyword indexing
        return this.sanitizeFilterInput(sanitized).toLowerCase();
      default:
        return this.sanitizeHTML(sanitized);
    }
  },
  
  // OWASP A09: Security Logging - Input validation logging
  logValidationAttempt(input, type, result) {
    // In production, this would log to a secure audit log
    // For now, we just validate without exposing sensitive info
    if (!result.valid) {
      console.warn(`Input validation failed for type: ${type}`);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Sanitizer };
}