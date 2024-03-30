import { useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { Tooltip } from 'react-tooltip'
import { useWindowSize } from 'react-use'

import { MediaPlayerInstance } from '@/components/vidstack'

import { IconWithText } from '../icon'
import MissingImage from '../image/missing'
import Spinner from '../spinner'

import { serverConfig } from '@/config'
import { useActiveContext } from '@/context/activeContext'
import { useModalContext } from '@/context/modalContext'
import { useStarEventContext } from '@/context/starEventContext'
import useCollision from '@/hooks/useCollision'
import { Bookmark as BookmarkType } from '@/interface'
import { attributeService, bookmarkService, categoryService, outfitService, videoService } from '@/service'

import styles from './timeline.module.scss'

const spacing = { top: 3, bookmark: 36 }

type TimelineProps = {
  videoId: number
  playerRef: React.RefObject<MediaPlayerInstance>
  playerReady: boolean
}
export default function Timeline({ videoId, playerRef, playerReady }: TimelineProps) {
  const windowSize = useWindowSize()
  const bookmarksRef = useRef<HTMLButtonElement[]>([])
  const [maxLevel, setMaxLevel] = useState(0)
  const [bookmarkLevels, setBookmarkLevels] = useState<number[]>([])
  const { collisionCheck } = useCollision()

  const { data: video } = videoService.useVideo(videoId)
  const { data: bookmarks } = videoService.useBookmarks(videoId)

  useEffect(() => {
    if (bookmarks === undefined) return

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
  }, [bookmarks, collisionCheck, playerRef, windowSize.width, playerReady])

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
  }, [maxLevel, playerRef, playerReady])

  if (video === undefined || bookmarks === undefined) return <Spinner />

  return (
    <div id={styles.timeline} style={bookmarks.length > 0 ? { marginTop: spacing.top } : {}}>
      {bookmarks.map((bookmark, idx) => (
        <Bookmark
          key={bookmark.id}
          bookmark={bookmark}
          duration={video.duration}
          top={`${(bookmarkLevels[idx] - 1) * spacing.bookmark}px`}
          videoId={videoId}
          playerRef={playerRef}
          bookmarkRef={ref => (bookmarksRef.current[idx] = ref)}
        />
      ))}
    </div>
  )
}

type BookmarkProps = {
  bookmark: BookmarkType
  duration: number
  top: string
  videoId: number
  playerRef: React.RefObject<MediaPlayerInstance>
  bookmarkRef: (btn: HTMLButtonElement) => void
}

