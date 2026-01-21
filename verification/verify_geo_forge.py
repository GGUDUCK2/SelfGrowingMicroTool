from playwright.sync_api import sync_playwright

def verify_geo_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Geo Forge
        print("Navigating to Geo Forge...")
        page.goto("http://localhost:3000/en/tools/geo-forge")

        # Wait for title
        print("Waiting for title...")
        page.wait_for_selector("text=Geo Forge")

        # Verify stats panel is present (desktop) or map is present
        print("Verifying map canvas...")
        page.wait_for_selector('div[role="application"][aria-label="Interactive Map"]')

        # Load example
        print("Loading example...")
        page.click("text=Load Example")
        page.click("text=New York Central Park (Polygon)")

        # Wait for stats to update (Area should not be 0)
        print("Waiting for stats update...")
        # Check if "0.00 m²" changes. It might take a split second.
        # We can just take a screenshot and see.
        page.wait_for_timeout(1000)

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/geo_forge.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_geo_forge()
