from playwright.sync_api import sync_playwright, expect
import os
import time

def verify_feature(page):
    # Navigate to the Git Forge tool
    print("Navigating to Git Forge...")
    page.goto("http://localhost:4173/en/tools/git-forge")
    page.wait_for_timeout(1000)

    # Tab 1: Command Builder -> Test Alias Exporter
    print("Testing Alias Exporter in Command Builder...")
    # Change operation to "commit" for example
    page.get_by_role("button", name="Commit", exact=True).click()
    page.wait_for_timeout(500)

    # Fill in a commit message
    page.get_by_placeholder("feat: add feature").fill("test alias feature")
    page.wait_for_timeout(500)

    # The generated command should be 'git commit -m "test alias feature"'
    # We should see the alias command 'git config --global alias.myalias "commit -m \"test alias feature\""'
    alias_code = page.locator("code").filter(has_text="git config --global alias.myalias")
    expect(alias_code).to_be_visible()

    # Click to copy alias
    page.get_by_role("button", name="Create Alias").click()
    page.wait_for_timeout(500)

    page.screenshot(path="/app/verification/git_forge_alias.png")
    page.wait_for_timeout(1000)

    # Tab 3: Commit Builder -> Test Share Deep Linking
    print("Testing Share functionality in Commit Builder...")
    # Switch tab using keyboard shortcut (Ctrl+3 / Cmd+3)
    page.keyboard.press("Control+3")
    page.wait_for_timeout(1000)

    # Fill in commit form
    page.get_by_placeholder("add login functionality").fill("test share feature")
    page.wait_for_timeout(500)

    # Click share button
    page.get_by_title("Share").click()
    page.wait_for_timeout(500)

    page.screenshot(path="/app/verification/git_forge_share.png")
    page.wait_for_timeout(1000)

    print("Verification complete.")

if __name__ == "__main__":
    # Ensure verification directories exist
    os.makedirs("/app/verification", exist_ok=True)
    os.makedirs("/app/verification/video", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/app/verification/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
