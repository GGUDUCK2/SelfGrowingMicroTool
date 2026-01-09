from playwright.sync_api import sync_playwright

def verify_id_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to ID Forge with 'en' locale
        url = "http://localhost:5173/en/tools/id-forge"
        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for hydration
        page.wait_for_timeout(2000)

        # 2. Click on "UUID v7 (JSON Batch)" preset
        print("Clicking preset...")
        page.get_by_text("UUID v7 (JSON Batch)").click()
        page.wait_for_timeout(1000)

        # 3. Verify Output format (should be JSON)
        # Target the code inside the pre tag
        output_code = page.locator("pre code").text_content()
        print("Output excerpt:", output_code[:50] if output_code else "No output")

        # 4. Take screenshot
        page.screenshot(path="verification/id-forge-json.png", full_page=True)

        # 5. Click "ULID (Sortable)"
        print("Clicking ULID preset...")
        page.get_by_text("ULID (Sortable)").click()
        page.wait_for_timeout(1000)

        # 6. Take screenshot
        page.screenshot(path="verification/id-forge-ulid.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_id_forge()
