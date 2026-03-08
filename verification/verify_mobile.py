from playwright.sync_api import sync_playwright
import time

def verify_diff_viewer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to mobile size to test touch targets
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            page.goto("http://localhost:4173/en/tools/diff-viewer")
            # Wait for page to load
            page.wait_for_selector('h1')
            time.sleep(1) # Extra wait for hydration
            page.screenshot(path="verification/diff_viewer_mobile.png", full_page=True)
            print("Diff Viewer screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

def verify_json_architect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to mobile size
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            page.goto("http://localhost:4173/en/tools/json-architect")
            page.wait_for_selector('h1')
            time.sleep(1)
            page.screenshot(path="verification/json_architect_mobile.png", full_page=True)
            print("JSON Architect screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

def verify_subnet_scope():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to mobile size
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            page.goto("http://localhost:4173/en/tools/subnet-scope")
            page.wait_for_selector('h1')
            time.sleep(1)
            page.screenshot(path="verification/subnet_scope_mobile.png", full_page=True)
            print("Subnet Scope screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

def verify_color_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to mobile size
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            page.goto("http://localhost:4173/en/tools/color-master")
            page.wait_for_selector('h1')
            time.sleep(1)
            page.screenshot(path="verification/color_master_mobile.png", full_page=True)
            print("Color Master screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_diff_viewer()
    verify_json_architect()
    verify_subnet_scope()
    verify_color_master()