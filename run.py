import multiprocessing
import uvicorn
import os

def run_server(host="0.0.0.0", port=7777):
    """Run the server with uvicorn"""
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        workers=min(multiprocessing.cpu_count() + 1, 8),  # Number of worker processes
        log_level="info",
        proxy_headers=True,
        forwarded_allow_ips="*",
        limit_concurrency=1000,  # Limit concurrent connections
        limit_max_requests=10000,  # Restart workers after this many requests
        timeout_keep_alive=30,  # Seconds to keep idle connections
        access_log=True
    )

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 7777))
    run_server(port=port) 