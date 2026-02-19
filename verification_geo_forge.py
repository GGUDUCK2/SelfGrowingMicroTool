import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to Geo Forge
    page.goto("http://localhost:5173/en/tools/geo-forge")

    # Wait for page load
    page.wait_for_selector("button[aria-label='Help & FAQ']", timeout=10000)

    # Click Help button via JS
    page.evaluate("document.querySelector(\"button[aria-label='Help & FAQ']\").click()")

    # Wait for modal content
    time.sleep(2)

    # Screenshot
    page.screenshot(path="geo_forge_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
