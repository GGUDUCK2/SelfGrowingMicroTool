from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173/en/tools/schema-forge', timeout=60000)

        # Verify JSON-LD schemas
        json_ld_count = page.locator('script[type="application/ld+json"]').count()
        print(f"Found {json_ld_count} JSON-LD schemas")

        # Take a screenshot to inspect if needed
        page.screenshot(path="screenshot.png")
        print("Screenshot saved to screenshot.png")

        browser.close()

if __name__ == '__main__':
    verify_ui()
