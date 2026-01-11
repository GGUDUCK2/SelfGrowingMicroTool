import asyncio
from playwright.async_api import async_playwright
import time
import socket

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        base_url = "http://localhost:5173"

        try:
            print(f"Navigating to {base_url}/en/restro")
            await page.goto(f"{base_url}/en/restro")

            # Wait for any potential hydration
            await page.wait_for_timeout(2000)

            # 1. Test Input
            print("Testing Inputs...")
            # We must use 'fill' on the input with correct placeholder
            await page.fill('input[placeholder="https://api.example.com/v1/resource"]', f"{base_url}/en/restro")

            # 2. Test Send
            print("Sending Request...")
            await page.click('button:has-text("Send")')

            # Wait for response
            print("Waiting for response...")
            # If fetch works, we see status.
            # If not, we might see console error.

            # Check if button is loading
            # await page.wait_for_selector('svg.animate-spin', state='visible', timeout=1000)

            # Wait longer
            await page.wait_for_timeout(3000)

            # Check if status exists
            if await page.is_visible('.font-bold.border'):
                 status = await page.text_content('.font-bold.border')
                 print(f"Status visible: {status}")
            else:
                 print("Status NOT visible. Checking for errors in DOM.")
                 # Dump some DOM
                 # print(await page.content())

            # 3. Test Code Gen (independent of response)
            print("Testing Code Gen...")
            await page.click('button:has-text("Code")')
            await page.wait_for_selector('text=curl', timeout=5000)
            print("Code Gen Works")

            print("Test sequence finished (Success if no error thrown)")

        except Exception as e:
            print(f"Test failed: {e}")
            raise e
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
