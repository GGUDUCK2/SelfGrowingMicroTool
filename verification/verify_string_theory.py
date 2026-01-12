import re
from playwright.sync_api import sync_playwright, expect

def verify_string_theory():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to String Theory
            print("Navigating to String Theory...")
            page.goto("http://localhost:5173/en/tools/string-theory")
            page.wait_for_load_state("networkidle")

            # 2. Test Generator: UUID
            print("Testing UUID Generator...")
            uuid_btn = page.get_by_role("button", name="UUID v4")
            expect(uuid_btn).to_be_visible()
            uuid_btn.click()

            # 3. Test Extractors
            print("Testing Magic Extractors...")
            test_text = """
            Here is an email: test@example.com
            And a website: https://micro-factory.app
            And a phone: +1-555-0199
            And a hex color: #6366f1
            """

            # Clear and type (or append)
            editor = page.locator("textarea")
            editor.fill(test_text)

            # Wait for extractor panel title to appear (more specific selector)
            extractor_title = page.get_by_text("Magic Extractors", exact=False).first
            expect(extractor_title).to_be_visible()

            # Check if specific extractors are visible
            expect(page.get_by_text("EMAILS (1)")).to_be_visible()
            expect(page.get_by_text("URLS (1)")).to_be_visible()
            expect(page.get_by_text("HEX COLORS (1)")).to_be_visible()

            # 4. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/string_theory_verification.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_string_theory()
