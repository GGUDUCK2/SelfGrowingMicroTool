from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # 1. Navigate to Chrono Shift
            page.goto("http://localhost:4173/en/tools/chrono-shift")

            # 2. Wait for the page to load by checking the title
            expect(page.get_by_role("heading", name="Chrono Shift: Time Zone Architect")).to_be_visible()

            # 3. Add a location to trigger the dropdown
            # Target the first text input since the second one is inside a modal.
            page.locator("input[type='text']").first.fill("America")

            # 4. Wait for the dropdown button to appear and verify it
            dropdown_button = page.locator("button.min-h-\\[44px\\]:has-text('America')").first
            expect(dropdown_button).to_be_visible()

            # 5. Take Screenshot
            page.screenshot(path="verification/chrono_shift_dropdown.png", full_page=True)
            print("Screenshot saved to verification/chrono_shift_dropdown.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state_chrono.png")
            print("Error screenshot saved.")
        finally:
            browser.close()

if __name__ == "__main__":
    run()