from playwright.sync_api import sync_playwright, expect

def verify_seo_and_semantics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("Navigating to Math Forge...")
        page.goto("http://localhost:5173/en/tools/math-forge")
        page.wait_for_load_state("networkidle")

        print("Checking JSON-LD...")
        json_ld_scripts = page.locator('script[type="application/ld+json"]').all()
        found_software_app = False

        for script in json_ld_scripts:
            content = script.text_content()
            if "SoftwareApplication" in content:
                print(f"JSON-LD Content:\n{content}")
                if "Scientific Calculator" in content:
                    print("Found 'Scientific Calculator' feature.")
                else:
                    print("MISSING 'Scientific Calculator'.")
                found_software_app = True
                break

        if not found_software_app:
            print("ERROR: SoftwareApplication JSON-LD not found!")

if __name__ == "__main__":
    verify_seo_and_semantics()