function Bookmark({ bookmark, duration, top, videoId, playerRef, bookmarkRef }: BookmarkProps) {
  const { data: outfits } = outfitService.useAll()
  const { data: attributes } = attributeService.useAll()
  const { data: categories } = categoryService.useAll()
  const { data: stars } = videoService.useStars(videoId)

  const { mutate: mutateSetTime } = bookmarkService.useSetTime(videoId, bookmark.id)
  const { mutate: mutateSetCategory } = bookmarkService.useSetCategory(videoId, bookmark.id)
  const { mutate: mutateAddAttribute } = bookmarkService.useAddAttribute(videoId, bookmark.id)
  const { mutate: mutateRemoveAttribute } = bookmarkService.useRemoveAttribute(videoId, bookmark.id)
  const { mutate: mutateSetOutfit } = bookmarkService.useSetOutfit(videoId, bookmark.id)
  const { mutate: mutateRemoveBookmark } = bookmarkService.useRemoveBookmark(videoId, bookmark.id)
  const { mutate: mutateRemoveStar } = bookmarkService.useRemoveStar(videoId, bookmark.id)
  const { mutate: mutateRemoveOutfit } = bookmarkService.useRemoveOutfit(videoId, bookmark.id)
  const { mutate: mutateClearAttributes } = bookmarkService.useClearAttributes(videoId, bookmark.id)

  const { active } = useActiveContext()
  const { setEvent: setStarEvent } = useStarEventContext()
  const { setModal } = useModalContext()

  const isActive =
    (active.star !== null && bookmark.starID === active.star.id) ||
    (active.attribute !== null && bookmark.attributes.some(a => a.id === active.attribute?.id)) ||
    (active.outfit !== null && bookmark.outfit === active.outfit)

  const tooltip = bookmark.starID > 0 || bookmark.attributes.length > 0 || bookmark.outfit !== null

  const playVideo = (time: number) => {
    const player = playerRef.current
    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  const setTime = () => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)

      mutateSetTime({ time })
    }
  }

  const attributesFromStar = (starID: number) => stars?.find(star => star.id === starID)?.attributes ?? []
  const isStarAttribute = (starID: number, attributeID: number) => {
    return attributesFromStar(starID).some(attr => attr.id === attributeID)
  }

  return (
    <>
      <ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
        <Button
          size='small'
          variant={isActive ? 'contained' : 'outlined'}
          color={bookmark.starID !== 0 ? 'primary' : 'secondary'}
          className={styles.bookmark}
          style={{
            left: `${(bookmark.start / duration) * 100}%`,
            top
          }}
          onMouseDown={e => e.button === 0 && playVideo(bookmark.start)}
          ref={bookmarkRef}
        >
          <div data-tooltip-id={bookmark.id.toString()}>{bookmark.name}</div>

          {tooltip && (
            <Tooltip id={bookmark.id.toString()} className={styles.tooltip} opacity={1}>
              {bookmark.starID !== 0 &&
                (stars?.find(s => s.id === bookmark.starID)?.image === null ? (
                  <MissingImage />
                ) : (
                  <img
                    src={`${serverConfig.newApi}/star/${bookmark.starID}/image`}
                    data-star-id={bookmark.starID}
                    // missing={stars.find(s => s.id === bookmark.starID)?.image === null}
                    alt='star'
                  />
                ))}

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
          disabled={bookmark.starID !== 0 || stars === undefined || stars.length === 0}
          onClick={() => setStarEvent(true, bookmark)}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='delete'
          text='Remove Star'
          disabled={bookmark.starID === 0}
          onClick={mutateRemoveStar}
        />

        <hr />

        <IconWithText
          component={ContextMenuItem}
          icon='add'
          text='Add Attribute'
          onClick={() => {
            setModal(
              'Add Attribute',
              attributes
                ?.filter(attribute => bookmark.attributes.every(attr => attribute.name !== attr.name))
                .map(attribute => (
                  <Button
                    key={attribute.id}
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      setModal()
                      mutateAddAttribute({ attributeID: attribute.id })
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
            setModal(
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
                      setModal()
                      mutateRemoveAttribute({ attributeID: attribute.id })
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
          onClick={mutateClearAttributes}
        />

        <hr />

        <IconWithText
          component={ContextMenuItem}
          icon='add'
          text='Set Outfit'
          onClick={() => {
            setModal(
              'Set Outfit',
              outfits
                ?.filter(outfit => outfit.name !== bookmark.outfit)
                .map(outfit => (
                  <Button
                    key={outfit.id}
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      setModal()
                      mutateSetOutfit({ outfitID: outfit.id })
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
          onClick={mutateRemoveOutfit}
        />

        <hr />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Change Category'
          onClick={() => {
            setModal(
              'Change Category',
              categories
                ?.filter(category => category.name !== bookmark.name)
                .map(category => (
                  <Button
                    key={category.id}
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      setModal()
                      mutateSetCategory({ categoryID: category.id })
                    }}
                  >
                    {category.name}
                  </Button>
                )),
              true
            )
          }}
        />

        <IconWithText component={ContextMenuItem} icon='time' text='Change Time' onClick={setTime} />

        <hr />

        <IconWithText component={ContextMenuItem} icon='delete' text='Delete' onClick={mutateRemoveBookmark} />
      </ContextMenu>
    </>
  )
}
