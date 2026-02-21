
from playwright.sync_api import sync_playwright

def verify_zen_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        page.goto("http://localhost:5173/en/tools/zen-forge")

        # Wait for hydration
        page.wait_for_timeout(2000)

        # Check for new features
        # 1. Share Mix Button
        share_btn = page.locator('button[title="Share Mix"]')
        if share_btn.count() > 0:
            print("Found Share Mix button")
        else:
            print("Share Mix button NOT found")

        # 2. Binaural Journey Toggle
        # It's a checkbox inside a label with text "Binaural Journey"
        # Since standard checkbox is hidden/styled, look for the text
        journey_label = page.get_by_text("Binaural Journey")
        if journey_label.count() > 0:
            print("Found Binaural Journey label")
            # Click the checkbox associated with it
            # The structure is label > span(text) + input
            # We can just click the label
            journey_label.click()
            page.wait_for_timeout(500) # Wait for animation/render
        else:
            print("Binaural Journey label NOT found")

        # 3. Interval Chime Toggle
        chime_label = page.get_by_text("Interval Chime")
        if chime_label.count() > 0:
            print("Found Interval Chime label")
            chime_label.click()
            page.wait_for_timeout(500)
        else:
            print("Interval Chime label NOT found")

        # Take screenshot of the Sidebar (Timer + Controls)
        # We can just take full page
        page.screenshot(path="verification/zen_forge_features.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_zen_forge()
