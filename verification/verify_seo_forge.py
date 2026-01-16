import re
from playwright.sync_api import sync_playwright, expect

def test_seo_forge(page):
    # 1. Navigate to the SEO Forge tool
    page.goto("http://localhost:5173/en/tools/seo-forge")

    # 2. Verify page title
    expect(page).to_have_title(re.compile("SEO Forge"))

    # 3. Fill in some data to trigger the preview
    page.get_by_label("Page Title").fill("MicroTools Factory: The Ultimate Developer Toolkit")
    page.get_by_label("Meta Description").fill("A suite of powerful, client-side developer tools including SEO generators, regex testers, and more.")

    # 4. Switch to Social Preview tab to see Google SERP
    # Note: Tabs are buttons in this UI
    page.get_by_role("tab", name="Social Previews").click()

    # 5. Check if Google Preview is visible (it is the default)
    # The desktop/mobile toggle should be present
    expect(page.get_by_role("button", name="Toggle Mobile/Desktop")).to_be_visible()

    # 6. Take a screenshot of the main editor and preview
    page.screenshot(path="verification/seo_forge_preview.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        # Launch the browser
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        try:
            test_seo_forge(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
