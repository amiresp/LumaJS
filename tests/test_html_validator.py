import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from validate_html import check


class HtmlValidationTests(unittest.TestCase):
    def validate(self, html):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.html"
            path.write_text(html, encoding="utf-8")
            return [message for _, message in check(path)]

    def test_accepts_valid_markup(self):
        self.assertEqual(self.validate("<section><h1>Hello</h1><img src='/news/photo.png'></section>"), [])

    def test_detects_literal_backslash_n_in_text(self):
        self.assertTrue(any("literal" in message for message in self.validate(r"<div>Hello\nWorld</div>")))

    def test_detects_literal_backslash_n_in_attribute(self):
        self.assertTrue(self.validate(r'<div title="Hello\nWorld"></div>'))

    def test_detects_accidental_slash_n(self):
        self.assertTrue(self.validate("<p>Hello /n World</p>"))

    def test_ignores_javascript_escapes_in_script(self):
        self.assertEqual(self.validate(r"<script>const x = '\n';</script>"), [])

    def test_detects_bad_closing_tag(self):
        self.assertTrue(self.validate("<main><span>Hi</main>"))

    def test_does_not_flag_urls(self):
        self.assertEqual(self.validate('<a href="/news">News</a>'), [])


if __name__ == "__main__":
    unittest.main()
