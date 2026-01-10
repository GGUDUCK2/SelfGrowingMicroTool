
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_structura(page: Page):
    # 1. Navigate to Structura
    page.goto("http://localhost:5173/en/tools/structura")
    page.wait_for_timeout(2000)

    expect(page).to_have_title("Structura: Universal Data Converter | Web Factory")

    # 2. Test Conversion: JSON to YAML
    print("Testing Conversion...")
    # The textarea is inside the editor
    input_editor = page.locator('textarea').first
    input_editor.click()
    input_editor.fill('{"name": "test", "value": 123}')

    # Wait for debounce and conversion
    page.wait_for_timeout(1000)

    # Click Convert button to be sure (using exact match)
    page.get_by_role("button", name="Convert", exact=True).click()
    page.wait_for_timeout(500)

    # Check Output (simple check if error is not visible)
    expect(page.locator("text=Conversion Error")).not_to_be_visible()

    # Screenshot Convert Tab
    page.screenshot(path="/home/jules/verification/structura_convert.png")

    # 3. Test CodeGen
    print("Testing CodeGen...")
    page.get_by_role("button", name="Code Gen").click()
    page.wait_for_timeout(500)

    # Change language to Zod
    page.get_by_label("Target Language").select_option("zod")
    page.wait_for_timeout(1000) # Wait for generation

    # Screenshot CodeGen Tab
    page.screenshot(path="/home/jules/verification/structura_codegen.png")

    # 4. Test Visualizer
    print("Testing Visualizer...")
    # In my code I named the tab "Tree Visualizer" in English dictionary.
    # Let's check if the button text is correct or if it's being truncated/hidden.
    # I'll use a less strict locator for now.
    page.locator("button:has-text('Visualizer')").click()
    page.wait_for_timeout(500)

    # Wait for the tree to render
    page.wait_for_timeout(1000)

    # Check if tree node exists. We use .last() because "name" appears in the input editor too (which is visible on the left side of the visualizer tab)
    # The right side is the visualizer.
    expect(page.locator("text='\"name\"'").last).to_be_visible()

    # Screenshot Visualizer Tab
    page.screenshot(path="/home/jules/verification/structura_visualizer.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_structura(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
