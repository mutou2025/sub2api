import { useState, useEffect, useCallback } from "react"

interface UseTableLoaderOptions<T> {
    fetchFn: (page: number, pageSize: number, params?: any) => Promise<{ items: T[], total: number }>
    initialParams?: any
    pageSize?: number
}

export function useTableLoader<T>({ fetchFn, initialParams = {}, pageSize: initialPageSize = 10 }: UseTableLoaderOptions<T>) {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [params, setParams] = useState(initialParams)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetchFn(page, pageSize, params)
            setData(res.items)
            setTotal(res.total)
        } catch (err) {
            console.error("Failed to load table data", err)
        } finally {
            setLoading(false)
        }
    }, [fetchFn, page, pageSize, params])

    useEffect(() => {
        load()
    }, [load])

    return {
        data,
        loading,
        pagination: {
            page,
            pageSize,
            total
        },
        load,
        setParams, // This updates params and triggers reload due to dependency
        params
    }
}
