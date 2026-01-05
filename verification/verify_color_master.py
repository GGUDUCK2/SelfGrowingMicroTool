from playwright.sync_api import sync_playwright

def verify_color_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the Color Master tool
        # Assuming port 5173 which is default for Vite
        page.goto("http://localhost:5173/en/color-master")

        # Wait for the page to load
        page.wait_for_selector("h1")

        # Check if UI Preview section exists
        if page.is_visible("text=UI Component Preview"):
            print("UI Preview section found.")
        else:
            print("UI Preview section NOT found.")

        # Check if Buttons exist in preview
        if page.is_visible("button:has-text('Primary Action')"):
             print("Primary Action button found.")

        # Check if A11y Checker shows suggestions (we need to select a failing color first)
        # Let's try to set a color that fails contrast
        # This is tricky with the color picker input, but we can try setting the URL

        page.goto("http://localhost:5173/en/color-master?c=ffff00") # Yellow on white text is bad
        page.wait_for_timeout(1000) # Wait for debounce

        if page.is_visible("text=Try:"):
            print("Suggestion found.")

        # Take a screenshot
        page.screenshot(path="verification/color_master_verification.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_color_master()
