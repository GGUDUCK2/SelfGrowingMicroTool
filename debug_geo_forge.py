import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173/en/tools/geo-forge")
        page.wait_for_selector("body", timeout=10000)
        time.sleep(2)
        page.screenshot(path="debug_geo_forge.png")
    except Exception as e:
        print(e)
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
