import time
from playwright.sync_api import sync_playwright, expect

def verify_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to Cipher Lab
            page.goto("http://localhost:4173/en/tools/cipher-lab")
            page.wait_for_load_state("networkidle")

            # 1. Verify Smart Hash Analyzer
            print("Verifying Hash Analyzer...")
            input_box = page.locator("#input")

            # Type an MD5 hash
            md5_hash = "5d41402abc4b2a76b9719d911017c592"
            input_box.fill(md5_hash)

            # Check if "Looks like MD5" appears
            expect(page.get_by_text("Looks like MD5")).to_be_visible()
            print("Hash Analyzer detected MD5!")

            # 2. Verify Password Forge Entropy
            print("Verifying Password Forge...")
            # Switch to Password tab
            page.get_by_role("tab", name="Password Forge").click()

            # Wait for slide transition
            page.wait_for_timeout(1000)

            # Check for Entropy Label (Use exact=True to avoid partial matches)
            expect(page.get_by_text("Entropy", exact=True)).to_be_visible()

            # Click generate button explicitly
            page.get_by_role("button", name="Generate").click()
            page.wait_for_timeout(500)

            # 3. Verify History and Restore
            print("Verifying History Restore...")
            # Save the password
            page.get_by_label("Save").click()

            # Check toast
            expect(page.get_by_text("Saved to secure history")).to_be_visible()

            # Check History Panel item
            history_item = page.locator(".break-all.line-clamp-2").first
            expect(history_item).to_be_visible()

            # Hover over history item to see Restore button
            history_card = page.locator(".group").first
            history_card.hover()

            # Click Restore
            restore_btn = page.get_by_label("Restore").first
            expect(restore_btn).to_be_visible()
            restore_btn.click()

            expect(page.get_by_text("Restored from history")).to_be_visible()
            print("Restore successful!")

            # Take screenshot
            page.screenshot(path="verification/cipher_lab_verified.png", full_page=True)
            print("Screenshot saved to verification/cipher_lab_verified.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cipher_lab()
