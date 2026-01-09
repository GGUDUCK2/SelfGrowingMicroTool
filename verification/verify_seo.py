from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use the port found in the preview log (4174)
        page = browser.new_page()
        try:
            page.goto("http://localhost:4174/en/tools/seo-forge")

            # Wait for content
            page.wait_for_selector("h1")

            # Verify Title (exact match or more specific)
            expect(page.get_by_role("heading", name="SEO Forge: Meta & Social Architect")).to_be_visible()

            # Type into Title input
            # Use placeholder if label is tricky due to structure, but label is better
            # The label is "Page Title"
            title_input = page.get_by_label("Page Title")
            title_input.fill("My Awesome SEO Tool")

            # Verify Preview updates
            # The preview card renders the title. We need to be careful about strict mode.
            # We can look for the specific preview container
            expect(page.locator(".text-\[\#1a0dab\]")).to_contain_text("My Awesome SEO Tool")

            # Switch to Social Tab
            page.get_by_role("button", name="Social Previews").click()

            # Wait a bit for transition
            page.wait_for_timeout(500)

            # Take screenshot
            page.screenshot(path="verification/seo_forge.png", full_page=True)
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
