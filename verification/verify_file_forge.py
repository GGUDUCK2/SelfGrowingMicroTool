from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # 1. Navigate to File Forge
            page.goto("http://localhost:4173/en/tools/file-forge")

            # 2. Upload a test file
            page.set_input_files("input[type='file']", {
                "name": "test.txt",
                "mimeType": "text/plain",
                "buffer": b"Hello World! This is a test file for File Forge Inspector."
            })

            # 3. Wait for analysis
            expect(page.get_by_text("Active File")).to_be_visible()

            # 4. Click Inspector Tab using aria-label
            # The tab uses Lucide icons and text, so get_by_role("button", name="Inspector") should work
            # But the dict lookup might be async or missing.
            # Let's target the aria-label which is cleaner
            page.locator("button[aria-label='Inspector']").click()

            # 5. Check for new features
            expect(page.get_by_text("Hex Viewer")).to_be_visible()

            # 5b. Edit Mode button
            # Note: aria-label might be different if dict is loading slow
            # Let's wait for the button to appear
            expect(page.locator("button:has-text('Edit Mode')")).to_be_visible()

            # 5c. Entropy/Byte Class toggle
            # These are simple text buttons
            expect(page.get_by_role("button", name="Byte Class")).to_be_visible()

            # 5d. Toggle to Byte Class Map
            page.get_by_role("button", name="Byte Class").click()

            # 6. Take Screenshot
            page.screenshot(path="verification/file_forge_inspector.png", full_page=True)
            print("Screenshot saved to verification/file_forge_inspector.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
