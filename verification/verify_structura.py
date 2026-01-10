import time
from playwright.sync_api import sync_playwright, expect

def verify_structura():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see everything
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        print("Navigating to Structura...")
        page.goto("http://localhost:5173/en/structura")

        # Wait for page to load
        page.wait_for_load_state("networkidle")

        print("Checking title...")
        expect(page).to_have_title("Structura: Universal Data Converter | Web Factory")

        print("Checking tabs...")
        convert_tab = page.get_by_role("button", name="Converter")
        codegen_tab = page.get_by_role("button", name="Code Gen")
        history_tab = page.get_by_role("button", name="History")

        expect(convert_tab).to_be_visible()
        expect(codegen_tab).to_be_visible()
        expect(history_tab).to_be_visible()

        # Test Conversion
        print("Testing conversion...")
        # Load example
        page.get_by_text("Load Example").click()
        # Select first example (JSON)
        page.get_by_text("User Profile (JSON)").click()

        # Wait for conversion
        time.sleep(1)

        # Check output - simple query for any textarea
        # Input is 0, Output is 1
        output_editor = page.locator("textarea").nth(1)
        output_value = output_editor.input_value()

        if "name: Sarah Connor" in output_value:
            print("Conversion successful: Found YAML output.")
        else:
            print(f"Conversion failed? Output: {output_value}")

        # Test Code Gen
        print("Testing Code Gen...")
        codegen_tab.click()
        time.sleep(0.5)

        # Input is still there (persisted state in variable), but in CodeGen tab, layout might be different.
        # Check +page.svelte layout for CodeGen tab:
        # Input on left (0), Code on right (1).

        codegen_editor = page.locator("textarea").nth(1)
        codegen_value = codegen_editor.input_value()

        if "export interface Root" in codegen_value:
             print("Code Gen successful: Found TypeScript interface.")
        else:
             print(f"Code Gen failed? Output: {codegen_value}")

        # Take screenshot of Code Gen tab
        page.screenshot(path="verification/structura_codegen.png")

        # Test History
        print("Testing History...")
        history_tab.click()
        time.sleep(0.5)

        # Should have at least one entry
        if page.locator(".group.relative").count() > 0:
            print("History successful: Found entries.")
        else:
            print("History failed? No entries found.")

        page.screenshot(path="verification/structura_history.png")

        browser.close()

if __name__ == "__main__":
    verify_structura()
