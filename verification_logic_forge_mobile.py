from playwright.sync_api import Page, expect, sync_playwright
import re

def verify_logic_forge_seo_and_mobile(page: Page):
    # 1. Arrange: Go to Logic Forge page
    page.goto("http://localhost:3000/en/tools/logic-forge")

    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    # 2. Verify SEO: Check Title and Meta
    expect(page).to_have_title(re.compile("Logic Forge"))

    # 3. Verify Mobile Layout: Check Circuit Visualizer scrolling
    # Set viewport to mobile size
    page.set_viewport_size({"width": 375, "height": 812})

    # Fill input
    input_field = page.get_by_label("Boolean Expression")
    input_field.fill("A & B | C & D | E & F")

    # Click Analyze button
    analyze_button = page.get_by_role("button", name="Analyze")
    analyze_button.click()

    # Switch to Circuit tab
    circuit_tab = page.get_by_role("button", name="Circuit View")
    circuit_tab.click()

    # Wait for the circuit visualizer to render
    # We look for the container with the specific class we added: touch-pan-x
    # This confirms both that it's rendered and that our changes are applied
    circuit_container = page.locator('.touch-pan-x')
    expect(circuit_container).to_be_visible()

    # Verify it has overflow-auto
    expect(circuit_container).to_have_class(re.compile(r"overflow-auto"))

    # Take a screenshot of the mobile view to confirm layout
    page.screenshot(path="verification_logic_forge_mobile.png")

    # 4. Verify Expression Input UI
    # Check if input container has overflow-x-auto class
    # The input is inside a div with class "relative bg-white rounded-xl shadow-xl flex items-center p-2 gap-2 overflow-x-auto"
    # We search for the container wrapping the input that has this class
    input_container = page.locator('input[aria-label="Boolean Expression"]').locator('xpath=..')
    expect(input_container).to_have_class(re.compile(r"overflow-x-auto"))
    expect(input_container).to_be_visible()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with mobile viewport
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()
        try:
            verify_logic_forge_seo_and_mobile(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_error_final.png")
        finally:
            browser.close()
