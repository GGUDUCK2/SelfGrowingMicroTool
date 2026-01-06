from playwright.sync_api import sync_playwright

def verify_diff_viewer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Subscribe to console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PageError: {err}"))

        # Navigate to the diff viewer tool
        page.goto("http://localhost:5173/en/tools/diff-viewer")

        # Wait for page load
        page.wait_for_selector("h1")

        # Input original text
        original_input = page.get_by_placeholder("Paste original text here...")
        original_input.fill("Hello World\nThis is a test.")

        # Input modified text
        modified_input = page.get_by_placeholder("Paste modified text here...")
        modified_input.fill("Hello Universe\nThis is a test.")

        # Wait for diff to calculate
        page.wait_for_timeout(2000)

        # Take a screenshot
        page.screenshot(path="verification/diff_viewer_test_2.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_diff_viewer()
