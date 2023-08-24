import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { DefaultObj } from '@components/search/sort'

export function useDynamicSearchParam<T extends DefaultObj>(defaultValue: T) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentSearchParams = new URLSearchParams([...(searchParams?.entries() ?? [])])

  const setParam = (param: string & keyof T, value: string) => {
    if (value !== defaultValue[param]) {
      currentSearchParams.set(param, value)
    } else {
      removeParam(param)
    }
  }

  const removeParam = (param: string) => {
    currentSearchParams.delete(param)
  }

  const update = () => {
    router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false })
  }

  return { setParam, update }
}

export function useAllSearchParams<T extends Record<string, string>>(defaultParams: T): T {
  const searchParams = useSearchParams()

  const result: Record<string, string> = {}
  for (const key in defaultParams) {
    const searchParam = searchParams?.get(key) ?? null

    if (searchParam !== null) {
      result[key] = searchParam
    } else {
      result[key] = defaultParams[key]
    }
  }

  return result as T
}

export function useSearchParam<T extends Record<string, string>>(defaultParams: T, label: string) {
  const params = useAllSearchParams(defaultParams)

  return {
    currentValue: params[label],
    defaultValue: defaultParams[label]
  }
}
