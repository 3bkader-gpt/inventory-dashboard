"""Rate limiting configuration using SlowAPI."""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance using client IP as key
limiter = Limiter(key_func=get_remote_address)

# Rate limit constants
DEFAULT_LIMIT = "100/minute"
AI_SEARCH_LIMIT = "10/minute"  # Stricter for expensive AI operations
AUTH_LIMIT = "20/minute"  # Protect against brute force
