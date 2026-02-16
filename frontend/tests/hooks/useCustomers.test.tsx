import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { customersApi } from '../../src/api/customers'
import { useCustomers } from '../../src/hooks/useCustomers'
import { createQueryClientWrapper } from '../test-utils'

describe('useCustomers', () => {
  const wrapper = createQueryClientWrapper().Wrapper

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the customers list', async () => {
    const mockCustomers = [
      {
        id: '1',
        name: 'Amanda',
        email: 'amanda@example.com',
        phone: '123',
        address: 'Rua A',
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: null,
      },
      {
        id: '2',
        name: 'Bruno',
        email: 'bruno@example.com',
        phone: '456',
        address: 'Rua B',
        createdAt: '2024-02-02T00:00:00.000Z',
        updatedAt: null,
      },
    ]

    vi.spyOn(customersApi, 'list').mockResolvedValueOnce(mockCustomers)

    const { result } = renderHook(() => useCustomers(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCustomers)
    expect(customersApi.list).toHaveBeenCalledTimes(1)
  })

  it('exposes error state when request fails', async () => {
    const error = new Error('Network error')
    vi.spyOn(customersApi, 'list').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCustomers(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})
