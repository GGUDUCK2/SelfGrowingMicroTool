from playwright.sync_api import sync_playwright

def verify_pomodoro(page):
    # Go to English home page
    page.goto("http://localhost:3000/en")

    # Check if the title is correct
    assert "Micro-Tools Factory" in page.title()

    # Screenshot Home
    page.screenshot(path="verification/home_page.png")

    # Click on the Pomodoro Timer tool
    page.click("text=Pomodoro Focus Timer")

    # Wait for the timer page to load
    page.wait_for_selector("text=Pomodoro Timer")

    # Check if timer default is 25:00
    assert "25:00" in page.content()

    # Screenshot Timer Page
    page.screenshot(path="verification/timer_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_pomodoro(page)
        finally:
            browser.close()
