from playwright.sync_api import sync_playwright

def verify_json_architect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating...")
            page.goto("http://localhost:5173/en/tools/json-architect")

            print("Waiting for h1...")
            page.wait_for_selector("h1")

            print("Filling input...")
            input_area = page.locator("textarea")
            input_area.fill('{"foo":"bar", "num": 123}')

            print("Clicking Format...")
            page.get_by_role("button", name="Format").click()
            page.wait_for_timeout(500) # Wait a bit for UI update

            print("Taking intermediate screenshot...")
            page.screenshot(path="verification/step1_format.png")

            print("Clicking TS...")
            # Using get_by_text might be safer if role is ambiguous, but role button name TS should work.
            page.get_by_role("button", name="TS").click()
            page.wait_for_timeout(500)

            print("Checking for output...")
            # Check if output area has content.
            # The Viewer is: <code class="language-typescript">...</code>
            # If the mode changed, the class should change.

            # Let's just wait for the class
            page.wait_for_selector(".language-typescript", timeout=5000)

            print("Success! Taking final screenshot.")
            page.screenshot(path="verification/json_architect.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png", full_page=True)
            with open("verification/error.html", "w") as f:
                f.write(page.content())
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_json_architect()
