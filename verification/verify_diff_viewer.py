from playwright.sync_api import sync_playwright

def verify_diff_viewer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173/en/tools/diff-viewer")
        page.wait_for_selector("h1", timeout=10000)

        # Open Modal
        page.locator("button[title='Merge Conflict Parser']").click()
        page.wait_for_timeout(1000)

        # Robust Locator
        # Find the h3 with text "Merge Conflict Parser"
        heading = page.get_by_role("heading", name="Merge Conflict Parser")

        # The textarea is a sibling or child of the parent container
        # Let's just look for a textarea that is visible
        textarea = page.locator("textarea").filter(has_text="").last
        # Or better:
        textarea = page.locator(".fixed textarea")

        if textarea.count() > 0:
            print("Found textarea!")
            conflict_text = """<<<<<<< HEAD
This is my change.
=======
This is their change.
>>>>>>> feature-branch"""
            textarea.fill(conflict_text)

            # Handle Alert
            page.on("dialog", lambda d: d.accept())

            page.get_by_text("Parse Conflict").click()
            page.wait_for_timeout(1000)

            page.screenshot(path="verification/diff_result.png")
            print("Screenshot saved to verification/diff_result.png")
        else:
            print("Textarea still not found. Dumping HTML of modal:")
            # print(page.locator(".fixed").inner_html())
            page.screenshot(path="verification/failed_locator.png")

        browser.close()

if __name__ == "__main__":
    verify_diff_viewer()
