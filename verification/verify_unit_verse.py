
from playwright.sync_api import sync_playwright, expect
import time

def verify_unit_verse():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the tool page
            page.goto("http://localhost:5173/en/unit-verse")

            # Wait for content to load - Use a more specific selector
            expect(page.get_by_role("heading", name="Unit Verse: Universal Unit Converter")).to_be_visible()

            # Verify category selection (default is Length)
            expect(page.locator("button[aria-label='Length']")).to_be_visible()

            # Wait a bit for initial state to settle
            time.sleep(1)

            # Select units
            from_select = page.locator("select[aria-label='From unit']")
            to_select = page.locator("select[aria-label='To unit']")

            # The issue might be that default is Km -> m.
            # I want m -> Km.

            # Set From to Meter
            from_select.select_option(value="meter")
            time.sleep(0.5) # Give it time to react

            # Set To to Kilometer
            to_select.select_option(value="kilometer")
            time.sleep(0.5)

            # Input value AFTER setting units to avoid transient large numbers if possible,
            # though reactive loop will fire anyway.
            input_box = page.locator("input#input-value")
            input_box.fill("1000")

            # Wait for result calculation
            time.sleep(1)

            # Check result: 1000 m = 1 km
            result_box = page.locator("#output-result")
            print(f"Result text: {result_box.inner_text()}")
            expect(result_box).to_have_text("1")

            # Check formula
            expect(page.get_by_text("1000 × 0.001 = 1", exact=False)).to_be_visible()

            # Take screenshot
            page.screenshot(path="verification/unit-verse.png", full_page=True)
            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_unit_verse()
