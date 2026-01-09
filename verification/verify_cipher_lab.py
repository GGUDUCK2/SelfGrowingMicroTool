from playwright.sync_api import sync_playwright

def verify_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use port 4173 for preview, or 5173 for dev. Check which one is running.
        # Assuming dev server is running on 5173
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173/en/tools/cipher-lab")
            page.wait_for_timeout(2000) # Wait for hydration

            # Verify Secure Vault tab exists
            vault_tab = page.get_by_role("tab", name="Secure Vault")
            if vault_tab.is_visible():
                print("Secure Vault tab is visible")
                vault_tab.click()
                page.wait_for_timeout(500)
                page.screenshot(path="verification/cipher-lab-vault.png")
            else:
                print("Secure Vault tab not found!")
                page.screenshot(path="verification/cipher-lab-fail.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cipher_lab()
