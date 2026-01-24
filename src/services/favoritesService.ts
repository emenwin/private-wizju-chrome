import type { FavoriteItem } from '@/types/indexeddb'
import { StorageServiceV2 } from './indexedDb/storageServiceV2'
import { INDEX_NAMES, STORE_NAMES } from '@/constants/storage'

/**
 * Type for creating a favorite item
 */
type CreateFavoriteItem = Omit<FavoriteItem, 'id' | 'dateAdded'>

class FavoritesService {
  private readonly storageService: StorageServiceV2<FavoriteItem, CreateFavoriteItem>
  private readonly MAX_FAVORITES = 100

  constructor() {
    this.storageService = new StorageServiceV2(STORE_NAMES.FAVORITES)
  }

  /**
   * Retrieve all favorite items
   */
  async getFavorites(options?: { offset?: number; limit?: number }): Promise<FavoriteItem[]> {
    try {
      const offset = options?.offset ?? 0
      const limit = options?.limit ?? Number.POSITIVE_INFINITY
      return await this.storageService.getItemsByIndexPaginated(
        INDEX_NAMES.FAVORITES_BY_DATE_ADDED,
        undefined,
        offset,
        limit,
        'prev',
      )
    } catch (error) {
      console.error('Failed to load favorites:', error)
      return []
    }
  }

  /**
   * Check if a media item is already a favorite
   */
  async isFavorite(favorite: FavoriteItem): Promise<boolean> {
    const count = await this.storageService.countItemsByIndex(
      INDEX_NAMES.FAVORITES_BY_ITEM_AND_SOURCE,
      [favorite.itemId, favorite.sourceId],
    )
    return count > 0
  }

  /**
   * Add a media item to favorites
   */
  async addToFavorites(favorite: FavoriteItem): Promise<boolean> {
    try {
      // Check if the item is already a favorite
      if (await this.isFavorite(favorite)) {
        console.warn('Media item already in favorites:', favorite.title)
        return false
      }

      // Check if the maximum number of favorites is exceeded
      const count = await this.storageService.countItems()
      if (count >= this.MAX_FAVORITES) {
        const toRemove = count - this.MAX_FAVORITES + 1
        const oldestFavorites = await this.storageService.getItemsByIndexPaginated(
          INDEX_NAMES.FAVORITES_BY_DATE_ADDED,
          undefined,
          0,
          toRemove,
          'next',
        )
        if (oldestFavorites.length > 0) {
          await this.storageService.removeItems(oldestFavorites.map((item) => item.id))
        }
      }

      const favoriteData: CreateFavoriteItem = {
        itemId: favorite.itemId,
        sourceId: favorite.sourceId,
        type: favorite.type,
        title: favorite.title,
        description: favorite.description,
        thumbnail: favorite.thumbnail,
        category: favorite.category,
        duration: favorite.duration,
        tvgName: favorite.tvgName,
        groupTitle: favorite.groupTitle,
      }

      await this.storageService.addItem(favoriteData)

      console.log('Added to favorites:', favorite.title)
      return true
    } catch (error) {
      console.error('Failed to add to favorites:', error)
      return false
    }
  }

  /**
   * Remove a media item from favorites
   */
  async removeFromFavorites(favorite: FavoriteItem): Promise<boolean> {
    try {
      const matches = await this.storageService.loadItemsByIndex(
        INDEX_NAMES.FAVORITES_BY_ITEM_AND_SOURCE,
        [favorite.itemId, favorite.sourceId],
      )

      if (matches.length === 0) {
        console.warn('Media item not found in favorites')
        return false
      }

      await this.storageService.removeItems(matches.map((item) => item.id))
      console.log('Removed from favorites:', favorite.itemId)
      return true
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
      return false
    }
  }

  /**
   * Toggle the favorite status of a media item
   */
  async toggleFavorite(favorite: FavoriteItem): Promise<boolean> {
    if (await this.isFavorite(favorite)) {
      return await this.removeFromFavorites(favorite)
    } else {
      return await this.addToFavorites(favorite)
    }
  }

  /**
   * Get the count of favorite items
   */
  async getFavoritesCount(): Promise<number> {
    return await this.storageService.countItems()
  }

  /**
   * Get the maximum number of favorite items allowed
   */
  getMaxFavorites(): number {
    return this.MAX_FAVORITES
  }

  /**
   * Clear all favorite items
   */
  async clearFavorites(): Promise<void> {
    try {
      await this.storageService.clearAll()
      console.log('All favorites cleared')
    } catch (error) {
      console.error('Failed to clear favorites:', error)
    }
  }

  /**
   * Get favorites for a specific source
   */
  async getFavoritesBySource(sourceId: string): Promise<FavoriteItem[]> {
    try {
      const items = await this.storageService.loadItemsByIndex(
        INDEX_NAMES.FAVORITES_BY_SOURCE_ID,
        sourceId,
      )
      return items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    } catch (error) {
      console.error('Failed to get favorites by source:', error)
      return []
    }
  }

  /**
   * Remove all favorites for a specific source
   */
  async removeFavoritesBySource(sourceId: string): Promise<void> {
    try {
      const removedCount = await this.storageService.removeItemsByIndex(
        INDEX_NAMES.FAVORITES_BY_SOURCE_ID,
        sourceId,
      )
      console.log(`Removed ${removedCount} favorites for source ${sourceId}`)
    } catch (error) {
      console.error('Failed to remove favorites by source:', error)
    }
  }
}

export const favoritesService = new FavoritesService()
