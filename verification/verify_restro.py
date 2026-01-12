
from playwright.sync_api import sync_playwright, expect

def test_restro_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use port 5173 which is standard for Vite
        page = browser.new_page()

        try:
            print("Navigating to Restro...")
            page.goto("http://localhost:5173/en/restro")
            page.wait_for_load_state("networkidle")

            # 1. Verify Basic UI Elements
            print("Verifying basic UI...")
            # Use specific name
            expect(page.get_by_role("heading", name="Restro v1.1")).to_be_visible()

            # Check for new buttons
            # "Runner" button
            expect(page.locator("button[title='Batch Runner']")).to_be_visible()
            # "Env" button
            expect(page.locator("button[title='Variables']")).to_be_visible()

            # 2. Test Variable Manager
            print("Testing Variable Manager...")
            # Click 'Env' button (Settings2 icon)
            page.locator("button[title='Variables']").click()
            expect(page.get_by_text("Environment Variables")).to_be_visible()

            # Add a variable
            page.get_by_placeholder("Key (e.g. API_KEY)").fill("TEST_VAR")
            page.get_by_placeholder("Value").fill("12345")
            page.get_by_label("Add Variable").click()

            # Verify variable added
            expect(page.get_by_text("TEST_VAR")).to_be_visible()
            expect(page.get_by_text("12345")).to_be_visible()

            # Close modal - wait for animation if needed, or force
            page.keyboard.press("Escape")
            # Wait for modal to disappear
            expect(page.get_by_text("Environment Variables")).to_be_hidden()

            # 3. Test Batch Runner Modal
            print("Testing Batch Runner...")
            # Click 'Runner' button
            page.locator("button[title='Batch Runner']").click()
            expect(page.get_by_text("Batch Collection Runner")).to_be_visible()
            expect(page.get_by_text("No saved collections found")).to_be_visible()
            page.keyboard.press("Escape")
            expect(page.get_by_text("Batch Collection Runner")).to_be_hidden()

            # 4. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/restro_verification.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_restro_features()
