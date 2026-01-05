from playwright.sync_api import sync_playwright

def verify_lumina():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the Lumina tool
            page.goto("http://localhost:5173/en/color-master", timeout=60000)

            # Wait for the page to load
            page.wait_for_selector("h1", timeout=60000)
            print("Page loaded")

            # Check for the title
            title = page.title()
            print(f"Page title: {title}")

            # Check for the shortcuts button - try triggering with '?'
            # Note: The '?' key might need Shift+/, so we can try simply typing '?'
            page.keyboard.type("?")

            # Wait for modal - use a broader selector if text fails
            try:
                page.wait_for_selector("text=Shortcuts", timeout=5000)
                print("Shortcuts modal found")
            except:
                print("Shortcuts modal not found by text, trying role")
                page.wait_for_selector("div[role='dialog']", timeout=5000)
                print("Shortcuts modal found by role")


            # Take a screenshot with the modal open
            page.screenshot(path="verification/lumina_shortcuts.png")
            print("Screenshot saved to verification/lumina_shortcuts.png")

            # Close modal
            page.keyboard.press("Escape")

            # Generate random color
            page.keyboard.press("Space")
            page.wait_for_timeout(1000) # Wait for animation

            # Take a screenshot of random color
            page.screenshot(path="verification/lumina_random.png")
            print("Screenshot saved to verification/lumina_random.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_lumina()
