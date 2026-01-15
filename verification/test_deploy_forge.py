from playwright.sync_api import sync_playwright, expect

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        page.goto("http://localhost:4173/en/tools/deploy-forge")

        # Check title
        expect(page).to_have_title("Deploy Forge: Dockerfile Generator | Micro-Tools Factory")

        # Check if StackSelector is visible
        expect(page.locator("button").filter(has_text="Node.js")).to_be_visible()

        # Check generated Dockerfile content
        expect(page.locator("code.language-docker")).to_contain_text("FROM node:20-alpine")

        # Switch to Go
        page.get_by_text("Go", exact=True).click()
        expect(page.locator("code.language-docker")).to_contain_text("FROM golang:1.21-alpine AS builder")

        # Add an env var
        page.get_by_role("button", name="Add Variable").click()
        page.get_by_placeholder("KEY").fill("API_KEY")
        page.get_by_placeholder("VALUE").fill("12345")

        # Check Env Tab
        page.get_by_role("button", name=".env").click()
        expect(page.locator("code.language-bash")).to_contain_text("API_KEY=12345")

        # Take Screenshot
        page.screenshot(path="verification/deploy_forge.png", full_page=True)
        print("Screenshot saved to verification/deploy_forge.png")

        browser.close()

if __name__ == "__main__":
    run_test()
