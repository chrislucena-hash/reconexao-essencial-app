"""Verify the FastAPI contract required by Android and iOS releases.

MOBILE_BACKEND_ORIGIN_IP can be set for an origin-only diagnostic. Release
workflows leave it unset so the public domain must pass these checks.
"""

import json
import os
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlsplit


base = os.environ.get("VITE_API_BASE_URL", "").rstrip("/")
parsed = urlsplit(base)
if parsed.scheme != "https" or not parsed.hostname or parsed.path != "/api/v1":
    raise SystemExit("VITE_API_BASE_URL must be an HTTPS URL ending in /api/v1")

origin = f"https://{parsed.netloc}"
origin_ip = os.environ.get("MOBILE_BACKEND_ORIGIN_IP")


def request(path: str, *, method: str = "GET", headers: dict[str, str] | None = None):
    with tempfile.TemporaryDirectory() as temporary:
        header_file = Path(temporary) / "headers"
        body_file = Path(temporary) / "body"
        command = [
            "curl", "--silent", "--show-error", "--max-time", "20",
            "--max-redirs", "0", "--dump-header", str(header_file),
            "--output", str(body_file), "--request", method,
        ]
        if origin_ip:
            command += ["--resolve", f"{parsed.hostname}:443:{origin_ip}"]
        for name, value in (headers or {}).items():
            command += ["--header", f"{name}: {value}"]
        command.append(origin + path)
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as error:
            raise SystemExit(f"Could not reach {path}: {error.stderr.strip()}") from error
        raw_headers = header_file.read_text(encoding="utf-8")
        blocks = [block for block in raw_headers.replace("\r\n", "\n").split("\n\n") if block.strip()]
        response_headers = blocks[-1].splitlines()
        status = int(response_headers[0].split()[1])
        values = {}
        for line in response_headers[1:]:
            if ":" in line:
                name, value = line.split(":", 1)
                values[name.lower()] = value.strip()
        return status, values, body_file.read_text(encoding="utf-8")


status, _, body = request("/health")
if status != 200:
    raise SystemExit(f"FastAPI /health returned HTTP {status}; expected 200 without redirect")
if json.loads(body).get("status") != "ok":
    raise SystemExit("FastAPI /health did not report status=ok")

status, _, body = request("/openapi.json")
assert status == 200, "FastAPI OpenAPI contract is unavailable"
schema = json.loads(body)
assert {"post", "options"} <= set(schema["paths"]["/api/v1/auth/sync-user"])
assert {"get", "post", "options"} <= set(schema["paths"]["/api/v1/journal/entries"])
auth_fields = schema["components"]["schemas"]["RegistrationRequest"]["properties"]
journal_fields = schema["components"]["schemas"]["JournalEntryUpsertRequest"]["properties"]
assert {"firebaseUid", "email", "displayName", "photoUrl", "phoneNumber", "provider", "emailVerified"} <= set(auth_fields)
assert {"entryDate", "energyLevel", "presenceLevel", "meals", "reflections"} <= set(journal_fields)

for native_origin in ("http://localhost", "capacitor://localhost", "https://localhost"):
    for endpoint in ("/api/v1/auth/sync-user", "/api/v1/journal/entries"):
        status, headers, _ = request(endpoint, method="OPTIONS", headers={
            "Origin": native_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        })
        assert status in (200, 204), f"CORS preflight failed: {native_origin} {endpoint} ({status})"
        assert headers.get("access-control-allow-origin") == native_origin, f"CORS origin missing: {native_origin}"
        assert "POST" in headers.get("access-control-allow-methods", "")
        allowed_headers = headers.get("access-control-allow-headers", "").lower()
        assert "authorization" in allowed_headers and "content-type" in allowed_headers

    status, headers, body = request("/api/v1/auth/me", headers={"Origin": native_origin})
    assert status == 401, f"Anonymous auth/me must return 401, got {status}"
    assert headers.get("access-control-allow-origin") == native_origin
    envelope = json.loads(body)
    assert envelope.get("data") is None and envelope.get("errors"), "FastAPI error envelope mismatch"
    assert envelope.get("meta", {}).get("requestId"), "FastAPI requestId missing"

print("FastAPI mobile contract OK" + (" (direct origin diagnostic)" if origin_ip else " (public domain)"))
