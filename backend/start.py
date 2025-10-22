#!/usr/bin/env python3
"""
Railway deployment starter script
This script reads the PORT environment variable and starts uvicorn with proper configuration
"""
import os
import sys

def main():
    # Get PORT from environment variable, default to 8000
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Starting Chacole Backend on port {port}")
    print(f"📡 WebSocket support enabled")
    print(f"🔧 Ping interval: 20s, Ping timeout: 20s")
    
    # Import uvicorn here to ensure it's installed
    try:
        import uvicorn
    except ImportError:
        print("❌ Error: uvicorn is not installed")
        print("Please install it with: pip install uvicorn")
        sys.exit(1)
    
    # Run uvicorn with proper configuration
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        ws_ping_interval=20,
        ws_ping_timeout=20,
        log_level="info"
    )

if __name__ == "__main__":
    main()

