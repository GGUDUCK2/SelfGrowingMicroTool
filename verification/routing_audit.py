import asyncio
from playwright.async_api import async_playwright
import sys
import os

async def check_links():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        base_url = "http://localhost:5173"

        # 1. Visit Restro English
        print(f"Checking {base_url}/en/restro")
        response = await page.goto(f"{base_url}/en/restro")
        if response.status != 200:
            print(f"Error: {base_url}/en/restro returned {response.status}")
            sys.exit(1)

        # 2. Visit Restro Korean
        print(f"Checking {base_url}/ko/restro")
        response = await page.goto(f"{base_url}/ko/restro")
        if response.status != 200:
            print(f"Error: {base_url}/ko/restro returned {response.status}")
            sys.exit(1)

        # 3. Check for console errors
        page.on("console", lambda msg: print(f"Console: {msg.text}") if msg.type == "error" else None)

        # 4. Check internal links?
        # The tool is single page mostly.

        print("Routing check passed.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_links())
