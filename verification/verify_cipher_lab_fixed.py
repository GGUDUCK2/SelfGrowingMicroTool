from playwright.sync_api import sync_playwright, expect
import re

def test_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/cipher-lab")

            # 1. Verify Title
            expect(page).to_have_title(re.compile(r"Cipher Lab"))

            # 2. Verify Upload Button exists (New Feature)
            print("Verifying Upload button...")
            expect(page.get_by_label("Upload File")).to_be_visible()

            # 3. Click "Simple Text" Example (Smart Example)
            print("Clicking Simple Text...")
            page.get_by_role("button", name="Simple Text").click()

            # 4. Verify Input is populated
            print("Verifying input...")
            input_area = page.get_by_label("Input Text / Payload")
            expect(input_area).to_have_value("The quick brown fox jumps over the lazy dog")

            # 5. Verify Output is calculated
            print("Verifying output...")
            output_area = page.get_by_label("Hash Result")
            expect(output_area).to_have_value(re.compile(r"d7a8fbb3.*"))

            # 6. Test History Save
            print("Saving to history...")
            page.get_by_role("button", name="Save").click()

            # 7. Verify Toast
            print("Verifying toast...")
            expect(page.get_by_text("Saved to secure history")).to_be_visible()

            # 8. Verify History Item
            print("Verifying history item...")
            expect(page.get_by_text("No recent history.")).not_to_be_visible()

            # 9. Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/cipher_lab_final.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_retry.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_cipher_lab()
