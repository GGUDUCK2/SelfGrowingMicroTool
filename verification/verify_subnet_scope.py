import time
from playwright.sync_api import sync_playwright, expect

def verify_subnet_scope():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            # Navigate to the tool
            page.goto("http://localhost:5173/en/tools/subnet-scope")

            # Wait for page load
            page.wait_for_load_state("networkidle")

            # Verify title
            expect(page.get_by_role("heading", name="Subnet Scope: Network Architect")).to_be_visible()

            # Check new Smart Examples buttons
            expect(page.get_by_text("Home (/24)")).to_be_visible()

            # Click a smart example
            page.get_by_text("Home (/24)").click()

            # Wait for analysis to update (input value should change)
            input_field = page.get_by_label("IP Address or CIDR Input")
            expect(input_field).to_have_value("192.168.1.0/24")

            # Wait a bit for history to be saved (async)
            time.sleep(1)

            # Verify History Tab
            page.get_by_role("button", name="History").click()
            expect(page.get_by_text("Recent Calculations")).to_be_visible()

            # Use a more specific locator for the history item
            # It should be in the history list
            expect(page.locator(".font-mono.text-lg", has_text="192.168.1.0/24").first).to_be_visible()

            # Take screenshot
            page.screenshot(path="verification/subnet-scope.png")
            print("Verification script completed successfully.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/subnet_scope_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_subnet_scope()
