import { Fragment, useEffect } from 'react'

import { Button } from '@mui/material'

import ReactTooltip from 'react-tooltip'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { useWindowSize } from 'react-use'

import Image from '../image'
import { ModalHandler } from '../modal'
import { IconWithText } from '../icon'

import { EventHandler } from '@hooks/star-event'
import { Attribute, Bookmark, Category, VideoStar as Star, Video, SetState, Outfit } from '@interfaces'
import { bookmarkService, outfitService } from '@service'
import { serverConfig, settingsConfig } from '@config'

import styles from './timeline.module.scss'

type TimelineProps = {
  video: Video
  bookmarks: Bookmark[]
  stars: Star[]
  attributes: Attribute[]
  categories: Category[]
  playVideo: (time?: number | null) => void
  setTime: (bookmarkID: number, time?: number) => void
  update: SetState<Bookmark[]>
  onModal: ModalHandler
  setStarEvent: EventHandler
}
const Timeline = ({
  video,
  bookmarks,
  stars,
  attributes,
  categories,
  playVideo,
  setTime,
  update,
  onModal,
  setStarEvent
}: TimelineProps) => {
  const windowSize = useWindowSize()

  const { data: outfits } = outfitService.useOutfits()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bookmarksArr: HTMLElement[] = []

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
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.id === bookmark.id) {
            bookmarkItem.name = category.name
          }

          return bookmarkItem
        })
      )
    })
  }

  const setOutfit = (outfit: Outfit, bookmark: Bookmark) => {
    bookmarkService.setOutfit(bookmark.id, outfit.id).then(() => {
      update(
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.id === bookmark.id) {
            bookmarkItem.outfit = outfit.name
          }

          return bookmarkItem
        })
      )
    })
  }

  const removeOutfit = (bookmark: Bookmark) => {
    bookmarkService.removeOutfit(bookmark.id).then(() => {
      update(
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.id === bookmark.id) {
            bookmarkItem.outfit = null
          }

          return bookmarkItem
        })
      )
    })
  }

  const addAttribute = (attribute: Attribute, bookmark: Bookmark) => {
    bookmarkService.addAttribute(bookmark.id, attribute.id).then(() => {
      update(
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.id === bookmark.id) {
            bookmarkItem.attributes.push({
              id: attribute.id,
              name: attribute.name
            })
          }

          return bookmarkItem
        })
      )
    })
  }

  const removeAttribute = (bookmark: Bookmark, attribute: Attribute) => {
    bookmarkService.removeAttribute(bookmark.id, attribute.id).then(() => {
      update(
        bookmarks.map(item => {
          if (item.id === bookmark.id) {
            item.attributes = item.attributes.filter(itemAttribute =>
              itemAttribute.id === attribute.id ? null : itemAttribute
            )
          }

          return item
        })
      )
    })
  }

  const clearAttributes = (bookmark: Bookmark) => {
    bookmarkService.clearAttributes(bookmark.id).then(() => {
      update(
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.id === bookmark.id) {
            const starID = bookmark.starID

            if (starID !== 0) {
              const starAttribute = attributesFromStar(starID)

              bookmarkItem.attributes = bookmarkItem.attributes.filter(bookmarkAttribute => {
                const match = starAttribute.some(starAttribute => starAttribute.name === bookmarkAttribute.name)

                return match ? bookmarkAttribute : null
              })
            } else {
              // Bookmark does not have a star
              bookmarkItem.attributes = []
            }
          }

          return bookmarkItem
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
              item.attributes = item.attributes.filter(attribute => {
                const match = attributes.some(starAttribute => starAttribute.name === attribute.name)

                return !match ? attribute : null
              })
            } else {
              // Bookmark has only attributes from star
              item.attributes = []
            }

            // RESET starID
            item.starID = 0
          }

          return item
        })
      )
    })
  }

  const collisionCheck = (a: HTMLElement, b: HTMLElement) => {
    const valA = a.getBoundingClientRect()
    const valB = b.getBoundingClientRect()

    return !(
      valA.x + valA.width < valB.x - settingsConfig.timeline.spacing ||
      valA.x + settingsConfig.timeline.spacing > valB.x + valB.width
    )
  }

  const setDataLevel = (item: HTMLElement, level: number) => {
    if (level > 0) {
      item.setAttribute('data-level', level.toString())
    }
  }

  useEffect(() => {
    const LEVEL_MIN = 1

    let level = LEVEL_MIN
    bookmarksArr.forEach((item, idx, arr) => {
      if (idx > 0) {
        const collision = arr.some((other, i) => i < idx && collisionCheck(other, item))

        level = collision ? level + 1 : LEVEL_MIN
      }

      setDataLevel(item, level)
    })
  }, [bookmarksArr, windowSize.width])

  if (outfits === undefined) return null

  return (
    <div className='col-12' id={styles.timeline}>
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
                  left: `${((bookmark.start * 100) / video.duration) * settingsConfig.timeline.offset}%`
                }}
                onClick={() => playVideo(bookmark.start)}
                ref={(item: HTMLButtonElement) => (bookmarksArr[idx] = item)}
                data-level={1}
              >
                <div data-tip={tooltip} data-for={`bookmark-info-${bookmark.id}`}>
                  {bookmark.name}
                </div>

                {tooltip && (
                  <ReactTooltip id={`bookmark-info-${bookmark.id}`} effect='solid'>
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
                  </ReactTooltip>
                )}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`bookmark-${bookmark.id}`}>
              <IconWithText
                component={MenuItem}
                icon='add'
                text='Add Star'
                disabled={bookmark.starID !== 0 || stars.length === 0}
                onClick={() => setStarEvent(true, bookmark)}
              />

              <IconWithText
                component={MenuItem}
                icon='delete'
                text='Remove Star'
                disabled={bookmark.starID === 0}
                onClick={() => removeStar(bookmark)}
              />

              <hr />

              <IconWithText
                component={MenuItem}
                icon='add'
                text='Add Attribute'
                onClick={() => {
                  onModal(
                    'Add Attribute',
                    attributes
                      .filter(attribute => {
                        const match = bookmark.attributes.some(
                          bookmarkAttribute => attribute.name === bookmarkAttribute.name
                        )

                        return !match ? attribute : null
                      })
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
                component={MenuItem}
                icon='delete'
                text='Remove Attribute'
                disabled={attributesFromStar(bookmark.starID).length >= bookmark.attributes.length}
                onClick={() => {
                  onModal(
                    'Remove Attribute',
                    bookmark.attributes
                      .filter(attribute => {
                        // only show attribute, if not from star
                        if (isStarAttribute(bookmark.starID, attribute.id)) return null

                        return attribute
                      })
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
                component={MenuItem}
                icon='delete'
                text='Clear Attributes'
                disabled={attributesFromStar(bookmark.starID).length >= bookmark.attributes.length}
                onClick={() => clearAttributes(bookmark)}
              />

              <hr />

              <IconWithText
                component={MenuItem}
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
                component={MenuItem}
                icon='delete'
                text='Remove Outfit'
                disabled={bookmark.outfit === null}
                onClick={() => removeOutfit(bookmark)}
              />

              <hr />

              <IconWithText
                component={MenuItem}
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

              <IconWithText component={MenuItem} icon='time' text='Change Time' onClick={() => setTime(bookmark.id)} />

              <IconWithText
                component={MenuItem}
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

export default Timeline
