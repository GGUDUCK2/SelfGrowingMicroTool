from playwright.sync_api import sync_playwright
import os

def verify_diff_viewer():
    print("Starting verification...")
    # ensure dir exists
    os.makedirs("verification", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Browser launched")
        page = browser.new_page()

        # Navigate to Diff Viewer
        try:
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/diff-viewer", timeout=30000, wait_until='domcontentloaded')
            print("Navigation complete")
            page.wait_for_timeout(2000) # Wait for hydration
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        # Load Code Example
        try:
            print("Clicking Code button...")
            page.get_by_role("button", name="Code").click()
            page.wait_for_timeout(500)
            print("Clicked Code button")
        except Exception as e:
            print(f"Failed to click Code button: {e}")

        # Check for Diff Output (visualizer)
        try:
            print("Taking screenshot 1...")
            page.screenshot(path="verification/diff-viewer-new.png")
            print("Screenshot 1 saved to verification/diff-viewer-new.png")
        except Exception as e:
            print(f"Screenshot 1 failed: {e}")

        # Check Conflict Resolver Modal
        try:
            print("Opening Conflict Parser...")
            page.get_by_title("Merge Conflict Parser").click()
            page.wait_for_timeout(500)
        except Exception as e:
             print(f"Failed to click Conflict Parser: {e}")

        # Paste conflict text
        conflict_text = """<<<<<<< HEAD
var x = 1;
=======
var x = 2;
>>>>>>> feature/new-x"""
        page.fill("textarea", conflict_text)

        # Click "Start Resolving"
        try:
            print("Clicking Start Resolving...")
            page.get_by_role("button", name="Start Resolving").click()
            page.wait_for_timeout(1000)

            # Take screenshot of Resolver Interface
            print("Taking screenshot 2...")
            page.screenshot(path="verification/conflict-resolver-new.png")
            print("Screenshot 2 saved to verification/conflict-resolver-new.png")
        except Exception as e:
            print(f"Failed to start resolving: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()
    print("Done")

if __name__ == "__main__":
    verify_diff_viewer()
