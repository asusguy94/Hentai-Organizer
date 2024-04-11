import { MediaStorage, SerializedVideoQuality } from '@vidstack/react'

type SavedMediaData = {
  volume: number | null
  muted: boolean | null
  audioGain: number | null
  lang: string | null
  captions: boolean | null
  rate: number | null
  quality: SerializedVideoQuality | null
}

export class CustomStorage implements MediaStorage {
  private storageKey = 'vidstack'
  private bookmarkKey = 'bookmark'
  private videoKey = 'video'

  private _currentId: number | null = null
  private _videoId: number | null = null
  private _time: number | null = null
  private _canAddPlay = false

  updateVideoId(videoId: number) {
    this._currentId = videoId
  }

  private _data: SavedMediaData = {
    volume: null,
    muted: null,
    audioGain: null,
    lang: null,
    captions: null,
    rate: null,
    quality: null
  }

  async getVolume() {
    return Promise.resolve(this._data.volume)
  }

  async setVolume(volume: number) {
    this._data.volume = volume
    await this.save()
  }

  async getMuted() {
    return Promise.resolve(this._data.muted)
  }

  async setMuted(muted: boolean) {
    this._data.muted = muted
    await this.save()
  }

  async getTime() {
    return Promise.resolve(this._time)
  }

  async setTime(time: number) {
    this._time = time >= 0 ? time : null
    await this.saveTime()
  }

  async getLang() {
    return Promise.resolve(this._data.lang)
  }

  async setLang(lang: string | null) {
    this._data.lang = lang
    await this.save()
  }

  async getCaptions() {
    return Promise.resolve(this._data.captions)
  }

  async setCaptions(enabled: boolean) {
    this._data.captions = enabled
    await this.save()
  }

  async getPlaybackRate() {
    return Promise.resolve(this._data.rate)
  }

  async setPlaybackRate(rate: number | null) {
    this._data.rate = rate
    await this.save()
  }

  async getAudioGain() {
    return Promise.resolve(this._data.audioGain)
  }

  async setAudioGain(gain: number | null) {
    this._data.audioGain = gain
    await this.save()
  }

  async getVideoQuality() {
    return Promise.resolve(this._data.quality)
  }

  async setVideoQuality(quality: SerializedVideoQuality | null) {
    this._data.quality = quality
    await this.save()
  }

  onChange() {
    const savedData = localStorage.getItem(this.storageKey)
    const savedTime = Number(sessionStorage.getItem(this.bookmarkKey))
    const videoId = Number(sessionStorage.getItem(this.videoKey))

    this._data = {
      volume: null,
      muted: null,
      audioGain: null,
      lang: null,
      captions: null,
      rate: null,
      quality: null,
      ...(savedData ? (JSON.parse(savedData) as Record<string, unknown>) : {})
    }

    this._time = Number(savedTime)
    this._videoId = Number(videoId)
  }

  protected getVideoId() {
    return this._videoId
  }

  protected setVideoId(videoId: number | null) {
    this._videoId = videoId
    return this.saveVideoId()
  }

  onLoad() {
    if (this._currentId !== this.getVideoId()) {
      this._canAddPlay = true
      this.setVideoId(this._currentId)
      this.setTime(0)
    }
  }

  protected save() {
    const data = JSON.stringify(this._data)
    localStorage.setItem(this.storageKey, data)
    return Promise.resolve()
  }

  protected saveTime() {
    const data = Number(this._time).toString()
    sessionStorage.setItem(this.bookmarkKey, data)
    return Promise.resolve()
  }

  protected saveVideoId() {
    const data = Number(this._videoId).toString()
    sessionStorage.setItem(this.videoKey, data)
    return Promise.resolve()
  }

  protected removeVideoId() {
    sessionStorage.removeItem(this.videoKey)
  }

  public canAddPlay() {
    return this._canAddPlay
  }

  public resetCanAddPlay() {
    this._canAddPlay = false
  }
}
