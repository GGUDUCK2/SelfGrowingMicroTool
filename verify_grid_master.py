from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to Grid Master
        print("Navigating to Grid Master...")
        page.goto("http://localhost:3000/en/tools/grid-master")
        page.wait_for_load_state("networkidle")

        # 2. Click Templates Tab
        print("Clicking Templates Tab...")
        page.get_by_role("tab", name="Templates").click()
        page.wait_for_timeout(500)

        # 3. Click Remix Layout
        print("Clicking Remix Layout...")
        # Assuming I added aria-label "Remix Layout"
        remix_btn = page.get_by_role("button", name="Remix Layout")
        if not remix_btn.is_visible():
             # Fallback to text if aria-label issues (though I added it)
             remix_btn = page.get_by_text("Remix")

        remix_btn.click()
        page.wait_for_timeout(500)

        # 4. Click Build Tab to see Areas and Change Tag
        print("Clicking Build Tab...")
        page.get_by_role("tab", name="Build").click()
        page.wait_for_timeout(500)

        # 5. Add an Area (or use existing)
        # There should be areas from the remix. Let's pick the first one in the list.
        # The sidebar list has inputs for name and select for tag.

        print("Changing Tag...")
        # Find the first Select for tags.
        # Use a locator that finds the select inside the areas list
        tag_select = page.locator("#areas-list select").first
        tag_select.select_option("header")
        page.wait_for_timeout(500)

        # 6. Take Screenshot of Canvas
        print("Taking Screenshot...")
        # Focus on the canvas area
        canvas = page.get_by_role("grid")
        page.screenshot(path="verification_grid_master.png")

        browser.close()

if __name__ == "__main__":
    run()
