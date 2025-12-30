from playwright.sync_api import sync_playwright

def verify_palette_generator():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool page (English)
        page.goto("http://localhost:3000/en/tools/color-palette-generator")

        # Wait for the title to be visible
        page.wait_for_selector("h1")

        # Generate a new palette
        page.click("button:has-text('Generate Palette')")
        page.wait_for_timeout(1000) # Wait for animation

        # Lock the first color
        # The lock button is inside the color blocks.
        # We can find buttons with 'Unlock' title (default is unlocked, title says 'Lock' actually? Let's check logic)
        # Logic: title={locked[index] ? 'Unlock' : 'Lock'}
        # Initially locked is false, so title is 'Lock'.

        # Click the first lock button
        locks = page.locator("button[title='Lock']")
        if locks.count() > 0:
            locks.first.click()
            page.wait_for_timeout(500)

        # Generate again
        page.keyboard.press("Space")
        page.wait_for_timeout(1000)

        # Take screenshot
        page.screenshot(path="verification/palette_tool.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_palette_generator()
