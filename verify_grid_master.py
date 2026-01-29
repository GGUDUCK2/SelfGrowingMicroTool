from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        try:
            # 1. Navigate
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/grid-master")
            # Wait for hydration
            time.sleep(2)

            # 2. Click Templates Tab
            print("Clicking Templates tab...")
            page.get_by_role("tab", name="Templates").click()
            time.sleep(1)

            # 3. Click Dashboard Generator
            print("Clicking Dashboard generator...")
            # Look for button containing Dashboard text
            page.get_by_text("Dashboard", exact=False).first.click()
            time.sleep(1)

            # 4. Click Preview Toggle
            print("Toggling Preview...")
            page.get_by_label("Toggle Preview").click()
            time.sleep(1)

            # 5. Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_grid_master.png")
            print("Screenshot saved to verification_grid_master.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
