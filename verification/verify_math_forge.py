from playwright.sync_api import sync_playwright, expect

def verify_seo_and_semantics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("Navigating to Math Forge...")
        page.goto("http://localhost:5173/en/tools/math-forge")
        page.wait_for_load_state("networkidle")

        print("Checking Canonical Link...")
        canonical = page.locator('link[rel="canonical"]')
        expect(canonical).to_have_attribute("href", "https://microfactory.app/en/tools/math-forge")
        print("Canonical Link Verified.")

        print("Checking OpenGraph Tags...")
        og_title = page.locator('meta[property="og:title"]')
        expect(og_title).to_have_attribute("content", "Math Forge: Scientific Workbench")

        og_url = page.locator('meta[property="og:url"]')
        expect(og_url).to_have_attribute("content", "https://microfactory.app/en/tools/math-forge")
        print("OpenGraph Tags Verified.")

        print("Checking JSON-LD...")
        # Get all JSON-LD scripts
        json_ld_scripts = page.locator('script[type="application/ld+json"]').all()
        found_software_app = False

        for script in json_ld_scripts:
            content = script.text_content()
            if "SoftwareApplication" in content:
                print("Found SoftwareApplication Schema.")
                if "Calculator Application" in content:
                    print("Found 'Calculator Application' subcategory.")
                else:
                    print("MISSING 'Calculator Application' subcategory.")

                if "Graphing Calculator" in content: # One of the features
                    print("Found 'Graphing Calculator' feature.")
                else:
                    print("MISSING features.")

                found_software_app = True
                break

        if not found_software_app:
            print("ERROR: SoftwareApplication JSON-LD not found!")
            exit(1)

        print("Checking Semantics...")
        # Check for <aside>
        aside = page.locator('aside')
        expect(aside.first).to_be_visible() # Desktop sidebar
        print("Aside Verified.")

        # Check for tablist
        tablist = page.locator('div[role="tablist"]')
        expect(tablist).to_be_visible()
        print("Tablist Verified.")

        # Check tabs
        tabs = tablist.locator('button[role="tab"]')
        expect(tabs).to_have_count(4)
        print("Tabs Verified.")

        # Check active tab aria-selected
        active_tab = tabs.first
        expect(active_tab).to_have_attribute("aria-selected", "true")
        print("Active Tab Verified.")

        print("Taking Screenshot...")
        page.screenshot(path="verification/math_forge_verified.png", full_page=True)
        print("Screenshot saved to verification/math_forge_verified.png")

        browser.close()

if __name__ == "__main__":
    verify_seo_and_semantics()
