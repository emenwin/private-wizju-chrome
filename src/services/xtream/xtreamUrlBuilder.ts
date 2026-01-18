import type { StreamSource } from '@/types/stream'
import type { XtreamLiveStream, XtreamVodStream } from '@/types/xtream'
import { xtreamApiService } from './xtreamApiService'

const sanitizeBaseUrl = (url: string): string => {
  return xtreamApiService.normalizeBaseUrl(url)
}

export const buildXtreamLiveUrl = (source: StreamSource, stream: XtreamLiveStream): string => {
  if (!source.username || !source.password) {
    throw new Error('Xtream source missing username or password')
  }
  const baseUrl = sanitizeBaseUrl(source.url)
  return `${baseUrl}/live/${source.username}/${source.password}/${stream.streamId}.m3u8`
}

export const buildXtreamVodUrl = (source: StreamSource, stream: XtreamVodStream): string => {
  if (!source.username || !source.password) {
    throw new Error('Xtream source missing username or password')
  }
  const baseUrl = sanitizeBaseUrl(source.url)
  const extension = stream.containerExtension || 'mp4'
  return `${baseUrl}/movie/${source.username}/${source.password}/${stream.streamId}.${extension}`
}
