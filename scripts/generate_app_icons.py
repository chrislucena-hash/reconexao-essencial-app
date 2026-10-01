#!/usr/bin/env python3
"""Render the existing SVG identity for Android, iOS, the web and Google Play.

Run with Python 3, Pillow and Google Chrome/Chromium installed:
    python3 scripts/generate_app_icons.py
Set CHROME_BIN to select a browser executable. No network access is needed.
The full logo in public/icon.svg remains the source and is never overwritten.
"""

from copy import deepcopy
from io import BytesIO
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
SVG = "http://www.w3.org/2000/svg"
BACKGROUND = "#020617"
RENDER_SIZE = 1024
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
ET.register_namespace("", SVG)


def strip_insignificant_whitespace(element: ET.Element) -> ET.Element:
    if element.text is not None and not element.text.strip():
        element.text = None
    if element.tail is not None and not element.tail.strip():
        element.tail = None
    for child in element:
        strip_insignificant_whitespace(child)
    return element


def mark_svg(source: ET.Element, *, adaptive: bool) -> bytes:
    root = ET.Element(f"{{{SVG}}}svg", {
        "viewBox": "0 0 512 512", "width": "512", "height": "512",
        "role": "img", "aria-label": "Reconexão Essencial",
    })
    ET.SubElement(root, f"{{{SVG}}}title").text = "Reconexão Essencial"
    root.append(strip_insignificant_whitespace(deepcopy(source.find(f"{{{SVG}}}defs"))))
    if not adaptive:
        ET.SubElement(root, f"{{{SVG}}}rect", {
            "width": "512", "height": "512", "fill": BACKGROUND,
        })
    # The source symbol is centered at (300, 240). Android foreground artwork
    # stays inside the central 66 dp circle of its 108 dp canvas. The web/Play
    # version uses the larger safe circle for maskable web icons.
    scale = "0.60" if adaptive else "0.80"
    group = ET.SubElement(root, f"{{{SVG}}}g", {
        "transform": f"translate(256 256) scale({scale}) translate(-300 -240)",
    })
    for element in source.findall(f"{{{SVG}}}g"):
        group.append(strip_insignificant_whitespace(deepcopy(element)))
    return ET.tostring(root, encoding="utf-8", xml_declaration=True) + b"\n"


def render(svg: bytes, browser: str) -> Image.Image:
    with tempfile.TemporaryDirectory(prefix="reconexao-icons-") as directory:
        temp = Path(directory)
        html = temp / "icon.html"
        html.write_text(
            "<!doctype html><meta charset='utf-8'>"
            "<style>html,body{margin:0;padding:0;background:transparent}"
            f"svg{{display:block;width:{RENDER_SIZE}px;height:{RENDER_SIZE}px}}"
            "</style>" + svg.decode().split("?>", 1)[-1],
            encoding="utf-8",
        )
        screenshot = temp / "render.png"
        command = [
            browser, "--headless", "--disable-gpu", "--hide-scrollbars",
            "--no-first-run", "--no-default-browser-check",
            "--disable-background-networking", "--force-device-scale-factor=1",
            "--default-background-color=00000000", "--virtual-time-budget=1000",
            f"--window-size={RENDER_SIZE},{RENDER_SIZE + 200}",
            f"--user-data-dir={temp / 'profile'}", f"--screenshot={screenshot}",
            html.as_uri(),
        ]
        subprocess.run(command, check=True, capture_output=True, timeout=60)
        return Image.open(BytesIO(screenshot.read_bytes())).convert("RGBA").crop(
            (0, 0, RENDER_SIZE, RENDER_SIZE)
        )


def save(image: Image.Image, path: Path, size: int, *, round_icon: bool = False) -> None:
    output = image.resize((size, size), Image.Resampling.LANCZOS)
    if round_icon:
        mask = Image.new("L", (RENDER_SIZE, RENDER_SIZE))
        ImageDraw.Draw(mask).ellipse((0, 0, RENDER_SIZE - 1, RENDER_SIZE - 1), fill=255)
        output.putalpha(mask.resize((size, size), Image.Resampling.LANCZOS))
    path.parent.mkdir(parents=True, exist_ok=True)
    output.save(path, optimize=True)


def main() -> None:
    browser = os.environ.get("CHROME_BIN") or shutil.which("google-chrome") or shutil.which("chromium")
    if not browser:
        raise SystemExit("Install Google Chrome/Chromium or set CHROME_BIN.")
    source = ET.parse(ROOT / "public/icon.svg").getroot()
    if source.find(f"{{{SVG}}}defs") is None or not source.findall(f"{{{SVG}}}g"):
        raise SystemExit("public/icon.svg must contain the original symbol group and definitions.")
    full_svg = mark_svg(source, adaptive=False)
    (ROOT / "public/icon-mark.svg").write_bytes(full_svg)
    full = render(full_svg, browser)
    foreground = render(mark_svg(source, adaptive=True), browser)
    for size in (192, 512):
        save(full, ROOT / f"public/icon-{size}.png", size)
    # Google Play requires a full square icon; transparency is removed here.
    save(full.convert("RGB"), ROOT / "assets/play-store/icon-512.png", 512)
    save(full.convert("RGB"), ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", 1024)
    for density, factor in DENSITIES.items():
        directory = RES / f"mipmap-{density}"
        save(full, directory / "ic_launcher.png", int(48 * factor))
        save(full, directory / "ic_launcher_round.png", int(48 * factor), round_icon=True)
        save(foreground, directory / "ic_launcher_foreground.png", int(108 * factor))
    (RES / "values/ic_launcher_background.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
        f'    <color name="ic_launcher_background">{BACKGROUND}</color>\n'
        '</resources>\n', encoding="utf-8",
    )
    (RES / "drawable/ic_launcher_background.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">\n'
        f'    <solid android:color="{BACKGROUND}" />\n</shape>\n', encoding="utf-8",
    )
    (RES / "drawable-v24/ic_launcher_foreground.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<bitmap xmlns:android="http://schemas.android.com/apk/res/android"\n'
        '    android:src="@mipmap/ic_launcher_foreground" android:gravity="center" />\n',
        encoding="utf-8",
    )
    print("Generated 15 Android launcher PNGs, the iOS icon, web icons, and the Google Play icon.")


if __name__ == "__main__":
    main()
