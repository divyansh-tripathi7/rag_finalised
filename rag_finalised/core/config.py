import os

try:
    # Load variables from .env if python-dotenv is installed
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    # Fallback: rely only on existing environment variables
    pass


def is_testing() -> bool:
    """
    Returns True when TESTING is enabled via environment variable.

    Accepted truthy values (case-insensitive):
    - "1", "true", "yes", "on"
    """
    value = os.getenv("TESTING", "").strip().lower()
    return value in {"1", "true", "yes", "on"}

