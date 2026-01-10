
import time
from playwright.sync_api import sync_playwright, expect

def verify_structura_features():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Navigate to Structura
            # Try port 5173 (Vite default)
            base_url = "http://localhost:5173"
            print(f"Navigating to {base_url}/en/structura")
            page.goto(f"{base_url}/en/structura")

            # Wait for hydration
            page.wait_for_selector("h1", state="visible")

            # 2. Verify Title - using exact=True to avoid strict mode violation
            expect(page.get_by_role("heading", name="Structura", exact=True)).to_be_visible()

            # 3. Test Auto Convert (New Feature)
            # Find the input area
            input_area = page.locator("textarea").first
            input_area.fill('{"foo":"bar"}')

            # Wait for debounce and auto convert
            time.sleep(2)

            # Check output area (should be YAML by default)
            output_area = page.locator("textarea").last
            output_value = output_area.input_value()
            print(f"Output value: {output_value}")
            if "foo: bar" in output_value:
                print("✅ Auto-convert working")
            else:
                print("❌ Auto-convert failed")

            # 4. Test Code Gen Tab (New Languages)
            # Switch to Code Gen tab
            page.get_by_role("button", name="Code Gen").click()
            time.sleep(0.5)

            # Check if Zod and Rust are in the dropdown
            select = page.locator("#codegen-lang")
            # Get text content of options
            options_text = select.evaluate("el => Array.from(el.options).map(o => o.text)")
            print(f"Code Gen Options: {options_text}")

            if "Zod Schema" in options_text and "Rust Struct" in options_text:
                print("✅ New languages present")
            else:
                 print("❌ New languages missing")

            # Select Zod
            select.select_option(value="zod")
            time.sleep(1)

            # Check generated code
            generated_code_area = page.locator("textarea").last # In codegen tab, the second editor is output
            generated_code = generated_code_area.input_value()
            if "z.object" in generated_code:
                print("✅ Zod generation working")
            else:
                print(f"❌ Zod generation failed. Got: {generated_code}")

            # 5. Screenshot
            page.screenshot(path="verification/structura_verification.png")
            print("📸 Screenshot saved")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_structura_features()
