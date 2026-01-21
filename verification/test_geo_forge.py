import time
from playwright.sync_api import sync_playwright

def test_geo_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        try:
            page.goto("http://localhost:3000/en/tools/geo-forge", timeout=60000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        # Check if title is correct
        print(f"Title: {page.title()}")

        # Interact with the tool
        # 1. Type invalid WKT in input (Data Tab)
        page.get_by_role("button", name="Data Editor").click()
        page.wait_for_selector("textarea")

        # Type broken WKT
        page.fill("textarea", "polygon 0 0, 10 0, 10 10, 0 10, 0 0")
        # Missing parens and case is lowercase

        # Click Repair Button in Toolbar
        # It's an icon button, aria-label "Repair WKT"
        page.get_by_role("button", name="Repair WKT").click()

        # Check if repaired
        time.sleep(1)
        val = page.input_value("textarea")
        print(f"Repaired value: {val}")

        if val == "POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))":
            print("Repair successful!")
        else:
            print("Repair failed or partial.")

        # Switch back to Map
        page.get_by_role("button", name="Map View").click()
        time.sleep(1)

        # Take screenshot of the map with the polygon
        page.screenshot(path="verification/geo_forge_test.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    test_geo_forge()
