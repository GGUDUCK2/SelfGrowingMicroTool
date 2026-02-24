from playwright.sync_api import sync_playwright

def verify_logic_forge():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to Logic Forge
        print("Navigating to Logic Forge...")
        page.goto("http://localhost:5173/en/tools/logic-forge")

        # Wait for content to load
        page.wait_for_selector("main")

        # Verify Expression Input attributes
        input_locator = page.get_by_label("Boolean Expression")
        autocorrect = input_locator.get_attribute("autocorrect")
        autocapitalize = input_locator.get_attribute("autocapitalize")

        print(f"Input autocorrect: {autocorrect}")
        print(f"Input autocapitalize: {autocapitalize}")

        if autocorrect == "off" and autocapitalize == "off":
            print("SUCCESS: Input attributes correct.")
        else:
            print("ERROR: Input attributes missing or incorrect.")

        # Verify JSON-LD
        json_lds = page.locator('script[type="application/ld+json"]').all_text_contents()
        found_software_app = False
        for json_content in json_lds:
            if "SoftwareApplication" in json_content:
                if "DeveloperApplication" in json_content and "EducationalApplication" in json_content:
                     print("SUCCESS: JSON-LD applicationCategory updated.")
                     found_software_app = True
                else:
                     print(f"ERROR: JSON-LD applicationCategory mismatch in: {json_content[:100]}...")

                if "browserRequirements" in json_content:
                     print("SUCCESS: JSON-LD browserRequirements present.")
                else:
                     print("ERROR: JSON-LD browserRequirements missing.")

        if not found_software_app:
            print("ERROR: SoftwareApplication JSON-LD not found.")

        # Screenshot of the Quick Operators
        print("Taking screenshot...")
        # Scroll to the quick operators
        # The buttons have aria-label="Insert AND" etc.
        page.get_by_label("Insert AND").scroll_into_view_if_needed()
        page.screenshot(path="verification_logic_forge.png")
        print("Screenshot saved to verification_logic_forge.png")

        browser.close()

if __name__ == "__main__":
    verify_logic_forge()
