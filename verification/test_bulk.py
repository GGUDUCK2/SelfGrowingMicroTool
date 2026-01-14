from playwright.sync_api import sync_playwright

def test_qr_bulk(page):
    # Navigate to QR Forge
    page.goto("http://localhost:4173/en/tools/qr-forge")

    # Wait for hydration
    page.wait_for_timeout(1000)

    # Click Bulk button
    # The buttons are uppercase in UI but might be rendered differently.
    # checking logic: {d.types?.[type] || type.toUpperCase()}
    # Dictionary says "Bulk".
    page.get_by_text("BULK").click()

    # Wait for Bulk UI to slide in
    page.wait_for_timeout(500)

    # Check if textarea is visible
    textarea = page.locator("textarea")
    textarea.fill("https://example.com\nhttps://google.com")

    # Screenshot
    page.screenshot(path="verification/qr_bulk.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_qr_bulk(page)
        finally:
            browser.close()
