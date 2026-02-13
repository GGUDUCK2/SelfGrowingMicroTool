from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_pdf_forge(page: Page):
    # 1. Go to page
    page.goto("http://localhost:5173/en/tools/pdf-forge")

    # 2. Check title
    expect(page).to_have_title("PDF Forge: Pro PDF Editor - Micro-Tools Factory")

    # 3. Check for DropZone
    dropzone = page.locator("text=Drop PDF files here")
    expect(dropzone).to_be_visible()

    # 4. Check for History button (it might be hidden but present in DOM)
    # The title is "Session History" from dictionary
    history_btn = page.locator('button[title="Session History"]')
    # It is hidden initially, so check attached
    expect(history_btn).to_be_attached()

    # 5. Check for Save Session button
    save_btn = page.locator('button[title="Save Session"]')
    expect(save_btn).to_be_attached()

    # 6. Take screenshot
    page.screenshot(path="verification_pdf_forge.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_pdf_forge(page)
            print("Verification passed!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()
