import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import { keys } from '@keys'
import { useQueryClient } from '@tanstack/react-query'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { Tooltip } from 'react-tooltip'
import { useWindowSize } from 'react-use'

import { MediaPlayerInstance } from '@components/vidstack'

import { IconWithText } from '../icon'
import Image from '../image'
import { ModalHandler } from '../modal'

import { serverConfig } from '@config'
import useCollisionCheck from '@hooks/useCollisionCheck'
import { EventHandler } from '@hooks/useStarEvent'
import { Attribute, Bookmark, Category, VideoStar, Video, Outfit } from '@interfaces'
import { bookmarkService, outfitService } from '@service'
import { mutateAndInvalidate } from '@utils/shared'

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
  const [bookmarkLevels, setBookmarkLevels] = useState<number[]>([])
  const [refReady, setRefReady] = useState(false)
  const { collisionCheck } = useCollisionCheck()
  const { mutate } = bookmarkService.useSetTime()
  const { mutate: mutateSetCategory } = bookmarkService.useSetCategory()
  const { mutate: mutateAddAttribute } = bookmarkService.useAddAttribute()
  const { mutate: mutateRemoveAttribute } = bookmarkService.useRemoveAttribute()
  const { mutate: mutateSetOutfit } = bookmarkService.useSetOutfit()
  const queryClient = useQueryClient()

  const { data: outfits } = outfitService.useAll()

  const setTime = (bookmarkID: number) => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)

      mutateAndInvalidate({
        mutate,
        queryClient,
        ...keys.videos.byId(video.id)._ctx.bookmark,
        variables: { time, id: bookmarkID }
      })
    }
  }

  const hasStar = (bookmark: Bookmark) => bookmark.starID > 0
  const attributesFromStar = (starID: number) => stars.filter(star => star.id === starID)[0]?.attributes ?? []
  const isStarAttribute = (starID: number, attributeID: number) => {
    return attributesFromStar(starID).some(attr => attr.id === attributeID)
  }

  const removeBookmark = (id: number) => {
    bookmarkService.removeBookmark(id).then(() => {
      location.reload()
    })
  }

  const setCategory = (category: Category, bookmark: Bookmark) => {
    mutateAndInvalidate({
      mutate: mutateSetCategory,
      queryClient,
      ...keys.videos.byId(video.id)._ctx.bookmark,
      variables: { categoryID: category.id, id: bookmark.id }
    })
  }

  const setOutfit = (outfit: Outfit, bookmark: Bookmark) => {
    mutateAndInvalidate({
      mutate: mutateSetOutfit,
      queryClient,
      ...keys.videos.byId(video.id)._ctx.bookmark,
      variables: { outfitID: outfit.id, id: bookmark.id }
    })
  }

  const removeOutfit = (bookmark: Bookmark) => {
    bookmarkService.removeOutfit(bookmark.id).then(() => {
      location.reload()
    })
  }

  const addAttribute = (attribute: Attribute, bookmark: Bookmark) => {
    mutateAndInvalidate({
      mutate: mutateAddAttribute,
      queryClient,
      ...keys.videos.byId(video.id)._ctx.bookmark,
      variables: { attributeID: attribute.id, id: bookmark.id }
    })
  }

  const removeAttribute = (bookmark: Bookmark, attribute: Attribute) => {
    mutateAndInvalidate({
      mutate: mutateRemoveAttribute,
      queryClient,
      ...keys.videos.byId(video.id)._ctx.bookmark,
      variables: { attributeID: attribute.id, id: bookmark.id }
    })
  }

  const clearAttributes = (bookmark: Bookmark) => {
    bookmarkService.clearAttributes(bookmark.id).then(() => {
      location.reload()
    })
  }

  const removeStar = (bookmark: Bookmark) => {
    bookmarkService.removeStar(bookmark.id).then(() => {
      location.reload()
    })
  }

  const playVideo = (time: number) => {
    const player = playerRef.current
    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  useEffect(() => {
    const bookmarksArr = bookmarksRef.current
    const levels: number[] = new Array(bookmarks.length).fill(0)

    for (let i = 0; i < bookmarksArr.length; i++) {
      let level = 1
      for (let j = 0; j < i; j++) {
        if (levels[j] === level && collisionCheck(bookmarksArr[j], bookmarksArr[i])) {
          level++
          j = -1
        }
      }

      levels[i] = level
    }

    setBookmarkLevels(levels)
  }, [bookmarks, collisionCheck, refReady, windowSize.width])

  const assignRef = useCallback(
    (bookmark: HTMLButtonElement | null, idx: number) => {
      if (bookmark === null) return

      bookmarksRef.current[idx] = bookmark

      if (bookmarks.every((_, idx) => bookmarksRef.current.at(idx) !== undefined)) {
        setRefReady(true)
      }
    },
    [bookmarks]
  )

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
                ref={bookmark => assignRef(bookmark, idx)}
              >
                <div data-tooltip-id={bookmark.id.toString()}>{bookmark.name}</div>

                {tooltip && (
                  <Tooltip id={bookmark.id.toString()} className={styles.tooltip} opacity={1}>
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
