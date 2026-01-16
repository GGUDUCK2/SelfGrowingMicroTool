import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Wait for server to start
        max_retries = 30
        for i in range(max_retries):
            try:
                page.goto("http://localhost:5173/en/tools/seo-forge")
                break
            except:
                if i == max_retries - 1:
                    raise
                time.sleep(1)

        # 1. Verify Page Loaded
        expect(page.get_by_role("heading", name="SEO Forge: Meta & Social Architect")).to_be_visible()

        # 2. Test Smart Keyword Suggestions
        # Type in title and description
        page.fill("#title", "MicroTools Factory - The Ultimate Developer Suite")
        page.fill("#description", "A collection of developer tools including JSON Architect, Regex Tester, and SEO Forge. Boost productivity with MicroTools.")

        # Wait for suggestions to appear
        expect(page.get_by_text("Smart Keyword Suggestions")).to_be_visible()
        # Click a suggestion
        page.click("button:has-text('microtools')")

        # Verify it was added to keywords input
        keywords_input = page.input_value("#keywords")
        assert "microtools" in keywords_input

        # 3. Test Image Validator
        # Switch to Social Tab first! The OG Image input is likely in the Social Tab which might be hidden if not active
        page.click("button[role='tab']:has-text('Social Previews')")

        # Enter a valid image URL
        page.fill("#ogImage", "https://via.placeholder.com/150")

        # Wait for validation result
        # Note: via.placeholder.com might redirect or have CORS, so we might get error or success.
        # Let's just check if the validator component appears.
        expect(page.get_by_text("Checking...")).to_be_visible()

        # Wait a bit for async check
        time.sleep(2)

        # Take screenshot
        page.screenshot(path="verification/seo_forge_verified.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
