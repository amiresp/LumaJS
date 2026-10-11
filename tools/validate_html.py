#!/usr/bin/env python3
"""LumaJS HTML contract checks. Python stdlib only; not a browser runtime dependency."""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

SKIP = {".git", "node_modules", "vendor", "dist", "build", "__pycache__"}
# A literal backslash followed by 'n', typically caused by an AI emitting escaped
# newline text into HTML instead of writing a real newline.
ESCAPED_NEWLINE = re.compile(r"(?<!\\)\\n")
# /n is not an escape sequence. Flag only where it is strongly suspicious, to
# avoid rejecting URLs (/news) or legitimate user-facing text.
SLASH_N = re.compile(r"(?:(?<=\\s)|(?<=>))/n(?=\\s|<|$)")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}
RAW = {"script", "style", "pre", "code", "textarea"}


class Validator(HTMLParser):
    def __init__(self, path: Path, source: str):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.source = source
        self.errors: list[tuple[int, str]] = []
        self.stack: list[tuple[str, int]] = []
        self.raw_depth = 0

    def error_at(self, line: int, message: str):
        self.errors.append((line, message))

    def check_text(self, text: str, line: int, context: str):
        for regex, label in ((ESCAPED_NEWLINE, r"literal \\n"), (SLASH_N, "literal /n")):
            for match in regex.finditer(text):
                self.error_at(line + text.count("\n", 0, match.start()), f"{label} in {context}")

    def handle_starttag(self, tag, attrs):
        line = self.getpos()[0]
        for key, value in attrs:
            if value is not None:
                self.check_text(value, line, f"attribute {key}")
        if tag not in VOID:
            self.stack.append((tag, line))
            if tag in RAW:
                self.raw_depth += 1

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            self.error_at(self.getpos()[0], f"void tag </{tag}> must not have a closing tag")
            return
        if not self.stack:
            self.error_at(self.getpos()[0], f"unmatched closing tag </{tag}>")
            return
        if self.stack[-1][0] != tag:
            # HTMLParser is not an HTML5 DOM parser; limit this check to mismatches
            # rather than attempting browser-style implicit closing repairs.
            self.error_at(self.getpos()[0],
                          f"closing </{tag}> does not match open <{self.stack[-1][0]}>")
            return
        self.stack.pop()
        if tag in RAW:
            self.raw_depth -= 1

    def handle_data(self, data):
        if self.raw_depth == 0:
            self.check_text(data, self.getpos()[0], "text")

    def finish(self):
        for tag, line in self.stack:
            self.error_at(line, f"unclosed <{tag}>")

def check(path: Path):
    try:
        source = path.read_text(encoding="utf-8-sig")
    except (UnicodeError, OSError) as error:
        return [(1, f"cannot read UTF-8 HTML: {error}")]
    parser = Validator(path, source)
    try:
        parser.feed(source)
        parser.close()
        parser.finish()
    except Exception as error:
        parser.error_at(parser.getpos()[0], f"HTML parser failure: {error}")
    return parser.errors

def main():
    args = argparse.ArgumentParser(description="Validate all LumaJS HTML files")
    args.add_argument("paths", nargs="*", default=["."], help="roots to scan")
    opts = args.parse_args()
    files = sorted({
        file for root in map(Path, opts.paths)
        for file in ([root] if root.is_file() else root.rglob("*.html"))
        if file.is_file() and not any(part in SKIP for part in file.parts)
    })
    failures = 0
    for file in files:
        for line, message in check(file):
            print(f"{file}:{line}: error: {message}")
            failures += 1
    print(f"HTML validation: {len(files)} files, {failures} errors")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main())
