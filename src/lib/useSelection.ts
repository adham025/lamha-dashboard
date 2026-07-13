import { useState } from 'react'

/** Row-selection state for tables with bulk actions. */
export function useSelection<T extends string | number>() {
  const [selected, setSelected] = useState<Set<T>>(new Set())

  const toggle = (id: T) =>
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const toggleAll = (ids: T[]) =>
    setSelected((s) => (s.size === ids.length ? new Set() : new Set(ids)))

  const clear = () => setSelected(new Set())

  return { selected, toggle, toggleAll, clear, count: selected.size }
}
