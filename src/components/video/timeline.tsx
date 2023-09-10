import { Fragment, useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { Tooltip } from 'react-tooltip'
import { useWindowSize } from 'react-use'

import { defaultSettings, useSettings } from '../../app/settings/components'
import { IconWithText } from '../icon'
import Image from '../image'
import { ModalHandler } from '../modal'

import { serverConfig } from '@config'
import { EventHandler } from '@hooks/useStarEvent'
import { Attribute, Bookmark, Category, VideoStar, Video, SetState, Outfit } from '@interfaces'
import { bookmarkService } from '@service'

import styles from './timeline.module.scss'

const spacing = { top: 3, bookmark: 36 }

type TimelineProps = {
  video: Video
  bookmarks: Bookmark[]
  stars: VideoStar[]
  attributes: Attribute[]
  categories: Category[]
  outfits: Outfit[]
  playVideo: (time?: number | null) => void
  setTime: (bookmarkID: number, time?: number) => void
  playerRef: React.RefObject<HTMLVideoElement>
  update: SetState<Bookmark[]>
  onModal: ModalHandler
  setStarEvent: EventHandler
}
export default function Timeline({
  video,
  bookmarks,
  stars,
  attributes,
  categories,
  outfits,
  playVideo,
  setTime,
  playerRef,
  update,
  onModal,
  setStarEvent
}: TimelineProps) {
  const windowSize = useWindowSize()
  const bookmarksRef = useRef<HTMLButtonElement[]>([])
  const [bookmarkLevels, setBookmarkLevels] = useState<number[]>([])
  const [maxLevel, setMaxLevel] = useState(0)
  const localSettings = useSettings()

  const isActive = (bookmark: Bookmark) => bookmark.active
  const hasStar = (bookmark: Bookmark) => bookmark.starID > 0
  const attributesFromStar = (starID: number) => stars.filter(star => star.id === starID)[0]?.attributes ?? []
  const isStarAttribute = (starID: number, attributeID: number) => {
    return attributesFromStar(starID).some(attr => attr.id === attributeID)
  }

  const removeBookmark = (id: number) => {
    bookmarkService.removeBookmark(id).then(() => {
      update(bookmarks.filter(bookmark => bookmark.id !== id))
    })
  }

  const setCategory = (category: Category, bookmark: Bookmark) => {
    bookmarkService.setCategory(bookmark.id, category.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            return { ...item, name: category.name }
          }

          return item
        })
      )
    })
  }

  const setOutfit = (outfit: Outfit, bookmark: Bookmark) => {
    bookmarkService.setOutfit(bookmark.id, outfit.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            return { ...item, outfit: outfit.name }
          }

          return item
        })
      )
    })
  }

  const removeOutfit = (bookmark: Bookmark) => {
    bookmarkService.removeOutfit(bookmark.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            return { ...item, outfit: null }
          }

          return item
        })
      )
    })
  }

  const addAttribute = (attribute: Attribute, bookmark: Bookmark) => {
    bookmarkService.addAttribute(bookmark.id, attribute.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            return {
              ...item,
              attributes: [...item.attributes, { id: attribute.id, name: attribute.name }]
            }
          }

          return item
        })
      )
    })
  }

  const removeAttribute = (bookmark: Bookmark, attribute: Attribute) => {
    bookmarkService.removeAttribute(bookmark.id, attribute.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            return {
              ...item,
              attributes: item.attributes.filter(attr => attr.id !== attribute.id)
            }
          }

          return item
        })
      )
    })
  }

  const clearAttributes = (bookmark: Bookmark) => {
    bookmarkService.clearAttributes(bookmark.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            const starID = bookmark.starID

            if (starID !== 0) {
              const starAttribute = attributesFromStar(starID)

              return {
                ...item,
                attributes: item.attributes.filter(attribute => {
                  return starAttribute.some(attr => attr.name === attribute.name)
                })
              }
            } else {
              // Bookmark does not have a star
              return { ...item, attributes: [] }
            }
          }

          return item
        })
      )
    })
  }

  const removeStar = (bookmark: Bookmark) => {
    bookmarkService.removeStar(bookmark.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            const attributes = attributesFromStar(bookmark.starID)

            if (item.attributes.length > attributes.length) {
              // Bookmark have at least 1 attribute not from star
              return {
                ...item,
                starID: 0,
                attributes: item.attributes.filter(attribute => attributes.every(attr => attr.name !== attribute.name))
              }
            } else {
              // Bookmark has only attributes from star
              return { ...item, starID: 0, attributes: [] }
            }
          }

          return item
        })
      )
    })
  }

  useEffect(() => {
    const collisionCheck = (a: HTMLElement | null, b: HTMLElement | null) => {
      if (a === null || b === null) return false

      const bookmarkSpacing = localSettings?.bookmark_spacing ?? defaultSettings.bookmark_spacing

      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()

      return aRect.x + aRect.width >= bRect.x - bookmarkSpacing && aRect.x - bookmarkSpacing <= bRect.x + bRect.width
    }

    const bookmarksArr = bookmarks.length > 0 ? bookmarksRef.current : []
    const levels: number[] = new Array(bookmarks.length).fill(0)
    let maxLevel = 0

    for (let i = 0; i < bookmarksArr.length; i++) {
      let level = 1
      for (let j = 0; j < i; j++) {
        if (levels[j] === level && collisionCheck(bookmarksArr[j], bookmarksArr[i])) {
          level++
          j = -1
        }
      }

      levels[i] = level
      if (level > maxLevel) maxLevel = level
    }

    setBookmarkLevels(levels)
    setMaxLevel(maxLevel)
  }, [bookmarks, localSettings?.bookmark_spacing, windowSize.width])

  useEffect(() => {
    const setHeight = () => {
      const videoPlayer = playerRef.current
      if (videoPlayer) {
        const videoTop = videoPlayer.getBoundingClientRect().top
        videoPlayer.style.height = `calc(100vh - (${spacing.bookmark}px * ${maxLevel}) - ${videoTop}px - ${spacing.top}px)`
        //maxHeight: whitespace bellow, allows scrolling beneath video
        //height: no whitespace bellow, video always at bottom of screen
      }
    }

    setHeight() // always run once
    window.addEventListener('scroll', setHeight)

    return () => {
      window.removeEventListener('scroll', setHeight)
    }
  }, [maxLevel, playerRef])

  return (
    <div id={styles.timeline} style={bookmarks.length > 0 ? { marginTop: spacing.top } : {}}>
      {bookmarks.map((bookmark, idx) => {
        const tooltip = bookmark.starID > 0 || bookmark.attributes.length > 0 || bookmark.outfit !== null

        return (
          <Fragment key={bookmark.id}>
            <ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
              <Button
                size='small'
                variant={isActive(bookmark) ? 'contained' : 'outlined'}
                color={hasStar(bookmark) ? 'primary' : 'secondary'}
                className={styles.bookmark}
                style={{
                  left: `${(bookmark.start / video.duration) * 100}%`,
                  top: `${(bookmarkLevels[idx] - 1) * spacing.bookmark}px`
                }}
                onClick={() => playVideo(bookmark.start)}
                ref={(bookmark: HTMLButtonElement) => (bookmarksRef.current[idx] = bookmark)}
              >
                <div data-tooltip-id={bookmark.id.toString()}>{bookmark.name}</div>

                {tooltip && (
                  <Tooltip id={bookmark.id.toString()} className={styles.tooltip}>
                    {bookmark.starID !== 0 && (
                      <Image
                        src={`${serverConfig.api}/star/${bookmark.starID}/image`}
                        data-star-id={bookmark.starID}
                        width={200}
                        height={275}
                        missing={stars.find(s => s.id === bookmark.starID)?.image === null}
                        alt='star'
                      />
                    )}

                    {bookmark.attributes
                      .sort((a, b) => {
                        if (isStarAttribute(bookmark.starID, a.id)) return -1
                        else if (isStarAttribute(bookmark.starID, b.id)) return 1

                        return a.name.localeCompare(b.name)
                      })
                      .map(attribute => (
                        <Button
                          key={attribute.id}
                          color='info'
                          size='small'
                          variant='contained'
                          component='div'
                          className={`attribute ${styles.btn}`}
                        >
                          {attribute.name}
                        </Button>
                      ))}
                    {bookmark.outfit !== null && (
                      <>
                        <hr />
                        <Button
                          key={`outfit__${bookmark.outfit}`}
                          color='info'
                          size='small'
                          variant='contained'
                          component='div'
                          className={styles.btn}
                        >
                          {bookmark.outfit}
                        </Button>
                      </>
                    )}
                  </Tooltip>
                )}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`bookmark-${bookmark.id}`}>
              <IconWithText
                component={ContextMenuItem}
                icon='add'
                text='Add Star'
                disabled={bookmark.starID !== 0 || stars.length === 0}
                onClick={() => setStarEvent(true, bookmark)}
              />

              <IconWithText
                component={ContextMenuItem}
                icon='delete'
                text='Remove Star'
                disabled={bookmark.starID === 0}
                onClick={() => removeStar(bookmark)}
              />

              <hr />

              <IconWithText
                component={ContextMenuItem}
                icon='add'
                text='Add Attribute'
                onClick={() => {
                  onModal(
                    'Add Attribute',
                    attributes
                      .filter(attribute => bookmark.attributes.every(attr => attribute.name !== attr.name))
                      .map(attribute => (
                        <Button
                          key={attribute.id}
                          variant='outlined'
                          color='primary'
                          onClick={() => {
                            onModal()
                            addAttribute(attribute, bookmark)
                          }}
                        >
                          {attribute.name}
                        </Button>
                      )),
                    true
                  )
                }}
              />

              <IconWithText
                component={ContextMenuItem}
                icon='delete'
                text='Remove Attribute'
                disabled={attributesFromStar(bookmark.starID).length >= bookmark.attributes.length}
                onClick={() => {
                  onModal(
                    'Remove Attribute',
                    bookmark.attributes
                      // only show attribute, if not from star
                      .filter(attribute => !isStarAttribute(bookmark.starID, attribute.id))
                      .map(attribute => (
                        <Button
                          key={attribute.id}
                          variant='outlined'
                          color='primary'
                          onClick={() => {
                            onModal()
                            removeAttribute(bookmark, attribute)
                          }}
                        >
                          {attribute.name}
                        </Button>
                      )),
                    true
                  )
                }}
              />

              <IconWithText
                component={ContextMenuItem}
                icon='delete'
                text='Clear Attributes'
                disabled={attributesFromStar(bookmark.starID).length >= bookmark.attributes.length}
                onClick={() => clearAttributes(bookmark)}
              />

              <hr />

              <IconWithText
                component={ContextMenuItem}
                icon='add'
                text='Set Outfit'
                onClick={() => {
                  onModal(
                    'Set Outfit',
                    outfits
                      .filter(outfit => outfit.name !== bookmark.outfit)
                      .map(outfit => (
                        <Button
                          key={outfit.id}
                          variant='outlined'
                          color='primary'
                          onClick={() => {
                            onModal()
                            setOutfit(outfit, bookmark)
                          }}
                        >
                          {outfit.name}
                        </Button>
                      )),
                    true
                  )
                }}
              />

              <IconWithText
                component={ContextMenuItem}
                icon='delete'
                text='Remove Outfit'
                disabled={bookmark.outfit === null}
                onClick={() => removeOutfit(bookmark)}
              />

              <hr />

              <IconWithText
                component={ContextMenuItem}
                icon='edit'
                text='Change Category'
                onClick={() => {
                  onModal(
                    'Change Category',
                    categories
                      .filter(category => category.name !== bookmark.name)
                      .map(category => (
                        <Button
                          key={category.id}
                          variant='outlined'
                          color='primary'
                          onClick={() => {
                            onModal()
                            setCategory(category, bookmark)
                          }}
                        >
                          {category.name}
                        </Button>
                      )),
                    true
                  )
                }}
              />

              <IconWithText
                component={ContextMenuItem}
                icon='time'
                text='Change Time'
                onClick={() => setTime(bookmark.id)}
              />

              <hr />

              <IconWithText
                component={ContextMenuItem}
                icon='delete'
                text='Delete'
                onClick={() => removeBookmark(bookmark.id)}
              />
            </ContextMenu>
          </Fragment>
        )
      })}
    </div>
  )
}
