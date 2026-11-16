// Paging through an album: the loaded items, whether more exist, and a way
// to fetch the rest (for "download all"). Items are de-duplicated by id
// because new uploads shift the offsets while someone is browsing.
import { useCallback, useRef, useState } from "react"
import type { AlbumItemView } from "@/server/album/album.server"

export type AlbumPage = {
  items: Array<AlbumItemView>
  nextOffset: number | null
}

function merge(
  current: ReadonlyArray<AlbumItemView>,
  incoming: ReadonlyArray<AlbumItemView>
): Array<AlbumItemView> {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...incoming.filter((item) => !seen.has(item.id))]
}

export function useAlbumItems(
  fetchPage: (offset: number) => Promise<AlbumPage>,
  initial?: AlbumPage
) {
  const [items, setItems] = useState<Array<AlbumItemView>>(initial?.items ?? [])
  const [nextOffset, setNextOffset] = useState<number | null>(
    initial ? initial.nextOffset : 0
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()
  // The same values for callbacks that outlive a render. Every change goes
  // through `apply` or `remove`, which keep this and the state in step.
  const state = useRef({ items, nextOffset })

  const apply = (page: AlbumPage, replace: boolean) => {
    const merged = replace ? page.items : merge(state.current.items, page.items)
    state.current = { items: merged, nextOffset: page.nextOffset }
    setItems(merged)
    setNextOffset(page.nextOffset)
    return merged
  }

  const load = useCallback(
    async (mode: "more" | "reload" = "more") => {
      const offset = mode === "reload" ? 0 : state.current.nextOffset
      if (offset === null) return state.current.items
      setLoading(true)
      setError(undefined)
      try {
        return apply(await fetchPage(offset), mode === "reload")
      } catch (cause) {
        setError(cause)
        throw cause
      } finally {
        setLoading(false)
      }
    },
    [fetchPage]
  )

  /** Every item, fetching the pages not loaded yet. */
  const loadAll = useCallback(async () => {
    while (state.current.nextOffset !== null) await load("more")
    return state.current.items
  }, [load])

  const remove = useCallback((ids: ReadonlyArray<string>) => {
    const gone = new Set(ids)
    const kept = state.current.items.filter((item) => !gone.has(item.id))
    state.current = { ...state.current, items: kept }
    setItems(kept)
  }, [])

  return {
    items,
    hasMore: nextOffset !== null,
    loading,
    error,
    load,
    loadAll,
    remove,
  }
}
