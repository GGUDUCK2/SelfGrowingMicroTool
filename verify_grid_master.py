from playwright.sync_api import sync_playwright

def verify_grid_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        print("Navigating...")
        try:
            page.goto("http://localhost:4173/en/tools/grid-master", timeout=30000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Navigation error: {e}")

        print("Page Text Sample:", page.inner_text("body")[:500])

        # 1. Check if Sidebar exists
        print("Checking Sidebar...")
        try:
            # Check for Build tab
            build_tab = page.get_by_role("button", name="Build")
            if build_tab.count() > 0:
                 print("PASS: Build tab found.")
            else:
                 print("FAIL: Build tab not found.")
                 # Check what tabs ARE there
                 print("Buttons found:", page.locator("button").all_inner_texts())
        except Exception as e:
            print(f"FAIL: Sidebar check: {e}")

        page.screenshot(path="grid_master_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_grid_master()
