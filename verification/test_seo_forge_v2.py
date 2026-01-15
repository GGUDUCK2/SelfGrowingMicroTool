
from playwright.sync_api import sync_playwright, expect

def test_seo_forge(page):
    page.goto("http://localhost:5173/en/tools/seo-forge")

    # Wait for hydration
    page.wait_for_timeout(1000)

    # 1. Test Smart Templates
    # Click templates button
    page.get_by_role("button", name="Smart Templates").click()
    # Click 'Blog Post'
    page.get_by_text("Blog Post").click()

    # Assert fields are filled (e.g. og:type should be article)
    # Fill with valid length data
    page.get_by_label("Page Title").fill("My Awesome Blog Post - A Detailed Guide for Beginners") # > 30 chars
    page.get_by_label("Meta Description").fill("This is a description of my awesome blog post that is long enough to be valid and optimized for search engines.") # > 70 chars

    # 2. Test Audit Panel
    # Check if 'Title length is perfect' appears
    expect(page.get_by_text("Title length is perfect.")).to_be_visible()

    # 3. Test Shortcuts (Ctrl+S)
    # We simulate keyboard press
    page.keyboard.press("Control+s")

    # Check for toast
    expect(page.get_by_text("Saved!")).to_be_visible()

    # 4. Screenshot
    page.screenshot(path="verification/seo_forge_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_seo_forge(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
