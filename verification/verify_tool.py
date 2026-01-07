from playwright.sync_api import sync_playwright

def verify_color_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool page (using 'en' locale)
        # Note: Port might be 5173 by default for Vite
        page.goto("http://localhost:5173/en/color-master")

        # Wait for title to ensure hydration
        page.wait_for_selector("h1")

        # 1. Verify Gradient Generator is present
        gradient_title = page.get_by_text("Gradient Generator")
        if gradient_title.is_visible():
            print("Gradient Generator is visible")
        else:
            print("Gradient Generator NOT found")

        # 2. Verify Contrast Grid is present
        contrast_title = page.get_by_text("Contrast Matrix")
        if contrast_title.is_visible():
             print("Contrast Matrix is visible")

        # 3. Take a full page screenshot
        page.screenshot(path="verification/color_master.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_color_master()
