"""Serve the static site locally, including concurrent Lighthouse image requests."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--port", type=int, default=8088)
args = parser.parse_args()

class Server(ThreadingHTTPServer):
    request_queue_size = 128

handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parents[1]))
with Server(("127.0.0.1", args.port), handler) as server:
    print(f"http://127.0.0.1:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
