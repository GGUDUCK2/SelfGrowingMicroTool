from playwright.sync_api import sync_playwright, expect

def test_cipher_lab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Try ports 4173, 4174, 4175, 4176
        ports = [4173, 4174, 4175, 4176]
        page = browser.new_page()

        success = False
        for port in ports:
            try:
                print(f"Trying port {port}...")
                page.goto(f"http://localhost:{port}/en/tools/cipher-lab", timeout=3000)
                # If we get here without error (and without 404/500 if possible to detect early), break
                # But simple goto might succeed even on 500 page.
                # Check for specific content.
                try:
                   page.wait_for_selector("h1", timeout=2000)
                   success = True
                   print(f"Connected on port {port}")
                   break
                except:
                   print(f"Port {port} loaded but selector not found (maybe 500 error)")
                   continue
            except Exception as e:
                print(f"Port {port} failed: {e}")
                continue

        if not success:
            raise Exception("Could not connect to any preview port")

        try:
            # Verify title
            expect(page.get_by_role("heading", name="Cipher Lab: Crypto & Token Suite")).to_be_visible()

            # Verify Hash Generator tab is active
            expect(page.get_by_role("button", name="Hash & HMAC")).to_be_visible()

            # Type something into hash input
            page.fill("textarea#input", "Hello World")

            # Wait for calculation (it's debounced/reactive)
            page.wait_for_timeout(1000)

            output = page.input_value("textarea#output")
            print(f"Hash Output: {output}")

            if "a591a6d4" not in output:
                raise Exception("Hash calculation failed or mismatch")

            # Switch to Password tab
            page.click("button:has-text('Password Forge')")
            page.wait_for_timeout(500)

            # Verify Password UI - use precise selector
            expect(page.get_by_text("Entropy", exact=True)).to_be_visible()

            # Take screenshot
            page.screenshot(path="verification/cipher_lab.png", full_page=True)
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_cipher_lab()
