from playwright.sync_api import sync_playwright

def test_seo_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the page
            page.goto("http://localhost:5173/en/tools/seo-forge")

            # Wait for content to load
            page.wait_for_selector("h1")

            # Check Audit Panel
            if page.locator("text=Audit Score").is_visible():
                print("Audit Panel visible")
            else:
                print("Audit Panel NOT visible")

            # Check for LinkedIn in Preview
            if page.locator("text=LinkedIn").is_visible():
                print("LinkedIn preview visible")
            else:
                print("LinkedIn preview NOT visible")

            # Take screenshot
            page.screenshot(path="verification/seo_forge_verification.png", full_page=True)
            print("Screenshot saved to verification/seo_forge_verification.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    test_seo_forge()
