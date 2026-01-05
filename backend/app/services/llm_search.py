"""Natural Language Query Parser using Gemini AI and Regex Fallback."""
import re
import json
from dataclasses import dataclass, field
from typing import Optional
from app.config import get_settings

settings = get_settings()


@dataclass
class ParsedQuery:
    """Structured query result from natural language parsing."""
    name_contains: Optional[str] = None
    category_contains: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    low_stock: bool = False
    sort_by: Optional[str] = None  # price, quantity, name
    sort_order: str = "asc"
    raw_query: str = ""
    parse_method: str = "none"  # "ai", "regex", "none"


class InventoryQueryParser:
    """Parses natural language inventory queries using AI or Regex."""
    
    SYSTEM_PROMPT = """You are a query parser for an inventory database.
Your job is to extract search filters from natural language queries.

Output ONLY valid JSON with these optional fields:
- name_contains: string (product name search)
- category_contains: string (category name search)
- min_price: number
- max_price: number  
- low_stock: boolean (true if user wants low stock items)
- sort_by: string ("price", "quantity", or "name")
- sort_order: string ("asc" or "desc")

Examples:
"show me cheap electronics" -> {"category_contains": "electronics", "sort_by": "price", "sort_order": "asc"}
"low stock items" -> {"low_stock": true}
"expensive products over 100" -> {"min_price": 100, "sort_by": "price", "sort_order": "desc"}
"phones under $50" -> {"name_contains": "phone", "max_price": 50}

Respond with ONLY the JSON object, no markdown, no explanation."""

    def __init__(self):
        self.ai_available = False
        self.client = None
        self._initialized = False
    
    def _init_ai(self):
        """Initialize Gemini AI if API key is available (lazy)."""
        if self._initialized:
            return
        self._initialized = True
        
        # Skip in test mode
        import os
        if os.environ.get("TESTING") == "1":
            return
        
        if not settings.gemini_api_key:
            print("⚠️ GEMINI_API_KEY not set, using regex fallback only")
            return
        
        try:
            from google import genai
            self.client = genai.Client(api_key=settings.gemini_api_key)
            self.ai_available = True
            print("✅ Gemini AI initialized for smart search (using google-genai)")
        except Exception as e:
            print(f"⚠️ Failed to initialize Gemini: {e}")
    
    async def parse(self, query: str) -> ParsedQuery:
        """Parse natural language query into structured filters."""
        # Lazy initialization
        self._init_ai()
        
        result = ParsedQuery(raw_query=query)
        
        # Try AI first
        if self.ai_available:
            try:
                ai_result = await self._parse_with_ai(query)
                if ai_result:
                    return ai_result
            except Exception as e:
                print(f"AI parsing failed: {e}")
        
        # Fallback to regex
        return self._parse_with_regex(query)
    
    async def _parse_with_ai(self, query: str) -> Optional[ParsedQuery]:
        """Use Gemini to parse the query."""
        if not self.client:
            return None
        
        try:
            prompt = f"{self.SYSTEM_PROMPT}\n\nUser query: {query}"
            
            # Use the new google-genai API
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            
            # Extract JSON from response
            text = response.text.strip()
            
            # Handle potential markdown code blocks
            if text.startswith("```"):
                text = re.sub(r"```json?\n?", "", text)
                text = text.replace("```", "")
            
            parsed = json.loads(text.strip())
            
            return ParsedQuery(
                name_contains=parsed.get("name_contains"),
                category_contains=parsed.get("category_contains"),
                min_price=parsed.get("min_price"),
                max_price=parsed.get("max_price"),
                low_stock=parsed.get("low_stock", False),
                sort_by=parsed.get("sort_by"),
                sort_order=parsed.get("sort_order", "asc"),
                raw_query=query,
                parse_method="ai",
            )
        except json.JSONDecodeError as e:
            print(f"AI returned invalid JSON: {e}")
            return None
        except Exception as e:
            print(f"AI parsing error: {e}")
            return None
    
    def _parse_with_regex(self, query: str) -> ParsedQuery:
        """Fallback regex-based parsing for common patterns."""
        query_lower = query.lower()
        result = ParsedQuery(raw_query=query, parse_method="regex")
        
        # Low stock detection
        if "low stock" in query_lower or "out of stock" in query_lower:
            result.low_stock = True
        
        # Price sorting
        if "cheap" in query_lower or "cheapest" in query_lower:
            result.sort_by = "price"
            result.sort_order = "asc"
        elif "expensive" in query_lower or "pricey" in query_lower:
            result.sort_by = "price"
            result.sort_order = "desc"
        
        # Price filters
        price_under = re.search(r"under\s*\$?(\d+(?:\.\d{2})?)", query_lower)
        if price_under:
            result.max_price = float(price_under.group(1))
        
        price_over = re.search(r"over\s*\$?(\d+(?:\.\d{2})?)", query_lower)
        if price_over:
            result.min_price = float(price_over.group(1))
        
        # Category keywords
        categories = ["electronics", "clothing", "food", "furniture", "toys", "books", "sports", "health"]
        for cat in categories:
            if cat in query_lower:
                result.category_contains = cat
                break
        
        # Name search (remaining significant words)
        # Remove common words and extract potential product names
        stopwords = {"show", "me", "find", "get", "list", "all", "the", "a", "an", "in", "with", "that", "are", "is"}
        words = query_lower.split()
        meaningful_words = [w for w in words if w not in stopwords and len(w) > 2 and not w.startswith("$")]
        
        # If no category found and we have meaningful words, use as name search
        if not result.category_contains and meaningful_words:
            # Filter out already-used keywords
            used_keywords = {"cheap", "expensive", "low", "stock", "under", "over", "pricey", "cheapest"}
            used_keywords.update(categories)
            remaining = [w for w in meaningful_words if w not in used_keywords]
            if remaining:
                result.name_contains = " ".join(remaining[:3])  # Max 3 words
        
        return result


# Singleton instance
query_parser = InventoryQueryParser()
