from playwright.sync_api import Page, expect, sync_playwright
import time

def test_subnet_scope(page: Page):
    try:
        # 1. Navigate
        page.goto("http://localhost:4173/en/tools/subnet-scope")
        expect(page).to_have_title("Subnet Scope: Network Architect")

        # 2. Input
        input_field = page.get_by_placeholder("e.g. 192.168.1.1/24 or 2001:db8::/64")
        input_field.fill("192.168.1.1/24")

        # 3. Analyze
        analyze_btn = page.get_by_role("button", name="Analyze")
        analyze_btn.click()

        # 4. Verify Overview
        # Network address might be 192.168.1.0
        # Relax exact match
        expect(page.get_by_text("192.168.1.0")).to_be_visible()

        # 5. Switch to Subnetting
        subnetting_tab = page.get_by_role("button", name="Subnetting (VLSM)")
        subnetting_tab.click()

        # 6. Generate Subnets
        generate_btn = page.get_by_role("button", name="Generate Subnets")
        generate_btn.click()

        # 7. Verify Table
        expect(page.get_by_text("192.168.1.0/26")).to_be_visible()

        # 8. Screenshot
        page.screenshot(path="verification/subnet_scope.png", full_page=True)
    except Exception as e:
        page.screenshot(path="verification/subnet_scope_error.png", full_page=True)
        raise e

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_subnet_scope(page)
        finally:
            browser.close()
