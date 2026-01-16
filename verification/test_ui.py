from playwright.sync_api import sync_playwright

def verify_ui_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify Diff Viewer
        try:
            print("Navigating to Diff Viewer...")
            page.goto("http://localhost:4173/en/tools/diff-viewer", timeout=60000)
            page.wait_for_load_state("networkidle")

            # Screenshot Diff Viewer Buttons & Editor
            print("Taking screenshot of Diff Viewer...")
            page.screenshot(path="verification/diff_viewer_ui.png", full_page=True)

        except Exception as e:
            print(f"Error checking Diff Viewer: {e}")

        # Verify JSON Architect
        try:
            print("Navigating to JSON Architect...")
            page.goto("http://localhost:4173/en/tools/json-architect", timeout=60000)
            page.wait_for_load_state("networkidle")

            # Screenshot JSON Architect Toolbar & Editor
            print("Taking screenshot of JSON Architect...")
            page.screenshot(path="verification/json_architect_ui.png", full_page=True)

        except Exception as e:
            print(f"Error checking JSON Architect: {e}")

        browser.close()

if __name__ == "__main__":
    verify_ui_changes()
