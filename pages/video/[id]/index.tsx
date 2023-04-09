import { NextPage } from 'next/types'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography
} from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { Flipped, Flipper } from 'react-flip-toolkit'

import { ImageCard, ResponsiveImage } from '@components/image'
import ModalComponent, { Modal, ModalHandler, useModal } from '@components/modal'
import { Header, Player, Timeline } from '@components/video'
import Icon from '@components/icon'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Link from '@components/link'
import Spinner from '@components/spinner'
import { PlyrWithMetadata } from '@components/plyr'

import useStarEvent, { type Event, type EventData, type EventHandler } from '@hooks/star-event'
import { attributeService, bookmarkService, categoryService, videoService } from '@service'
import { serverConfig } from '@config'
import { Attribute, Bookmark, Category, SetState, VideoStar, Video } from '@interfaces'

import styles from './video.module.scss'

const VideoPage: NextPage = () => {
  const { query, isReady } = useRouter()

  const videoID = isReady && typeof query.id === 'string' ? parseInt(query.id) : undefined
  const { data: starData } = videoService.useStars(videoID)
  const { data: videoData } = videoService.useVideo(videoID)
  const { data: bookmarksData } = videoService.useBookmarks(videoID)

  const { data: categories } = categoryService.useCategories()
  const { data: attributes } = attributeService.useAttributes()

  const [video, setVideo] = useState<Video>()
  const [stars, setStars] = useState<VideoStar[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  const { modal, setModal } = useModal()
  const { setEvent, getEvent, getDefault } = useStarEvent()

  useEffect(() => {
    if (starData !== undefined) {
      setStars(starData)
    }
  }, [starData])

  useEffect(() => {
    if (bookmarksData !== undefined) {
      setBookmarks(
        bookmarksData.map(bookmark => {
          return { ...bookmark, active: false }
        })
      )
    }
  }, [bookmarksData])

  useEffect(() => {
    setVideo(videoData)
  }, [videoData])

  return (
    <Grid container>
      <Section
        video={video}
        bookmarks={bookmarks}
        categories={categories}
        attributes={attributes}
        stars={stars}
        update={{
          bookmarks: setBookmarks,
          stars: setStars,
          video: setVideo
        }}
        modal={{ handler: setModal, data: modal }}
        setStarEvent={setEvent}
      />

      <Sidebar
        video={video}
        stars={stars}
        bookmarks={bookmarks}
        attributes={attributes}
        categories={categories}
        update={{
          stars: setStars,
          bookmarks: setBookmarks,
          video: setVideo
        }}
        onModal={setModal}
        starEvent={{ getEvent, setEvent, getDefault: getDefault }}
      />

      <ModalComponent visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </ModalComponent>
    </Grid>
  )
}

type SectionProps = {
  video?: Video
  bookmarks: Bookmark[]
  categories?: Category[]
  attributes?: Attribute[]
  stars: VideoStar[]
  update: {
    stars: SetState<VideoStar[]>
    bookmarks: SetState<Bookmark[]>
    video: SetState<Video | undefined>
  }
  modal: {
    handler: ModalHandler
    data: Modal
  }
  setStarEvent: EventHandler
}
const Section = ({ video, bookmarks, categories, attributes, stars, update, modal, setStarEvent }: SectionProps) => {
  const plyrRef = useRef<PlyrWithMetadata | null>(null)

  // Helper script for getting the player
  const getPlayer = () => plyrRef.current

  const playVideo = (time: number | null = null) => {
    const player = getPlayer()

    if (player !== null) {
      if (time === null) time = player.currentTime
      player.currentTime = Number(time)
      player.play()
    }
  }

  const setTime = (bookmarkID: number) => {
    if (plyrRef.current !== null) {
      const time = Math.round(plyrRef.current.currentTime)

      bookmarkService.setTime(bookmarkID, time).then(() => {
        update.bookmarks(
          bookmarks
            .map(bookmark => {
              if (bookmark.id === bookmarkID) bookmark.start = time

              return bookmark
            })
            .sort((a, b) => a.start - b.start)
        )
      })
    }
  }

  if (video === undefined || categories === undefined || attributes === undefined) return <Spinner />

  return (
    <Grid item xs={9} component='section'>
      <Header video={video} update={update.video} onModal={modal.handler} />

      <Player
        plyrRef={plyrRef}
        video={video}
        bookmarks={bookmarks}
        categories={categories}
        stars={stars}
        update={{ video: update.video, bookmarks: update.bookmarks }}
        modal={modal}
      />

      <Timeline
        video={video}
        bookmarks={bookmarks}
        stars={stars}
        attributes={attributes}
        categories={categories}
        playVideo={playVideo}
        setTime={setTime}
        update={update.bookmarks}
        onModal={modal.handler}
        setStarEvent={setStarEvent}
      />
    </Grid>
  )
}

type SidebarProps = {
  video?: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  attributes?: Attribute[]
  categories?: Category[]
  update: {
    stars: SetState<VideoStar[]>
    bookmarks: SetState<Bookmark[]>
    video: SetState<Video | undefined>
  }
  onModal: ModalHandler
  starEvent: { getEvent: Event; getDefault: EventData; setEvent: EventHandler }
}
const Sidebar = ({ video, stars, bookmarks, attributes, categories, update, onModal, starEvent }: SidebarProps) => {
  const clearActive = () => {
    update.bookmarks(
      bookmarks.map(bookmark => {
        bookmark.active = false

        return bookmark
      })
    )
  }

  const getAttributes = () => {
    const attributeArr: Attribute[] = []
    bookmarks.forEach(({ attributes }) => {
      attributes
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(attribute => {
          if (!attributeArr.some(attr => attr.id === attribute.id)) attributeArr.push(attribute)
        })
    })

    return attributeArr
  }

  if (video === undefined || categories === undefined || attributes === undefined) return <Spinner />

  return (
    <Grid item xs={3} id={styles.sidebar} component='aside'>
      <Grid container justifyContent='center' style={{ marginTop: 6, marginBottom: 18 }}>
        {/* <HeaderNetwork video={video} update={update} /> */}

        <div style={{ height: 30 }}></div>
      </Grid>

      <Franchise video={video} />

      <Flipper flipKey={stars}>
        <Grid container justifyContent='center'>
          <Stars
            video={video}
            stars={stars}
            bookmarks={bookmarks}
            attributes={attributes}
            categories={categories}
            clearActive={clearActive}
            update={{ stars: update.stars, bookmarks: update.bookmarks }}
            onModal={onModal}
            starEvent={starEvent}
          />
        </Grid>
      </Flipper>

      <StarInput
        video={video}
        stars={stars}
        bookmarks={bookmarks}
        getAttributes={getAttributes}
        update={{ video: update.video, stars: update.stars }}
      />

      <Attributes
        video={video}
        bookmarks={bookmarks}
        clearActive={clearActive}
        update={update.bookmarks}
        getAttributes={getAttributes}
      />

      <Outfits bookmarks={bookmarks} clearActive={clearActive} update={update.bookmarks} />
    </Grid>
  )
}

type StarsProps = {
  video: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  attributes: Attribute[]
  categories: Category[]
  clearActive: () => void
  update: {
    stars: SetState<VideoStar[]>
    bookmarks: SetState<Bookmark[]>
  }
  onModal: ModalHandler
  starEvent: { getEvent: Event; getDefault: EventData; setEvent: EventHandler }
}
const Stars = ({
  video,
  stars,
  bookmarks,
  attributes,
  categories,
  clearActive,
  update,
  onModal,
  starEvent
}: StarsProps) => {
  const removeStar = (id: number) => {
    videoService.removeStar(video.id, id).then(() => {
      update.stars(stars.filter(star => star.id !== id))
    })
  }

  useEffect(() => {
    update.stars(
      [...stars].sort((a, b) => {
        const bookmarkTime = (star: VideoStar) =>
          bookmarks.find(bookmark => bookmark.starID === star.id)?.start ?? Infinity

        return bookmarkTime(a) - bookmarkTime(b)
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks])

  return (
    <Grid container justifyContent='center' id={styles.stars}>
      {stars.map(star => (
        <Star
          key={star.id}
          video={video}
          star={star}
          bookmarks={bookmarks}
          attributes={attributes}
          categories={categories}
          clearActive={clearActive}
          update={update.bookmarks}
          removeStar={removeStar}
          onModal={onModal}
          starEvent={starEvent}
        />
      ))}
    </Grid>
  )
}

type StarProps = {
  video: Video
  star: VideoStar
  bookmarks: Bookmark[]
  attributes: Attribute[]
  categories: Category[]
  clearActive: () => void
  update: SetState<Bookmark[]>
  removeStar: (id: number) => void
  onModal: ModalHandler
  starEvent: {
    getEvent: Event
    setEvent: EventHandler
    getDefault: Event['data']
  }
}
const Star = ({
  video,
  star,
  bookmarks,
  attributes,
  categories,
  clearActive,
  update,
  removeStar,
  onModal,
  starEvent
}: StarProps) => {
  const [border, setBorder] = useState(false)

  const handleRibbon = (star: VideoStar) => {
    const hasBookmark = bookmarks.some(bookmark => bookmark.starID === star.id)

    if (hasBookmark) return null

    return <Ribbon label='NEW' />
  }

  const addBookmark = (category: Category, star: VideoStar) => {
    const player = document.getElementsByTagName('video')[0]

    const time = Math.round(player.currentTime)
    if (time) {
      videoService.addBookmark(video.id, category.id, time, star.id).then(({ data }) => {
        update(
          [
            ...bookmarks,
            {
              id: data.id,
              name: category.name,
              start: time,
              starID: star.id,
              attributes: data.attributes,
              active: false,
              outfit: null
            }
          ].sort((a, b) => a.start - b.start)
        )
      })
    }
  }

  const addAttribute = (star: VideoStar, attribute: Attribute) => {
    bookmarkService.addStarAttribute(video.id, star.id, attribute.id).then(() => {
      update(
        bookmarks.map(bookmark => {
          if (bookmark.starID === star.id) {
            if (!bookmark.attributes.some(attr => attr.id === attribute.id)) {
              bookmark.attributes.push(attribute)
            }
          }

          return bookmark
        })
      )
    })
  }

  const setActive = (star: VideoStar) => {
    update(
      bookmarks.map(bookmark => {
        if (bookmark.starID === star.id) bookmark.active = true

        return bookmark
      })
    )
  }

  // TODO auto-run if only 1 star
  const addStar = (star: VideoStar) => {
    const bookmark = starEvent.getEvent.data

    // Remove Border
    setBorder(false)
    starEvent.setEvent(false, starEvent.getDefault)

    // Check if bookmark already contains one of the attributes from the star
    bookmarks.forEach(item => {
      if (item.id === bookmark.id) {
        const overlappingAttributes = item.attributes.some(bookmarkAttr =>
          star.attributes.some(starAttr => starAttr.id === bookmarkAttr.id)
        )

        // Bookmark has ZERO Overlapping Attributes
        if (!overlappingAttributes) {
          // Request Bookmark Update
          bookmarkService.addStar(bookmark.id, star.id).then(() => {
            update(
              bookmarks.map(item => {
                if (item.id === bookmark.id) {
                  // MERGE bookmark-attributes with star-attributes
                  item.attributes = item.attributes.concat(star.attributes)

                  // SET starID
                  item.starID = star.id
                }

                return item
              })
            )
          })
        }
      }
    })
  }

  return (
    <Flipped key={star.id} flipId={star.id}>
      <Grid
        item
        xs={4}
        onClick={starEvent.getEvent.event ? () => addStar(star) : undefined}
        onMouseEnter={starEvent.getEvent.event ? () => setBorder(true) : () => setActive(star)}
        onMouseLeave={starEvent.getEvent.event ? () => setBorder(false) : clearActive}
      >
        <ContextMenuTrigger id={`star-${star.id}`}>
          <RibbonContainer
            component={Card}
            className={`${styles.star} ${border ? styles.active : ''}`}
            // style={{ width: 200 }} // fixes issue with missing-image
          >
            <ImageCard
              src={`${serverConfig.api}/star/${star.id}/image`}
              width={200}
              height={200}
              missing={star.image === null}
              renderStyle='transform'
              scale={5}
              alt='star'
              priority
              responsive
              sizes={`${(100 / 12) * 4}vw`}
            />

            <Link href={{ pathname: `/star/[id]`, query: { id: star.id } }}>
              <Typography>{star.name}</Typography>
            </Link>

            {handleRibbon(star)}
          </RibbonContainer>
        </ContextMenuTrigger>

        <ContextMenu id={`star-${star.id}`}>
          <MenuItem
            onClick={() => {
              onModal(
                'Add Bookmark',
                categories.map(category => (
                  <Button
                    key={category.id}
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      onModal()
                      addBookmark(category, star)
                    }}
                  >
                    {category.name}
                  </Button>
                )),
                true
              )
            }}
          >
            <Icon code='add' /> Add Bookmark
          </MenuItem>

          <MenuItem
            disabled={!bookmarks.some(bookmark => bookmark.starID === star.id)}
            onClick={() => {
              onModal(
                'Add Attribute',
                attributes
                  .filter(attribute => {
                    const match = star.attributes.some(attr => attr.id === attribute.id)

                    return !match ? attribute : null
                  })
                  .map(attribute => (
                    <Button
                      key={attribute.id}
                      variant='outlined'
                      color='primary'
                      onClick={() => {
                        onModal()
                        addAttribute(star, attribute)
                      }}
                    >
                      {attribute.name}
                    </Button>
                  )),
                true
              )
            }}
          >
            <Icon code='add' /> Add Attribute
          </MenuItem>

          <MenuItem
            disabled={bookmarks.some(bookmark => bookmark.starID === star.id)}
            onClick={() => removeStar(star.id)}
          >
            <Icon code='trash' /> Remove
          </MenuItem>
        </ContextMenu>
      </Grid>
    </Flipped>
  )
}

type StarInputProps = {
  video: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  getAttributes: () => Attribute[]
  update: {
    video: SetState<Video | undefined>
    stars: SetState<VideoStar[]>
  }
}
const StarInput = ({ video, stars, bookmarks, getAttributes, update }: StarInputProps) => {
  const [input, setInput] = useState('')
  const [noStarToggle, setNoStarToggle] = useState(false)

  const handleNoStar = (checked: boolean) => {
    videoService.toggleNoStar(video.id, checked).then(({ data }) => {
      update.video({ ...video, noStar: data.noStar })
    })
  }

  const addStar = (name: string) => {
    if (input.length) {
      videoService.addStar(video.id, name).then(({ data }) => {
        update.stars([...stars, { ...data, name }])
      })
    }
  }

  // if 'noStar' is updated outside this component
  useEffect(() => {
    if (video.noStar) setNoStarToggle(true)
  }, [video.noStar])

  return (
    <Grid container justifyContent='center'>
      {stars.length > 0 && <Divider light />}

      <div id={styles['stars-input']}>
        <FormGroup row>
          <TextField
            className='form-group__item'
            variant='outlined'
            label='Star'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                addStar(input)

                // Reset Input
                setInput('')

                // Reset focused state
                //@ts-expect-error: target is missing from MUI
                e.target.blur()
              }
            }}
            disabled={video.noStar}
          />

          <FormControlLabel
            className='form-group__item'
            label='No Star'
            control={
              <Checkbox
                checked={noStarToggle}
                onChange={(e, checked) => {
                  // Update checked status
                  setNoStarToggle(checked)

                  handleNoStar(checked)
                }}
              />
            }
            style={{ marginLeft: 0 }}
            disabled={bookmarks.length > 0 || stars.length > 0}
          />
        </FormGroup>
      </div>

      <Grid container marginBottom={1}>
        <AddRelatedStars
          video={video}
          stars={stars}
          disabled={bookmarks.length > 0 || stars.length > 0 || noStarToggle}
          update={update.stars}
        />

        <RemoveUnusedStars
          video={video}
          bookmarks={bookmarks}
          stars={stars}
          disabled={stars.length === 0}
          update={update.stars}
        />
      </Grid>

      {getAttributes().length > 0 && <Divider light />}
    </Grid>
  )
}

