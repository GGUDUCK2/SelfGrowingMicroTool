import time
from playwright.sync_api import sync_playwright, expect

def verify_subnet_scope():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Navigate to the Subnet Scope tool
        try:
            page.goto("http://localhost:4173/en/tools/subnet-scope")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # 2. Verify Page Title
        expect(page).to_have_title("Subnet Scope: Network Architect")

        # 3. Verify Cloud Presets are visible
        presets = page.locator("text=Cloud & Common Presets")
        expect(presets).to_be_visible()

        # 4. Click a preset (e.g., AWS VPC)
        page.get_by_text("AWS VPC").click()

        # 5. Wait for calculation to update
        # Network address should be 10.0.0.0
        expect(page.locator("text=10.0.0.0").first).to_be_visible()
        # Netmask should be 255.255.0.0 (/16)
        expect(page.locator("text=255.255.0.0")).to_be_visible()

        # 6. Check Visualizer
        # The visualizer should show the binary representation
        visualizer = page.locator(".font-mono.text-sm")
        expect(visualizer).to_be_visible()

        # 7. Check bit markers (hover effect simulation might be tricky in screenshot, but we can check existence in DOM)
        # We added bit markers index+1 every 8 bits. e.g. "8", "16", "24".
        # They are hidden by default (opacity-0), so we might force them visible for screenshot or just trust the DOM check.
        # Let's try to hover over the first byte to trigger the marker.
        first_byte = visualizer.locator("span").first
        first_byte.hover()

        # 8. Switch to Subnetting Tab
        page.get_by_text("Subnetting (VLSM)").click()

        # 9. Generate Subnets (Split /16 into /18)
        page.fill('input[type="number"]', '18')
        page.get_by_role("button", name="Generate Subnets").click()

        # 10. Check Table
        table = page.locator("table")
        expect(table).to_be_visible()
        expect(table).to_contain_text("10.0.64.0/18")

        # 11. Take Screenshot
        page.screenshot(path="verification/subnet_scope_verified.png", full_page=True)
        print("Screenshot saved to verification/subnet_scope_verified.png")

        browser.close()

if __name__ == "__main__":
    verify_subnet_scope()
