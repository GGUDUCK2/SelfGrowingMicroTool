from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to Grid Master
        print("Navigating to Grid Master...")
        page.goto("http://localhost:5173/en/tools/grid-master")
        page.wait_for_load_state("networkidle")

        # 2. Open Templates Tab
        print("Opening Templates Tab...")
        page.get_by_role("tab", name="Templates").click()

        # 3. Open Wizard
        print("Opening Wizard...")
        page.get_by_label("Open Grid Wizard").click()

        # Wait for modal animation
        page.wait_for_timeout(500)

        # Screenshot 1: Wizard Open
        page.screenshot(path="verification/wizard_step1.png")
        print("Screenshot 1 taken.")

        # 4. Interact with Wizard
        # Step 1: Select Dashboard (Default) -> Click Next
        page.get_by_role("button", name="Next").click()

        # Step 2: Structure (Sidebar Left default) -> Click Next
        page.get_by_role("button", name="Next").click()

        # Step 3: Density (Comfortable default) -> Click Next
        page.get_by_role("button", name="Next").click()

        # Step 4: Review -> Click Generate
        # Scope to dialog to avoid conflict with "Generate Grid" (Go button) in sidebar
        modal = page.get_by_role("dialog")
        modal.get_by_role("button", name="Generate").click()

        # Wait for generation
        page.wait_for_timeout(1000)

        # Screenshot 2: Result
        page.screenshot(path="verification/wizard_result.png")
        print("Screenshot 2 taken.")

        browser.close()

if __name__ == "__main__":
    run()