type AddRelatedStarsProps = {
  video: Video
  stars: VideoStar[]
  update: SetState<VideoStar[]>
  disabled: boolean
}
const AddRelatedStars = ({ video, stars, disabled, update }: AddRelatedStarsProps) => {
  const { data: relatedStars } = videoService.useRelatedStars(video.id)

  if (disabled || relatedStars === undefined || relatedStars.length === 0) return null

  const addStar = async (name: string) => {
    return new Promise<VideoStar>(resolve => {
      videoService.addStar(video.id, name).then(({ data }) => {
        resolve({ ...data, name })
      })
    })
  }

  const handleClick = async () => {
    for await (const star of relatedStars) {
      stars = [...stars, await addStar(star.name)]
    }

    update(stars)
  }

  return (
    <div style={{ width: '100%' }} className='text-center'>
      <Button size='small' variant='outlined' color='primary' onClick={() => void handleClick()}>
        Add Related Stars ({relatedStars.length})
      </Button>
    </div>
  )
}

type RemoveUnusedStarsProps = {
  video: Video
  bookmarks: Bookmark[]
  stars: VideoStar[]
  disabled: boolean
  update: SetState<VideoStar[]>
}
const RemoveUnusedStars = ({ video, bookmarks, stars, disabled, update }: RemoveUnusedStarsProps) => {
  if (disabled || !stars.some(star => bookmarks.every(bookmark => bookmark.starID !== star.id))) {
    return null
  }

  const handleClick = () => {
    update(
      stars.filter(star => {
        if (bookmarks.some(bookmark => bookmark.starID === star.id)) {
          return true
        } else {
          videoService.removeStar(video.id, star.id).catch(() => {
            throw new Error('Cannot remove star' + star.name)
          })

          return false
        }
      })
    )
  }

  return (
    <div style={{ width: '100%' }} className='text-center'>
      <Button size='small' variant='outlined' color='primary' onClick={handleClick}>
        Remove Unused Stars
      </Button>
    </div>
  )
}

