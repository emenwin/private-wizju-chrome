import { describe, it, expect, beforeEach, vi } from 'vitest'
import { xtreamApiService } from '@/services/xtream/xtreamApiService'
import type { XtreamVodInfoResponse } from '@/services/xtream/xtreamApiService'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('xtreamApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchVodInfo', () => {
    it('should fetch VOD info successfully', async () => {
      const mockResponse: XtreamVodInfoResponse = {
        info: {
          name: 'Test Movie',
          plot: 'A test movie plot',
          director: 'Test Director',
          cast: 'Test Actor',
          rating: 8.5,
          genre: 'Action',
          release_date: '2023-01-01',
          duration: '120 min',
        },
        movie_data: {
          stream_id: 123,
          name: 'Test Movie',
          category_id: '1',
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await xtreamApiService.fetchVodInfo(
        'https://example.com',
        'testuser',
        'testpass',
        123,
      )

      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/player_api.php?username=testuser&password=testpass&action=get_vod_info&vod_id=123',
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on API failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        xtreamApiService.fetchVodInfo('https://example.com', 'testuser', 'testpass', 123),
      ).rejects.toThrow('Xtream API request failed: 404 Not Found')
    })

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        xtreamApiService.fetchVodInfo('https://example.com', 'testuser', 'testpass', 123),
      ).rejects.toThrow('Network error')
    })
  })
})
