from playwright.sync_api import sync_playwright
import time

def verify_zen_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to Zen Forge...")
            page.goto("http://localhost:5173/en/tools/zen-forge/")

            # Wait for content to load
            page.wait_for_selector("h1", state="visible")

            # Check for Living Atmosphere section
            print("Checking for 'Living Atmosphere'...")
            # Using text locator might be tricky if it's localized, but we are on /en/
            # In dictionaries: "Living Atmosphere"
            atmosphere_header = page.get_by_text("Living Atmosphere")
            if atmosphere_header.count() > 0:
                print("PASS: Living Atmosphere section found.")
            else:
                print("FAIL: Living Atmosphere section NOT found.")

            # Check for specific new sounds
            thunder_text = page.get_by_text("Thunder")
            if thunder_text.count() > 0:
                print("PASS: Thunder sound found.")
            else:
                print("FAIL: Thunder sound NOT found.")

            # Check for Record Button (icon or title)
            # title="Record Mix"
            record_btn = page.locator('button[title="Record Mix"]')
            if record_btn.count() > 0:
                print("PASS: Record button found.")
            else:
                print("FAIL: Record button NOT found.")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/zen_forge_verification.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_zen_forge()
