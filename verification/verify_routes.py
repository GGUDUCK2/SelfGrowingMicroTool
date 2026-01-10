
from playwright.sync_api import sync_playwright, expect

def check_routes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Handle potential port conflicts by trying a few
        context = browser.new_context()
        page = context.new_page()

        # The instruction says "Use npm run dev > server.log 2>&1 &".
        # Vite usually runs on 5173.
        base_url = "http://localhost:5173"

        print(f"Checking {base_url}/en/tools/color-master...")
        response = page.goto(f"{base_url}/en/tools/color-master")
        print(f"Status: {response.status}")

        # Wait for hydration to ensure it's not a client-side 404 handled by Svelte
        # If it was a 404, SvelteKit usually renders a 404 page, but the status might still be 200 if handled purely client-side?
        # Actually SvelteKit returns 404 status for unknown routes.

        if response.status != 200:
            print("Failed to load color-master")
            # Take screenshot of error
            page.screenshot(path="verification/error_color_master.png")
            exit(1)

        # Check for some content to be sure
        expect(page.get_by_role("heading", name="Lumina", exact=True)).to_be_visible()
        page.screenshot(path="verification/color_master_fixed.png")
        print("Color Master loaded successfully.")

        print(f"Checking {base_url}/en/tools/structura...")
        response = page.goto(f"{base_url}/en/tools/structura")
        print(f"Status: {response.status}")

        if response.status != 200:
             print("Failed to load structura")
             exit(1)

        expect(page.get_by_role("heading", name="Structura", exact=True)).to_be_visible()
        page.screenshot(path="verification/structura_fixed.png")
        print("Structura loaded successfully.")

        browser.close()

if __name__ == "__main__":
    check_routes()
