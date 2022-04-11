import type { ReactElement } from 'react'
import type { RequireExactlyOne } from 'type-fest'

export const STRATEGY_OPTIONS = ['body', 'query'] as const
export type StrategyOption = typeof STRATEGY_OPTIONS[number]

export const IMAGE_TYPE = ['png', 'jpeg', 'webp'] as const
export type ImageType = typeof IMAGE_TYPE[number]

export type StrategyAwareParams<T extends StrategyOption = 'query', StrategyDetails extends string | object = string> = T extends 'body'
  ? StrategyDetails
  : Record<StrategyDetails extends string ? StrategyDetails : string, NonNullable<string>>

export type NextApiOgImageConfig<Strategy extends StrategyOption, StrategyDetails extends string | object = string> = {
  template: RequireExactlyOne<
    Partial<{
      html: (params: StrategyAwareParams<Strategy, StrategyDetails>) => string | Promise<string>
      react: (params: StrategyAwareParams<Strategy, StrategyDetails>) => ReactElement | Promise<ReactElement>
    }>,
    'html' | 'react'
  >
  strategy?: StrategyOption
  cacheControl?: string
  width?: number
  height?: number
  type?: ImageType
  quality?: number
  dev?: Partial<{
    inspectHtml: boolean
    errorsInResponse: boolean
  }>
}
