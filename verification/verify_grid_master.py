from playwright.sync_api import sync_playwright

def verify_grid_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to Grid Master...")
            page.goto("http://localhost:5173/en/tools/grid-master")
            page.wait_for_load_state("networkidle")

            # Switch to Templates tab
            print("Switching to Templates tab...")
            page.click("button[id='tab-templates']")
            page.wait_for_timeout(500)

            # Find the input and type
            print("Typing smart layout command...")
            input_locator = page.locator("#text-layout")
            input_locator.fill("header sidebar main footer")

            # Click Go
            print("Clicking Go...")
            page.get_by_label("Generate Grid").click()

            # Wait for grid to update
            print("Waiting for grid update...")
            page.wait_for_timeout(2000)

            # Take screenshot
            print("Taking final screenshot...")
            page.screenshot(path="verification/grid_master_verification.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()
            print("Done.")

if __name__ == "__main__":
    verify_grid_master()
