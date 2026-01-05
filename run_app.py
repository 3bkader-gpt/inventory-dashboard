#!/usr/bin/env python3
"""
Single-process application runner.
Run this file to serve both the API and React frontend at http://localhost:8000
"""
import os
import signal
import subprocess
import sys
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "backend"


def check_and_install_dependencies():
    """Check if backend dependencies are installed, offer to install if not."""
    try:
        import sqlalchemy
        from sqlalchemy.ext.asyncio import async_sessionmaker
        import fastapi
        import uvicorn
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print()
        print("Backend dependencies are not installed in the current environment.")
        print("Would you like to install them now? (y/n)")
        
        response = input("> ").strip().lower()
        if response == 'y':
            print()
            print("Installing backend dependencies...")
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", "-e", str(BACKEND_DIR)],
                cwd=str(ROOT_DIR)
            )
            if result.returncode == 0:
                print("✅ Dependencies installed successfully!")
                print("Please re-run: python run_app.py")
            else:
                print("❌ Installation failed. Try manually: pip install -e ./backend")
            return False
        else:
            print()
            print("To install manually, run:")
            print(f"  pip install -e {BACKEND_DIR}")
            return False


def main():
    """Run the unified application."""
    # Add backend to path
    sys.path.insert(0, str(BACKEND_DIR))
    
    import uvicorn
    
    print("=" * 60)
    print("🚀 Inventory Dashboard - Single Process Mode")
    print("=" * 60)
    print()
    print("  API Endpoints:   http://localhost:8000/api/")
    print("  Web Interface:   http://localhost:8000/")
    print("  Health Check:    http://localhost:8000/api/health")
    print()
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    
    # Configure uvicorn with proper settings for Windows
    config = uvicorn.Config(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
    server = uvicorn.Server(config)
    
    # Run with proper signal handling
    try:
        server.run()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")


if __name__ == "__main__":
    # Enable proper Ctrl+C handling on Windows
    if sys.platform == "win32":
        signal.signal(signal.SIGINT, signal.SIG_DFL)
    
    if check_and_install_dependencies():
        main()
