
from playwright.sync_api import sync_playwright

def verify_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to Cipher Lab
            # Assuming port 5173 for default Vite dev server
            page.goto("http://localhost:5173/en/tools/cipher-lab")
            page.wait_for_load_state("networkidle")

            # 2. Verify Key Forge Tab
            # Click on 'Key Forge' tab
            page.get_by_role("tab", name="Key Forge").click()
            page.wait_for_timeout(500) # Wait for tab switch

            # Check if Generate Keys button is visible
            generate_btn = page.get_by_role("button", name="Generate Keys")
            if not generate_btn.is_visible():
                raise Exception("Generate Keys button not found")

            # Click Generate Keys
            generate_btn.click()

            # Wait for keys to be generated (Public Key text area should appear)
            page.wait_for_selector("textarea[readonly]", timeout=5000)

            # 3. Verify Bulk Hashing
            # Switch back to Hash tab
            page.get_by_role("tab", name="Hash & HMAC").click()
            page.wait_for_timeout(500)

            # Check for Bulk Mode checkbox
            bulk_mode = page.get_by_text("Bulk Mode")
            if not bulk_mode.is_visible():
                 raise Exception("Bulk Mode checkbox not found")

            bulk_mode.click()

            # Enter multi-line input
            input_area = page.locator("#input")
            input_area.fill("hello\nworld")

            # Wait for output
            page.wait_for_timeout(1000)
            output_area = page.locator("#output")
            output_value = output_area.input_value()

            # Check if output has 2 lines (simple check)
            if len(output_value.strip().split('\n')) < 2:
                 print(f"Output was: {output_value}")
                 raise Exception("Bulk hash didn't produce multiple lines")

            # Take screenshot
            page.screenshot(path="verification/cipher_lab_verified.png", full_page=True)
            print("Verification successful, screenshot saved.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cipher_lab()
