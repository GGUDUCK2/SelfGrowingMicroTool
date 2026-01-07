from playwright.sync_api import sync_playwright

def verify_id_forge(page):
    print("Navigating to ID Forge...")
    page.goto("http://localhost:5173/en/tools/id-forge")
    page.wait_for_timeout(2000)

    print("Checking title...")
    title = page.title()
    print(f"Title: {title}")

    print("Generating IDs...")
    # Click the main Generate button which has "Generate 1 IDs" text usually, but might change based on quantity
    # The tab button is also named "Generate"
    # Let's target the one that says "Generate 1 IDs" or just target the one that looks like a submit button
    page.get_by_role("button", name="Generate 1 IDs").click()
    page.wait_for_timeout(1000)

    print("Checking History...")
    page.wait_for_timeout(1000)

    print("Taking screenshot...")
    page.screenshot(path="verification/id-forge.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_id_forge(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
