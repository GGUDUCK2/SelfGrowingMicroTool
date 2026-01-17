import time
from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("1. Verifying MarkFlow (markdown-studio) loads without crash...")
        # Navigate to English MarkFlow
        # Wait for server to be ready
        try:
            page.goto("http://localhost:3000/en/tools/markdown-studio", timeout=10000)
            page.wait_for_load_state("networkidle")

            # Check for title
            title = page.locator("h1").first
            print(f"Page title found: {title.text_content()}")

            # Check if marked works (guide section uses it)
            guide_features = page.locator("ul.space-y-2").first
            if guide_features.is_visible():
                print("Guide section visible (Marked is working)")
            else:
                print("Guide section NOT visible")

            page.screenshot(path="verification/markflow_fixed.png")
            print("Screenshot saved: verification/markflow_fixed.png")

        except Exception as e:
            print(f"MarkFlow verification failed: {e}")

        print("\n2. Verifying Routing Redirect (No Lang)...")
        try:
            # Navigate to /tools/json-architect (no lang)
            response = page.goto("http://localhost:3000/tools/json-architect")
            final_url = page.url
            print(f"Requested: /tools/json-architect")
            print(f"Final URL: {final_url}")

            if "/ko/tools/json-architect" in final_url or "/en/tools/json-architect" in final_url:
                print("Redirect successful!")
            else:
                print("Redirect failed or unexpected URL.")

        except Exception as e:
            print(f"Routing verification failed: {e}")

        print("\n3. Verifying 404 Page (Bilingual)...")
        try:
            page.goto("http://localhost:3000/some-random-page-that-does-not-exist")
            page.wait_for_load_state("networkidle")

            # Check for bilingual text
            content = page.content()
            if "Page Not Found" in content and "페이지를 찾을 수 없습니다" in content:
                print("Bilingual 404 text found!")
            else:
                print("Bilingual text missing.")

            page.screenshot(path="verification/404_bilingual.png")
            print("Screenshot saved: verification/404_bilingual.png")

        except Exception as e:
            print(f"404 verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    # Give server a moment to start
    time.sleep(5)
    verify_fixes()
