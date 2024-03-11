import { Fragment, useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { Tooltip } from 'react-tooltip'
import { useWindowSize } from 'react-use'

import { MediaPlayerInstance } from '@/components/vidstack'

import { IconWithText } from '../icon'
import { ModalHandler } from '../modal'

import { serverConfig } from '@/config'
import useCollisionCheck from '@/hooks/useCollisionCheck'
import { EventHandler } from '@/hooks/useStarEvent'
import { Attribute, Bookmark, Category, VideoStar, Video, Outfit } from '@/interface'
import { bookmarkService, outfitService } from '@/service'

import styles from './timeline.module.scss'

const spacing = { top: 3, bookmark: 36 }

type TimelineProps = {
  video: Video
  bookmarks: Bookmark[]
  stars: VideoStar[]
  attributes: Attribute[]
  categories: Category[]
  playerRef: React.RefObject<MediaPlayerInstance>
  onModal: ModalHandler
  setStarEvent: EventHandler
}
export default function Timeline({
  video,
  bookmarks,
  stars,
  attributes,
  categories,
  playerRef,
  onModal,
  setStarEvent
}: TimelineProps) {
  const windowSize = useWindowSize()
  const bookmarksRef = useRef<HTMLButtonElement[]>([])
  const [maxLevel, setMaxLevel] = useState(0)
  const [bookmarkLevels, setBookmarkLevels] = useState<number[]>([])
  const { collisionCheck } = useCollisionCheck()
  const { data: outfits } = outfitService.useAll()
  const { mutate: mutateSetTime } = bookmarkService.useSetTime(video.id)
  const { mutate: mutateSetCategory } = bookmarkService.useSetCategory(video.id)
  const { mutate: mutateAddAttribute } = bookmarkService.useAddAttribute(video.id)
  const { mutate: mutateRemoveAttribute } = bookmarkService.useRemoveAttribute(video.id)
  const { mutate: mutateSetOutfit } = bookmarkService.useSetOutfit(video.id)
  const { mutate: mutateRemoveBookmark } = bookmarkService.useRemoveBookmark(video.id)
  const { mutate: mutateRemoveStar } = bookmarkService.useRemoveStar(video.id)

  useEffect(() => {
    const bookmarksArr = bookmarks.length > 0 ? bookmarksRef.current : []
    const levels = Array<number>(bookmarks.length).fill(0)
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

    setMaxLevel(maxLevel)
    setBookmarkLevels(levels)
  }, [bookmarks, collisionCheck, playerRef, windowSize.width])

  useEffect(() => {
    const setHeight = () => {
      const videoElement = playerRef.current?.el ?? null
      if (videoElement !== null) {
        const videoTop = videoElement.getBoundingClientRect().top
        videoElement.style.height = `calc(100vh - (${spacing.bookmark}px * ${maxLevel}) - ${videoTop}px - ${spacing.top}px)`
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

  const setTime = (bookmarkID: number) => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)

      mutateSetTime({ time, id: bookmarkID })
    }
  }

  const hasStar = (bookmark: Bookmark) => bookmark.starID > 0
  const attributesFromStar = (starID: number) => stars.find(star => star.id === starID)?.attributes ?? []
  const isStarAttribute = (starID: number, attributeID: number) => {
    return attributesFromStar(starID).some(attr => attr.id === attributeID)
  }

  const removeBookmark = (id: number) => {
    mutateRemoveBookmark({ id })
  }

  const setCategory = (category: Category, bookmark: Bookmark) => {
    mutateSetCategory({ categoryID: category.id, id: bookmark.id })
  }

  const setOutfit = (outfit: Outfit, bookmark: Bookmark) => {
    mutateSetOutfit({ outfitID: outfit.id, id: bookmark.id })
  }

  const removeOutfit = (bookmark: Bookmark) => {
    bookmarkService.removeOutfit(bookmark.id).then(() => {
      location.reload()
    })
  }

  const addAttribute = (attribute: Attribute, bookmark: Bookmark) => {
    mutateAddAttribute({ attributeID: attribute.id, id: bookmark.id })
  }

  const removeAttribute = (bookmark: Bookmark, attribute: Attribute) => {
    mutateRemoveAttribute({
      attributeID: attribute.id,
      id: bookmark.id
    })
  }

  const clearAttributes = (bookmark: Bookmark) => {
    bookmarkService.clearAttributes(bookmark.id).then(() => {
      location.reload()
    })
  }

  const removeStar = (bookmark: Bookmark) => {
    mutateRemoveStar({ id: bookmark.id })
  }

  const playVideo = (time: number) => {
    const player = playerRef.current
    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  return (
    <div id={styles.timeline} style={bookmarks.length > 0 ? { marginTop: spacing.top } : {}}>
      {bookmarks.map((bookmark, idx) => {
        const tooltip = bookmark.starID > 0 || bookmark.attributes.length > 0 || bookmark.outfit !== null

        return (
          <Fragment key={bookmark.id}>
            <ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
              <Button
                size='small'
                variant='outlined'
                color={hasStar(bookmark) ? 'primary' : 'secondary'}
                className={styles.bookmark}
                style={{
                  left: `${(bookmark.start / video.duration) * 100}%`,
                  top: `${(bookmarkLevels[idx] - 1) * spacing.bookmark}px`
                }}
                onMouseDown={e => e.button === 0 && playVideo(bookmark.start)}
                ref={bookmark => bookmark !== null && (bookmarksRef.current[idx] = bookmark)}
              >
                <div data-tooltip-id={bookmark.id.toString()}>{bookmark.name}</div>

                {tooltip && (
                  <Tooltip id={bookmark.id.toString()} className={styles.tooltip} opacity={1}>
                    {bookmark.starID !== 0 && (
                      <img
                        src={`${serverConfig.newApi}/star/${bookmark.starID}/image`}
                        data-star-id={bookmark.starID}
                        // missing={stars.find(s => s.id === bookmark.starID)?.image === null}
                        style={{ width: '100%' }}
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
                      ?.filter(outfit => outfit.name !== bookmark.outfit)
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
