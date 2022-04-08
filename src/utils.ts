import chromium from 'chrome-aws-lambda'
import type { Viewport } from 'puppeteer-core'

export const stringifyObjectProps = (object: object) =>
  JSON.parse(JSON.stringify(object, (key, value) => (value && typeof value === 'object' ? value : `${value}`)))

export const getBrowserPage = async (viewPort?: Viewport) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()
  if (viewPort) {
    await page.setViewport(viewPort)
  }

  return { page, browser }
}
