from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844}) # iPhone 12
        page.goto("http://localhost:3000/en/tools/deploy-forge")
        page.wait_for_timeout(2000) # Wait for hydration
        page.screenshot(path="/home/jules/verification/deploy_forge_mobile.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    run()
