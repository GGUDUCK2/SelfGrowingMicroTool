from playwright.sync_api import Page, expect, sync_playwright

def verify_markdown_studio(page: Page):
    print("Navigating to Markdown Studio...")
    # 1. Arrange: Go to the tool page
    page.goto("http://localhost:5173/en/tools/markdown-studio")
    page.wait_for_load_state("networkidle")

    # 2. Verify FAQ Section
    print("Verifying FAQ...")
    # Check if FAQ questions are visible (e.g. "How does the preview work?")
    # If props were fixed, these should be rendered.
    faq_question = page.get_by_text("How does the preview work?")
    expect(faq_question).to_be_visible()
    print("FAQ question found.")

    # 3. Verify Related Tools
    print("Verifying Related Tools...")
    # Check if "Related Tools" section is present and links exist
    related_tools_header = page.get_by_text("Related Tools")
    expect(related_tools_header).to_be_visible()

    snippet_forge_link = page.get_by_role("link", name="Snippet Forge")
    expect(snippet_forge_link).to_be_visible()
    print("Related Tools section found.")

    # 4. Screenshot
    # Scroll to bottom to see FAQ and Related Tools
    related_tools_header.scroll_into_view_if_needed()
    page.screenshot(path="verification_markdown_studio.png")
    print("Screenshot taken.")

    # 5. Check Breadcrumb Schema (Programmatic check)
    print("Checking JSON-LD schemas...")
    # We can evaluate JS to check if the schema script exists
    schemas = page.evaluate("""() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        return Array.from(scripts).map(s => JSON.parse(s.innerText));
    }""")

    found_breadcrumb = False
    for schema in schemas:
        if schema.get('@type') == 'BreadcrumbList':
            found_breadcrumb = True
            print("Found BreadcrumbList:", schema)
            break

    if found_breadcrumb:
        print("BreadcrumbList schema verification PASSED.")
    else:
        print("BreadcrumbList schema NOT found.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_markdown_studio(page)
        finally:
            browser.close()
