from playwright.sync_api import sync_playwright

def verify_geo_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate
        try:
            page.goto("http://localhost:3000/en/tools/geo-forge")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Check title
        title = page.title()
        print("Page title:", title)
        # assert "Geo Forge" in title

        # Wait for Toolbar buttons
        # The title attribute might be "Buffer" or "Reverse"
        try:
            page.wait_for_selector("button[aria-label='Buffer']", timeout=5000)
            print("Buffer button found.")
        except:
            print("Buffer button NOT found.")

        try:
            page.wait_for_selector("button[aria-label='Reverse']", timeout=5000)
            print("Reverse button found.")
        except:
             print("Reverse button NOT found.")

        # Take screenshot
        page.screenshot(path="verification/geo_forge_ui.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_geo_forge()
