import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = await context.new_page()

        base_url = "http://localhost:5173"
        print(f"Navigating to {base_url}/en/restro")
        await page.goto(f"{base_url}/en/restro")

        # 1. Fill Input
        await page.fill('input[placeholder="https://api.example.com/v1/resource"]', f"{base_url}/en/restro")

        # 2. Add some headers
        # Switch to headers tab.
        # There are two buttons named "Headers". One in the tab list, one in Response pane.
        # We need the one in RequestTabs. It is the second one in DOM usually? Or first?
        # RequestTabs is in first column. ResponsePanel is in second.
        # Let's use a better selector.

        # Click the one inside the request pane (first one)
        # We can target by location or unique parent class.
        # The RequestTabs is in a flex-1 container.

        # Let's try "Headers" text with nth=0
        await page.locator('button:has-text("Headers")').nth(0).click()

        await page.wait_for_timeout(500)

        # Now click "Add Header". If it's not visible, maybe tab didn't switch.
        # Check if Add Header exists.
        if await page.locator('button:has-text("Add Header")').count() > 0:
             await page.click('button:has-text("Add Header")')
             await page.fill('input[placeholder="Key"]', 'X-Test-Header')
             await page.fill('input[placeholder="Value"]', 'Restro-V1')
        else:
             print("Add Header button not found")

        # 3. Send Request
        await page.click('button:has-text("Send")')

        # 4. Wait for response
        try:
            await page.wait_for_selector('.font-bold.border', timeout=10000)
            status = await page.text_content('.font-bold.border')
            print(f"Status: {status}")
        except:
            print("Status not found")

        # Take screenshot of the full UI
        await page.screenshot(path="verification/restro_ui.png")
        print("Screenshot saved to verification/restro_ui.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
