import { renderToStaticMarkup } from 'react-dom/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import deepMerge from 'deepmerge'
import validateStrategy from './validateStrategy'
import { stringifyObjectProps, getBrowserPage } from './utils'

import type { StrategyOption, NextApiOgImageConfig, StrategyAwareParams } from './types'

const envMode = process.env.NODE_ENV
const isProductionLikeMode = envMode !== 'development'

// Default values
const defaultOptions = {
  strategy: 'query',
  cacheControl: 'max-age 3600, must-revalidate',
  width: 1200,
  height: 630,
  type: 'png',
  quality: 90,
  dev: {
    inspectHtml: true,
    errorsInResponse: true,
  },
}

function withOGImage<Strategy extends StrategyOption = 'query', StrategyDetails extends string | object = string>(
  options: NextApiOgImageConfig<Strategy, StrategyDetails>,
) {
  const {
    template: { html: htmlTemplate, react: reactTemplate },
    cacheControl,
    strategy,
    type,
    width,
    height,
    quality,
    dev: { inspectHtml, errorsInResponse },
  } = deepMerge(defaultOptions, options) as NextApiOgImageConfig<Strategy, StrategyDetails>

  if (htmlTemplate && reactTemplate) {
    throw new Error('Ambigious template provided. You must provide either `html` or `react` template.')
  }

  if (!htmlTemplate && !reactTemplate) {
    throw new Error('No template was provided.')
  }

  return async function (request: NextApiRequest, response: NextApiResponse) {
    // Throw error if strategy or params type are invalid
    validateStrategy(strategy, isProductionLikeMode ? false : errorsInResponse, request, response)

    // Transform string values to object
    const params = stringifyObjectProps(strategy === 'query' ? request.query : request.body)

    // Get page content
    const html = htmlTemplate
      ? await htmlTemplate(params as StrategyAwareParams<Strategy, StrategyDetails>)
      : renderToStaticMarkup(await reactTemplate(params as StrategyAwareParams<Strategy, StrategyDetails>))

    // Lauch puppeteer and get a screenshot
    if (isProductionLikeMode || !inspectHtml) {
      const { page, browser } = await getBrowserPage({ width, height })
      response.setHeader('Content-Type', type ? `image/${type}` : 'image/png')
      response.setHeader('Cache-Control', cacheControl)
      await page.setContent(html)
      const screenshot = await page.screenshot({
        type,
        encoding: 'binary',
        ...(type === 'jpeg' ? { quality } : null),
      })
      response.write(screenshot)
      await browser.close()
    }
    // Send plain html
    else {
      response.setHeader('Content-Type', 'text/html')
      response.write(html)
    }

    response.end()
  }
}

export default withOGImage
