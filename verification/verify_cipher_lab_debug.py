from playwright.sync_api import sync_playwright, expect
import re

def test_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        try:
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/cipher-lab")

            # 1. Verify Title
            expect(page).to_have_title(re.compile(r"Cipher Lab"))

            # 2. Test Manual Input
            print("Testing manual input...")
            input_area = page.get_by_label("Input Text / Payload")
            input_area.fill("test")

            # Hash of "test" (SHA-256)
            output_area = page.get_by_label("Hash Result")
            expect(output_area).to_have_value(re.compile(r"9f86d081.*"), timeout=5000)
            print("Manual input calculation works.")

            # 3. Test Smart Example Button
            print("Testing Smart Example button...")
            input_area.fill("")

            # Click button with force
            page.get_by_role("button", name="Simple Text").click(force=True)

            # Verify Input
            expect(input_area).to_have_value("The quick brown fox jumps over the lazy dog", timeout=5000)
            print("Button works.")

            # 4. Test History Save (Quick check)
            page.get_by_role("button", name="Save").click()
            expect(page.get_by_text("Saved to secure history")).to_be_visible()

            # 5. Take Screenshot
            page.screenshot(path="verification/cipher_lab_final.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_debug.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_cipher_lab()
