
import pytest
from playwright.sync_api import Page, expect

def test_markflow_navigation_and_features(page: Page):
    # Navigate to the tool (English)
    # Ensure port 5173 is used as in dev mode
    page.goto("http://localhost:5173/en/markdown-studio")

    # Check Title
    expect(page.get_by_role("heading", name="MarkFlow")).to_be_visible()

    # Check Editor exists
    editor = page.get_by_placeholder("Start typing your markdown here...")
    expect(editor).to_be_visible()

    # Type some markdown
    editor.fill("# Hello MarkFlow\n\nThis is a **test**.")

    # Check Preview - look for rendered h1 in the preview pane
    # Since we have two H1s (Header and Preview), we look for the one in preview
    # The preview content is inside a .prose container
    preview = page.locator(".prose")
    expect(preview.get_by_role("heading", name="Hello MarkFlow")).to_be_visible()

    # Check Stats
    # Words might be updated asynchronously
    page.wait_for_timeout(500)
    # Check if "Words" text appears (stats bar)
    expect(page.get_by_text("Words")).to_be_visible()

    # Check Toolbar Actions
    # Click "Bold"
    page.get_by_role("button", name="Bold").click()

    # The editor should now contain "**text**" appended or inserted
    # Current content: "# Hello MarkFlow\n\nThis is a **test**." + "**text**" (at end or cursor)
    expect(editor).to_contain_text("**text**")

    # Save to history
    page.get_by_role("button", name="Save Result").click()
    # Check notification
    expect(page.get_by_text("Saved to history!")).to_be_visible()

    # Test Language Switch (Korean)
    page.goto("http://localhost:5173/ko/markdown-studio")
    expect(page.get_by_role("heading", name="MarkFlow")).to_be_visible()
    # Check a localized string in the stats bar or toolbar
    expect(page.get_by_text("실시간 미리보기")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/markflow_verified.png")
