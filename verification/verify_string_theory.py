import time
from playwright.sync_api import sync_playwright, expect

def verify_string_theory():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to String Theory
            page.goto("http://localhost:5173/en/tools/string-theory")
            page.wait_for_load_state("networkidle")

            # 2. Check Title
            expect(page).to_have_title("String Theory: Text Engine - MicroFactory")
            print("Title Verified")

            # 3. Type some text
            editor = page.get_by_role("textbox").first

            editor.fill("This is a messy   text with 123 numbers.")

            # 4. Use Toolbar to Normalize
            page.get_by_role("button", name="Normalize Spaces").click()
            # Wait for reactivity
            page.wait_for_timeout(500)

            # Check result
            expect(editor).to_have_value("This is a messy text with 123 numbers.")
            print("Normalize Spaces Verified")

            # 5. Use Generator (UUID)
            page.get_by_role("button", name="UUID v4").click()
            page.wait_for_timeout(500)

            # 6. Verify Screenshot
            page.screenshot(path="verification/string_theory_verified.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_string_theory()
