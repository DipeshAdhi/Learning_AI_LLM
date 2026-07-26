"""Local preview server for the site. No dependencies, no build step.

Serves the repository root on http://localhost:4321.
Run it directly, or let the Browser pane start it via .claude/launch.json.
"""

import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 4321


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static files, but never cached — so a reload always shows the edit."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(Handler, directory=ROOT)
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"serving {ROOT} on http://localhost:{PORT}")
        httpd.serve_forever()
