from playwright.sync_api import sync_playwright, expect

def test_seo_forge(page):
    # 1. Navigate to SEO Forge
    page.goto("http://localhost:5173/en/tools/seo-forge")

    # Debug: Print title
    print(f"Page Title: {page.title()}")

    # 2. Assert Title (Exact match to avoid strict mode violation)
    expect(page.get_by_role("heading", name="SEO Forge: Meta & Social Architect")).to_be_visible()

    # 3. Test Feature: Smart Keyword Suggestion
    # Fill title and description
    # Using specific labels from the code
    page.get_by_label("Page Title").fill("Amazing SEO Tool for Developers")
    page.get_by_label("Meta Description").fill("The best tool to generate meta tags, open graph, and json-ld for your website. Optimize your SEO with ease.")

    # Click Suggest
    # The button text is "Suggest" with an icon
    page.get_by_role("button", name="Suggest").click()

    # Check if keywords are populated
    page.wait_for_timeout(1000)
    keywords_input = page.get_by_label("Keywords")
    keywords = keywords_input.input_value()
    print(f"Keywords: {keywords}")
    if not keywords:
        print("Keywords empty!")

    # 4. Test Feature: Project Name Input
    page.get_by_placeholder("Project Name (Optional)").fill("My Awesome Project")

    # 5. Test Feature: Save to History
    # The button has "Save" text
    page.get_by_role("button", name="Save").click()

    # Wait for toast
    expect(page.get_by_text("Saved")).to_be_visible()

    # 6. Test Feature: History Display
    page.get_by_role("tab", name="History").click()

    # Check for Project Name tag
    expect(page.get_by_text("My Awesome Project")).to_be_visible()

    # 7. Take Screenshot
    page.screenshot(path="verification/seo-forge-verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_seo_forge(page)
        finally:
            browser.close()
