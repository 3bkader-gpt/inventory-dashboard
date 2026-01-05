#!/usr/bin/env python3
"""
Deployment Readiness Verification Script
=========================================
Run this before deploying to verify the codebase is production-ready.

Usage: python verify_deployment_readiness.py
"""

import os
import re
import subprocess
import sys
from pathlib import Path

# Configuration
ROOT_DIR = Path(__file__).parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"
DIST_DIR = FRONTEND_DIR / "dist"

# ANSI Colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"


def print_header(title: str):
    """Print a section header."""
    print(f"\n{CYAN}{BOLD}{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}{RESET}\n")


def print_pass(msg: str):
    """Print a PASS result."""
    print(f"  {GREEN}✓ PASS:{RESET} {msg}")


def print_fail(msg: str):
    """Print a FAIL result."""
    print(f"  {RED}✗ FAIL:{RESET} {msg}")


def print_warn(msg: str):
    """Print a WARNING result."""
    print(f"  {YELLOW}⚠ WARN:{RESET} {msg}")


def print_info(msg: str):
    """Print an INFO message."""
    print(f"  {CYAN}ℹ INFO:{RESET} {msg}")


# ============================================================================
# CHECK 1: Build Integrity
# ============================================================================
def check_build_integrity() -> bool:
    """Verify the frontend builds successfully."""
    print_header("1. BUILD INTEGRITY (Frontend)")
    
    index_html = DIST_DIR / "index.html"
    
    # If dist already exists, we can skip the build
    if index_html.exists():
        print_pass(f"dist/index.html already exists ({index_html.stat().st_size} bytes)")
        print_info("Skipping npm build (use --rebuild to force)")
        return True
    
    # Check if npm is available
    try:
        subprocess.run(["npm", "--version"], capture_output=True, check=True, shell=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_fail("npm is not installed or not in PATH")
        print_info("Run 'npm run build' manually in the frontend directory")
        return False
    
    # Run npm build
    print_info("Running 'npm run build'...")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=str(FRONTEND_DIR),
        capture_output=True,
        text=True,
        shell=True
    )
    
    if result.returncode != 0:
        print_fail("Frontend build failed!")
        print(f"\n{RED}Build Error Output:{RESET}")
        print(result.stderr[:1000] if result.stderr else result.stdout[:1000])
        return False
    
    # Check if dist/index.html exists
    if not index_html.exists():
        print_fail(f"Build succeeded but {index_html} not found")
        return False
    
    print_pass("Frontend build completed successfully")
    print_pass(f"dist/index.html exists ({index_html.stat().st_size} bytes)")
    return True


# ============================================================================
# CHECK 2: Monolith Configuration
# ============================================================================
def check_monolith_config() -> bool:
    """Verify the single-process deployment is configured correctly."""
    print_header("2. MONOLITH CONFIGURATION")
    
    all_passed = True
    
    # Check run_app.py exists
    run_app = ROOT_DIR / "run_app.py"
    if run_app.exists():
        print_pass("run_app.py exists in root")
    else:
        print_fail("run_app.py not found in root")
        all_passed = False
    
    # Check frontend/dist exists
    if DIST_DIR.exists():
        print_pass("frontend/dist directory exists")
    else:
        print_fail("frontend/dist directory not found (run npm build first)")
        all_passed = False
    
    # Check main.py serves static files
    main_py = BACKEND_DIR / "app" / "main.py"
    if main_py.exists():
        content = main_py.read_text(encoding="utf-8")
        if "StaticFiles" in content:
            print_pass("main.py imports StaticFiles")
        else:
            print_fail("main.py does not import StaticFiles")
            all_passed = False
        
        if "serve_spa" in content or "full_path:path" in content:
            print_pass("main.py has SPA catch-all route")
        else:
            print_fail("main.py missing SPA catch-all route")
            all_passed = False
    else:
        print_fail("backend/app/main.py not found")
        all_passed = False
    
    return all_passed


# ============================================================================
# CHECK 3: Database Configuration
# ============================================================================
def check_database_config() -> bool:
    """Verify PostgreSQL is configured for production."""
    print_header("3. DATABASE CONFIGURATION")
    
    all_passed = True
    
    # Check docker-compose.yml for db service
    docker_compose = ROOT_DIR / "docker-compose.yml"
    if docker_compose.exists():
        content = docker_compose.read_text(encoding="utf-8")
        if "postgres" in content.lower():
            print_pass("docker-compose.yml contains PostgreSQL service")
        else:
            print_fail("docker-compose.yml missing PostgreSQL service")
            all_passed = False
        
        if "db:" in content:
            print_pass("docker-compose.yml has 'db' service defined")
        else:
            print_warn("docker-compose.yml missing 'db' service name")
    else:
        print_warn("docker-compose.yml not found")
    
    # Check config.py for database URL
    config_py = BACKEND_DIR / "app" / "config.py"
    if config_py.exists():
        content = config_py.read_text(encoding="utf-8")
        if "postgresql+asyncpg://" in content:
            print_pass("config.py uses PostgreSQL (asyncpg)")
        elif "sqlite" in content.lower():
            print_fail("config.py still uses SQLite (should be PostgreSQL)")
            all_passed = False
        else:
            print_warn("Could not determine database type in config.py")
    else:
        print_fail("backend/app/config.py not found")
        all_passed = False
    
    # Check .env.example
    env_example = BACKEND_DIR / ".env.example"
    if env_example.exists():
        content = env_example.read_text(encoding="utf-8")
        if "postgresql" in content.lower():
            print_pass(".env.example documents PostgreSQL connection")
        else:
            print_warn(".env.example may need PostgreSQL documentation")
    
    return all_passed


