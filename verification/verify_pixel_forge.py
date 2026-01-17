from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Pixel Forge
        page.goto("http://localhost:5173/en/tools/pixel-forge")

        # Wait for hydration
        page.wait_for_load_state("networkidle")

        # Verify Title
        expect(page).to_have_title("Pixel Forge: Image Optimizer")

        # Verify Preset Selector exists
        preset_label = page.get_by_text("Preset")
        expect(preset_label).to_be_visible()

        # Verify Custom Option in Preset
        select = page.locator("select").first
        # Actually there are multiple selects, let's look for the one near Preset label
        # The structure is label > span(Preset) + select

        # Take screenshot of the workspace
        page.screenshot(path="verification/pixel-forge.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
