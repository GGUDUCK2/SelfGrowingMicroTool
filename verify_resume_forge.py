from playwright.sync_api import sync_playwright

def verify(page):
    print("Navigating...")
    # 1. Arrange
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto("http://localhost:5173/en/tools/resume-forge")
    page.wait_for_load_state("networkidle")

    print("Toggling Mobile Preview...")
    # 2. Act: Toggle Mobile Preview
    # The button that shows the preview has a Smartphone icon initially.
    page.locator("header button:has(svg.lucide-smartphone)").click()

    # Wait for preview to appear.
    print("Waiting for preview...")
    page.wait_for_selector(".a4-page")

    # 3. Act: Toggle Fit Width
    print("Toggling Fit Width...")
    fit_btn = page.get_by_title("Fit Width")

    if fit_btn.is_visible():
        fit_btn.click()
        # Wait for transition
        page.wait_for_timeout(1000)
    else:
        print("Fit Width button not visible!")

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification_resume_forge.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()
