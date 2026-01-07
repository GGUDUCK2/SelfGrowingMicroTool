from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/en/color-master")
    page.wait_for_timeout(2000) # Wait for hydration

    # Check for title
    print("Page title:", page.title())

    # Check for Export Panel Image button
    page.screenshot(path="verification/color_master_full.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
