from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Unit Verse
        try:
            page.goto('http://localhost:3000/en/tools/unit-verse', timeout=30000)
        except Exception as e:
            print(f'Error navigating: {e}')
            return

        # Check Title (relaxed check)
        # expect(page).to_have_title('Unit Verse', substring=True)

        # Check Input (Wait for selector)
        input_selector = '#input-value'
        try:
            page.wait_for_selector(input_selector, timeout=5000)
        except:
            print('Input selector not found')
            page.screenshot(path='verification/error.png')
            return

        # Check if input has inputmode='decimal'
        input_el = page.locator(input_selector)
        inputmode = input_el.get_attribute('inputmode')
        if inputmode != 'decimal':
            print(f'FAILED: inputmode is {inputmode}, expected decimal')
        else:
            print('SUCCESS: inputmode is decimal')

        # Check Guide Section visibility
        # The title might be 'Why Unit Verse?' based on dictionary
        guide_selector = 'h2'
        # Just take screenshot to verify visuals

        # Screenshot
        page.screenshot(path='verification/unit_verse.png', full_page=True)
        print('Screenshot saved to verification/unit_verse.png')

        browser.close()

if __name__ == '__main__':
    run()
