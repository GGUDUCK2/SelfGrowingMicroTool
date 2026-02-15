from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rhythm_forge(page: Page):
    # Navigate to the Rhythm Forge tool
    page.goto("http://localhost:5173/en/tools/rhythm-forge")

    # Wait for hydration
    page.wait_for_timeout(2000)

    # Check for Library tab
    expect(page.get_by_text("Library").first).to_be_visible()

    # Check for Stats
    expect(page.get_by_text("Today")).to_be_visible()
    expect(page.get_by_text("Streak")).to_be_visible()

    # Check for Share button
    expect(page.get_by_label("Share Rhythm")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/verification_rhythm_forge.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_rhythm_forge(page)
        finally:
            browser.close()
