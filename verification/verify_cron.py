from playwright.sync_api import sync_playwright

def verify_cron_tool():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        # Wait for network idle
        page.goto("http://localhost:5173/en/cron-editor", wait_until="networkidle")

        # 1. Verify Visual Builder
        print("Clicking preset...")
        # Use a more robust selector
        preset_button = page.get_by_role("button", name="Every 5 Minutes")
        if not preset_button.is_visible():
            print("Preset button not visible")
            page.screenshot(path="verification/debug_error.png")

        preset_button.click()

        # Debug: Print current value
        print(f"Value after click: {page.input_value('#cron-input')}")

        # Check input value
        input_value = page.input_value("#cron-input")
        if input_value != "*/5 * * * *":
             print(f"Error: Expected '*/5 * * * *', got '{input_value}'")
        else:
             print("Verified: Preset button updates input")

        # 3. Take Screenshot
        page.screenshot(path="verification/cron_tool.png", full_page=True)
        print("Screenshot taken")

        browser.close()

if __name__ == "__main__":
    verify_cron_tool()