type FranchiseProps = {
  video: Video
}
const Franchise = ({ video }: FranchiseProps) => {
  if (video.related.length === 1) return null

  return (
    <div id={styles.franchise}>
      {video.related.map(v => (
        <a href={`/video/${v.id}`} key={v.id}>
          <Grid container component={Card} className={styles.episode}>
            <Grid component={CardContent}>
              <Typography>{v.plays} plays</Typography>
            </Grid>

            <Grid item xs={2} className={styles.thumbnail}>
              <ResponsiveImage
                src={`${serverConfig.api}/video/${v.id}/thumb`}
                width={90}
                height={130}
                missing={v.image === null}
                alt='video'
                sizes={`${(((100 / 12) * 3) / 12) * 2}vw`}
              />
            </Grid>

            <Grid className={styles.title}>{v.name}</Grid>
          </Grid>
        </a>
      ))}
    </div>
  )
}

type AttributesProps = {
  video: Video
  bookmarks: Bookmark[]
  clearActive: () => void
  update: SetState<Bookmark[]>
  getAttributes: () => Attribute[]
}
const Attributes = ({ video, bookmarks, clearActive, update, getAttributes }: AttributesProps) => {
  const attribute_setActive = (attribute: Attribute) => {
    update(
      bookmarks.map(bookmark => {
        if (bookmark.attributes.some(bookmarkAttribute => bookmarkAttribute.id === attribute.id)) bookmark.active = true

        return bookmark
      })
    )
  }

  const removeAttribute = (attribute: Attribute) => {
    videoService.removeAttribute(video.id, attribute.id).then(() => {
      update(
        bookmarks.map(bookmark => ({
          ...bookmark,
          attributes: bookmark.attributes.filter(attributeItem => attributeItem.id !== attribute.id)
        }))
      )
    })
  }

  return (
    <Grid container justifyContent='center' id={styles.attributes}>
      {getAttributes().map(attribute => (
        <Fragment key={attribute.id}>
          <ContextMenuTrigger id={`attribute-${attribute.id}`}>
            <Button
              size='small'
              variant='outlined'
              color='primary'
              className={styles.attribute}
              onMouseEnter={() => attribute_setActive(attribute)}
              onMouseLeave={clearActive}
            >
              {attribute.name}
            </Button>
          </ContextMenuTrigger>

          <ContextMenu id={`attribute-${attribute.id}`}>
            <MenuItem onClick={() => removeAttribute(attribute)}>
              <Icon code='trash' /> Remove
            </MenuItem>
          </ContextMenu>
        </Fragment>
      ))}
    </Grid>
  )
}

type OutfitProps = {
  bookmarks: Bookmark[]
  clearActive: () => void
  update: SetState<Bookmark[]>
}
const Outfits = ({ bookmarks, clearActive, update }: OutfitProps) => {
  const getOutfits = () => [
    ...new Set(bookmarks.filter(bookmark => bookmark.outfit !== null).map(bookmark => bookmark.outfit))
  ]

  const outfit_setActive = (outfit: string) => {
    update(
      bookmarks.map(bookmark => {
        if (bookmark.outfit === outfit) {
          bookmark.active = true
        }

        return bookmark
      })
    )
  }

  return (
    <Grid container justifyContent='center' id={styles.outfits}>
      {getOutfits().map(outfit => {
        if (outfit === null) return null

        return (
          <Button
            key={outfit}
            size='small'
            variant='outlined'
            color='primary'
            className={styles.outfit}
            onMouseEnter={() => outfit_setActive(outfit)}
            onMouseLeave={clearActive}
          >
            {outfit}
          </Button>
        )
      })}
    </Grid>
  )
}

export default VideoPage
