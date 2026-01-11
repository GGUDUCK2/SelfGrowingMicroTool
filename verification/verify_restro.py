
import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", lambda msg: print(f"Console: {msg.text}"))

    print("Navigating to Restro...")
    try:
        page.goto("http://localhost:4174/en/restro", timeout=10000)
    except Exception as e:
        print(f"Navigation failed: {e}")

    # Wait for hydration
    page.wait_for_selector("h1", timeout=5000)

    # Route for https://example.com/api/*
    page.route("https://example.com/api/*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": 123, "name": "Test Item"}'
    ))

    print("Sending first request...")
    inp = page.get_by_label("URL")
    if not inp.is_visible():
        inp = page.get_by_placeholder("https://api.example.com/v1/resource")

    # Use HTTPS
    inp.fill("https://example.com/api/1")
    time.sleep(0.5)
    inp.press("Enter")

    # Wait for response
    try:
        page.wait_for_selector("text=Test Item", timeout=5000)
        print("First response received.")
    except:
        print("Response not found. Screenshotting...")
        page.screenshot(path="verification/response_fail.png")
        # print(page.content())
        browser.close()
        return

    print("Sending chained request...")
    inp.fill("")
    inp.fill("https://example.com/api/{{last_response.id}}")
    time.sleep(0.5)
    inp.press("Enter")

    def handle_request(route):
        print(f"Intercepted: {route.request.url}")
        if "123" in route.request.url:
            print("SUCCESS: Variable substituted correctly!")
        else:
            print("FAILURE: Variable NOT substituted.")
        route.fulfill(status=200, body='{"success": true}')

    page.unroute("https://example.com/api/*")
    page.route("https://example.com/api/*", handle_request)

    # Press Enter again
    # We might need to wait for previous loading to finish?
    # executeRequest sets loading=true, then false.
    time.sleep(1)
    inp.press("Enter")
    time.sleep(1)

    print("Testing Save Folder...")
    page.on("dialog", lambda dialog: dialog.accept("MyProject/GetItem"))

    page.click("button[aria-label='Save']")
    time.sleep(1)

    saved_btn = page.locator("button:has-text('Saved Requests')")
    if saved_btn.count() > 0:
        saved_btn.click()
    else:
        page.click("text=Saved Requests")

    print("Checking for folder...")
    expect(page.get_by_text("MyProject")).to_be_visible()

    page.get_by_text("MyProject").click()

    expect(page.get_by_text("GetItem")).to_be_visible()
    print("Folder and Item verified.")

    print("Taking screenshot...")
    page.screenshot(path="verification/restro_features.png")

    browser.close()

with sync_playwright() as p:
    run(p)
