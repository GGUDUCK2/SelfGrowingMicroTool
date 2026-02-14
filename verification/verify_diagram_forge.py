from playwright.sync_api import Page, expect, sync_playwright

def test_diagram_forge(page: Page):
    # Navigate to the diagram forge page
    page.goto("http://localhost:5173/en/tools/diagram-forge")

    # Wait for the page to load
    # Verify that the Guide Section is visible
    # We use a text selector for the Guide title
    guide_title = page.get_by_text("Why Diagram Forge?")
    expect(guide_title).to_be_visible()

    # Verify that the FAQ Section is visible
    faq_title = page.get_by_text("Diagram Forge FAQ")
    expect(faq_title).to_be_visible()

    # Verify Toolbar is present. It might not have the class 'overflow-x-auto' directly visible depending on implementation details
    # but we can check if it exists in the DOM with that class.
    # The toolbar container has the class we added.
    toolbar = page.locator("div.overflow-x-auto.whitespace-nowrap.scrollbar-hide")
    # On desktop, it should be visible.
    expect(toolbar).to_be_visible()

    # Take a screenshot
    page.screenshot(path="verification/diagram-forge-desktop.png", full_page=True)

    # Now test mobile view
    page.set_viewport_size({"width": 375, "height": 667})
    # On mobile, the header with h1 should be visible
    header = page.locator("h1", has_text="Diagram Forge")
    expect(header).to_be_visible()

    # Take a mobile screenshot
    page.screenshot(path="verification/diagram-forge-mobile.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_diagram_forge(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
