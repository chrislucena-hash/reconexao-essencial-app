#!/usr/bin/env python3
"""Check the approved Play icon against Android sources and a built AAB.

The fingerprint represents the cosmic heart with the "RECONEXÃO ESSENCIAL"
wordmark shown in the pt-BR Play listing on 2026-10-05. Change it only after
the store listing, web icon, and all native icons have been reviewed together.
"""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import struct
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile
import zlib


ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
DENSITIES = ("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")
ICONS = ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png")
EXPECTED_FINGERPRINT = "8998cfe6c1d5cd249f54bb5d7ab2c458b806a50f4afe3fe751e0fab1656da8cd"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def icon_paths() -> list[Path]:
    return [Path("public/icon-512.png")] + [
        Path(f"android/app/src/main/res/mipmap-{density}/{icon}")
        for density in DENSITIES
        for icon in ICONS
    ]


def verify_sources() -> None:
    digest = hashlib.sha256()
    for relative in icon_paths():
        digest.update(str(relative).encode() + b"\0")
        digest.update((ROOT / relative).read_bytes())
        digest.update(b"\0")
    if digest.hexdigest() != EXPECTED_FINGERPRINT:
        raise ValueError(
            "Os ícones de origem diferem da arte cósmica com texto da ficha pt-BR. "
            "Não gere a release deste checkout sem alinhar a identidade."
        )

    strings = ET.parse(RES / "values/strings.xml").getroot()
    names = {item.attrib.get("name"): item.text for item in strings}
    if names.get("app_name") != "Reconexão Essencial":
        raise ValueError("Nome instalado diferente de Reconexão Essencial")

    manifest = ET.parse(ROOT / "android/app/src/main/AndroidManifest.xml").getroot()
    application = manifest.find("application")
    if application is None or application.get(ANDROID_NS + "icon") != "@mipmap/ic_launcher":
        raise ValueError("Manifesto não aponta para o ícone aprovado")
    if application.get(ANDROID_NS + "roundIcon") != "@mipmap/ic_launcher_round":
        raise ValueError("Manifesto não aponta para o ícone redondo aprovado")

    for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        icon = ET.parse(RES / "mipmap-anydpi-v26" / name).getroot()
        foreground = icon.find("foreground")
        if icon.tag != "adaptive-icon" or foreground is None or foreground.get(ANDROID_NS + "drawable") != "@mipmap/ic_launcher_foreground":
            raise ValueError(f"Ícone adaptativo inválido: {name}")


def decoded_png(png: bytes) -> tuple[int, int, bytes]:
    """Decode the 8-bit RGB/RGBA PNGs used by the launcher, without dependencies."""
    if not png.startswith(PNG_SIGNATURE):
        raise ValueError("Recurso de ícone não é PNG")
    offset = len(PNG_SIGNATURE)
    compressed = bytearray()
    width = height = channels = 0
    while offset < len(png):
        length = struct.unpack_from(">I", png, offset)[0]
        kind = png[offset + 4:offset + 8]
        data = png[offset + 8:offset + 8 + length]
        offset += 12 + length
        if kind == b"IHDR":
            width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", data)
            if depth != 8 or color not in (2, 6) or interlace:
                raise ValueError("Formato PNG de ícone não suportado")
            channels = 3 if color == 2 else 4
        elif kind == b"IDAT":
            compressed.extend(data)
        elif kind == b"IEND":
            break
    if not width or not height or not compressed:
        raise ValueError("PNG de ícone incompleto")

    raw = zlib.decompress(compressed)
    stride = width * channels
    previous = bytearray(stride)
    pixels = bytearray()
    offset = 0
    for _ in range(height):
        filter_type = raw[offset]
        row = bytearray(raw[offset + 1:offset + 1 + stride])
        offset += stride + 1
        for index in range(stride):
            left = row[index - channels] if index >= channels else 0
            up = previous[index]
            upper_left = previous[index - channels] if index >= channels else 0
            if filter_type == 0:
                predictor = 0
            elif filter_type == 1:
                predictor = left
            elif filter_type == 2:
                predictor = up
            elif filter_type == 3:
                predictor = (left + up) // 2
            elif filter_type == 4:
                base = left + up - upper_left
                distances = (abs(base - left), abs(base - up), abs(base - upper_left))
                predictor = (left, up, upper_left)[distances.index(min(distances))]
            else:
                raise ValueError(f"Filtro PNG desconhecido: {filter_type}")
            row[index] = (row[index] + predictor) & 0xFF
        for index in range(0, stride, channels):
            red, green, blue = row[index:index + 3]
            alpha = row[index + 3] if channels == 4 else 255
            # AAPT may change invisible RGB values; they do not affect the icon.
            pixels.extend((red, green, blue, alpha) if alpha else (0, 0, 0, 0))
        previous = row
    return width, height, bytes(pixels)


def verify_aab(path: Path) -> None:
    with ZipFile(path) as bundle:
        for density in DENSITIES:
            for icon in ICONS:
                member = f"base/res/mipmap-{density}-v4/{icon}"
                source = (RES / f"mipmap-{density}" / icon).read_bytes()
                if decoded_png(bundle.read(member)) != decoded_png(source):
                    raise ValueError(f"Ícone empacotado diferente do arquivo aprovado: {member}")
        for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
            if f"base/res/mipmap-anydpi-v26/{name}" not in bundle.namelist():
                raise ValueError(f"Ícone adaptativo ausente do AAB: {name}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--aab", type=Path, help="Compare os PNGs empacotados com os 15 ícones aprovados")
    args = parser.parse_args()
    try:
        verify_sources()
        if args.aab:
            verify_aab(args.aab)
    except (ValueError, OSError, KeyError, ET.ParseError, zlib.error) as error:
        print(f"Identidade Android inválida: {error}", file=sys.stderr)
        return 1
    print("Identidade Android validada: nome e 15 ícones; AAB conferido." if args.aab else "Identidade Android validada: nome e 15 ícones de origem.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
