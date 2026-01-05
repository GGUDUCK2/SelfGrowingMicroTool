from playwright.sync_api import sync_playwright

def verify_color_master():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        page.goto("http://localhost:5173/en/color-master")

        # Wait for the title to be visible
        page.wait_for_selector("h1")

        # Check if the Image Extraction area is visible
        image_extractor = page.get_by_text("Extract from Image")
        if image_extractor.is_visible():
            print("Image Extractor is visible")

        # Check if Contrast Grid is visible
        contrast_grid = page.get_by_text("Contrast Matrix")
        if contrast_grid.is_visible():
            print("Contrast Matrix is visible")

        # Take a screenshot of the entire page
        page.screenshot(path="verification/color_master_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_color_master()
