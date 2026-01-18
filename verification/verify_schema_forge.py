from playwright.sync_api import Page, expect, sync_playwright

def verify_schema_forge(page: Page):
    # 1. Arrange: Go to the tool page
    print("Navigating to Schema Forge...")
    page.goto("http://localhost:5174/en/tools/schema-forge")
    page.wait_for_load_state("networkidle")

    # 2. Act & Assert: Check for "Data" tab
    print("Checking for Data tab...")
    data_tab = page.get_by_role("button", name="Data")
    expect(data_tab).to_be_visible()

    # 3. Act: Click Data tab
    print("Clicking Data tab...")
    data_tab.click()

    # 4. Assert: Check empty state message
    print("Verifying empty state...")
    expect(page.get_by_text("Select a table to generate mock data")).to_be_visible()

    # 5. Act: Check History button
    print("Checking History button...")
    history_btn = page.get_by_role("button", name="History")
    expect(history_btn).to_be_visible()
    history_btn.click()

    # 6. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/schema_forge_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_schema_forge(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/schema_forge_failed.png")
            raise
        finally:
            browser.close()
