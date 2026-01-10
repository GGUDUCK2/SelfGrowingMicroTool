from playwright.sync_api import sync_playwright, expect

def test_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        try:
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/cipher-lab")

            # 1. Verify Title
            expect(page).to_have_title("Cipher Lab: Crypto & Token Suite - MicroTools")

            # Wait for transition
            page.wait_for_timeout(1000)

            print("Clicking Simple Text...")
            # 2. Click "Simple Text" Example
            btn = page.get_by_role("button", name="Simple Text")
            btn.click()

            # 3. Verify Input is populated
            print("Verifying input...")
            input_area = page.get_by_label("Input Text / Payload")
            expect(input_area).to_contain_text("The quick brown fox", timeout=5000)

            # 4. Verify Output
            print("Verifying output...")
            output_area = page.get_by_label("Hash Result")
            expect(output_area).to_contain_text("d7a8fbb3", timeout=5000)

            # 5. Take Screenshot
            page.screenshot(path="verification/cipher_lab_verified.png")
            print("Verification successful!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_cipher_lab()
