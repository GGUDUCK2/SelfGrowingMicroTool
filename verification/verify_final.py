from playwright.sync_api import sync_playwright, expect
import sys

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 900})

        try:
            print("Navigating...")
            response = page.goto("http://localhost:5173/en/tools/subnet-scope")

            # Verify Title (Use exact match or unique locator)
            expect(page.get_by_role("heading", name="Subnet Scope: Network Architect")).to_be_visible()

            # Click Smart Example
            print("Clicking Smart Example...")
            page.get_by_text("Home (/24)").click()

            # Switch to Subnetting
            print("Switching to Subnetting...")
            page.get_by_text("Subnetting (VLSM)").click()

            # Generate
            print("Generating...")
            page.get_by_text("Generate Subnets").click()

            # Check Export
            print("Verifying Export Buttons...")
            expect(page.get_by_text("Export CSV")).to_be_visible()

            print("Taking screenshot...")
            page.screenshot(path="verification/subnet_scope_final.png")
            print("Verified!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_final.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run()
