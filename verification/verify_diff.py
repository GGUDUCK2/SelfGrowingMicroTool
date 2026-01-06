
from playwright.sync_api import sync_playwright, expect

def test_diff_viewer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        page.goto("http://localhost:4173/en/tools/diff-viewer")

        # Wait for title
        expect(page.get_by_role("heading", name="DiffScope: Smart Code & Text Comparator")).to_be_visible()

        # Input original text
        original_textarea = page.get_by_placeholder("Paste original text here...")
        original_textarea.fill("Hello World\nThis is a test.\nJSON: { \"a\": 1, \"b\": 2 }")

        # Input modified text
        modified_textarea = page.get_by_placeholder("Paste modified text here...")
        modified_textarea.fill("Hello World!\nThis is a test run.\nJSON: { \"b\": 2, \"a\": 1 }")

        # Wait for diff to calculate (it's reactive but let's give it a sec)
        page.wait_for_timeout(1000)

        # Take screenshot of basic diff
        page.screenshot(path="verification/diff_basic.png", full_page=True)

        # Switch to JSON mode
        page.select_option("select", "json")
        page.wait_for_timeout(1000)

        # Take screenshot of JSON diff
        page.screenshot(path="verification/diff_json.png", full_page=True)

        # Open History
        page.get_by_role("button", name="Comparison History").click()
        page.wait_for_timeout(500)

        # Take screenshot with history
        page.screenshot(path="verification/diff_history.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    test_diff_viewer()
