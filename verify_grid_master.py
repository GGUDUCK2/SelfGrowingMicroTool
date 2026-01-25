from playwright.sync_api import sync_playwright
import time

def verify_grid_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server to start
        time.sleep(5)

        try:
            url = "http://localhost:5173/en/tools/grid-master"
            print(f"Navigating to {url}")
            page.goto(url)

            # Verify Title
            print("Checking title...")
            # Wait for title to be populated
            page.wait_for_function("document.title.includes('Grid Master')")
            title = page.title()
            print(f"Page title: {title}")

            # Verify Canvas exists
            print("Checking for grid canvas...")
            # We used role="presentation" on the canvas wrapper
            canvas = page.locator("div[role='presentation']")
            canvas.wait_for(state="visible", timeout=10000)

            # Take screenshot
            page.screenshot(path="grid_master_verification.png")
            print("Screenshot saved to grid_master_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_grid_master()