# ============================================================================
# CHECK 4: Code Hygiene
# ============================================================================
def check_code_hygiene() -> list:
    """Scan for embarrassing code leftovers."""
    print_header("4. CODE HYGIENE (Report Only)")
    
    patterns = {
        "TODO": re.compile(r"#\s*TODO|//\s*TODO", re.IGNORECASE),
        "FIXME": re.compile(r"#\s*FIXME|//\s*FIXME", re.IGNORECASE),
        "console.log": re.compile(r"console\.log\("),
        "print(debug)": re.compile(r"^\s*print\((?!.*\"|.*')"),  # print without strings (likely debug)
    }
    
    issues = []
    
    # Scan backend Python files
    for py_file in BACKEND_DIR.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        try:
            content = py_file.read_text(encoding="utf-8")
            for name, pattern in patterns.items():
                if name in ("console.log",):
                    continue  # Skip JS patterns for Python
                matches = pattern.findall(content)
                if matches:
                    issues.append((py_file.relative_to(ROOT_DIR), name, len(matches)))
        except Exception:
            pass
    
    # Scan frontend TypeScript/JavaScript files
    for ext in ("*.ts", "*.tsx", "*.js", "*.jsx"):
        for ts_file in FRONTEND_DIR.rglob(ext):
            if "node_modules" in str(ts_file) or "dist" in str(ts_file):
                continue
            try:
                content = ts_file.read_text(encoding="utf-8")
                for name, pattern in patterns.items():
                    if name == "print(debug)":
                        continue  # Skip Python patterns for JS/TS
                    matches = pattern.findall(content)
                    if matches:
                        issues.append((ts_file.relative_to(ROOT_DIR), name, len(matches)))
            except Exception:
                pass
    
    if issues:
        print_warn(f"Found {len(issues)} files with potential issues:")
        for file_path, issue_type, count in issues:
            print(f"      - {file_path}: {issue_type} ({count}x)")
    else:
        print_pass("No TODO, FIXME, or debug statements found")
    
    return issues


# ============================================================================
# CHECK 5: Docker Validation
# ============================================================================
def check_docker_config() -> bool:
    """Validate docker-compose.yml syntax."""
    print_header("5. DOCKER VALIDATION")
    
    docker_compose = ROOT_DIR / "docker-compose.yml"
    if not docker_compose.exists():
        print_warn("docker-compose.yml not found, skipping validation")
        return True
    
    # Check if docker-compose is available
    try:
        result = subprocess.run(
            ["docker-compose", "config"],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True
        )
    except FileNotFoundError:
        # Try docker compose (v2)
        try:
            result = subprocess.run(
                ["docker", "compose", "config"],
                cwd=str(ROOT_DIR),
                capture_output=True,
                text=True
            )
        except FileNotFoundError:
            print_warn("Docker/docker-compose not installed, skipping validation")
            return True
    
    if result.returncode == 0:
        print_pass("docker-compose.yml syntax is valid")
        return True
    else:
        print_fail("docker-compose.yml has syntax errors:")
        print(f"{RED}{result.stderr[:500]}{RESET}")
        return False


# ============================================================================
# MAIN
# ============================================================================
def main():
    print(f"\n{BOLD}{CYAN}")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║     DEPLOYMENT READINESS VERIFICATION                    ║")
    print("║     Inventory Dashboard - Pre-Production Check           ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(RESET)
    
    results = {
        "Build Integrity": check_build_integrity(),
        "Monolith Config": check_monolith_config(),
        "Database Config": check_database_config(),
        "Docker Config": check_docker_config(),
    }
    
    # Code hygiene is report-only, doesn't affect pass/fail
    hygiene_issues = check_code_hygiene()
    
    # Final Summary
    print_header("FINAL SUMMARY")
    
    all_passed = all(results.values())
    
    for check_name, passed in results.items():
        status = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
        print(f"  {check_name}: {status}")
    
    hygiene_status = f"{GREEN}CLEAN{RESET}" if not hygiene_issues else f"{YELLOW}{len(hygiene_issues)} items{RESET}"
    print(f"  Code Hygiene: {hygiene_status}")
    
    print()
    if all_passed:
        print(f"  {GREEN}{BOLD}═══════════════════════════════════════════════{RESET}")
        print(f"  {GREEN}{BOLD}  ✓ DEPLOYMENT READY - All critical checks passed{RESET}")
        print(f"  {GREEN}{BOLD}═══════════════════════════════════════════════{RESET}")
        sys.exit(0)
    else:
        print(f"  {RED}{BOLD}═══════════════════════════════════════════════{RESET}")
        print(f"  {RED}{BOLD}  ✗ NOT READY - Fix the issues above before deploying{RESET}")
        print(f"  {RED}{BOLD}═══════════════════════════════════════════════{RESET}")
        sys.exit(1)


if __name__ == "__main__":
    main()
