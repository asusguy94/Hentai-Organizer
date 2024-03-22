import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Button,
  Card,
  CardMedia,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography
} from '@mui/material'

import { Link, createFileRoute } from '@tanstack/react-router'
import { MediaPlayerInstance } from '@vidstack/react'
import { motion } from 'framer-motion'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import { IconWithText } from '@/components/icon'
import MissingImage from '@/components/image/missing'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'
import { Header, Player, Timeline } from '@/components/video'

import { serverConfig } from '@/config'
import ActiveContextProvider, { useActiveContext } from '@/context/activeContext'
import { useModalContext } from '@/context/modalContext'
import StarEventContextProvider, { useStarEventContext } from '@/context/starEventContext'
import { Attribute, Bookmark, Category, SetState, Video, VideoStar } from '@/interface'
import { attributeService, bookmarkService, categoryService, videoService } from '@/service'
import { escapeRegExp, getUnique } from '@/utils'

import styles from './video.module.scss'

export const Route = createFileRoute('/video/$videoId')({
  parseParams: ({ videoId }) => ({ videoId: parseInt(videoId) }),
  component: VideoPage
})

function VideoPage() {
  const { videoId } = Route.useParams()

  const { data: stars } = videoService.useStars(videoId)
  const { data: categories } = categoryService.useAll()
  const { data: attributes } = attributeService.useVideos()
  const { data: video } = videoService.useVideo(videoId)
  const { data: bookmarks } = videoService.useBookmarks(videoId)

  if (
    attributes === undefined ||
    categories === undefined ||
    stars === undefined ||
    video === undefined ||
    bookmarks === undefined
  )
    return <Spinner />

  return (
    <Grid container>
      <ActiveContextProvider>
        <StarEventContextProvider>
          <Section video={video} bookmarks={bookmarks} categories={categories} attributes={attributes} stars={stars} />

          <Sidebar video={video} stars={stars} bookmarks={bookmarks} attributes={attributes} categories={categories} />
        </StarEventContextProvider>
      </ActiveContextProvider>
    </Grid>
  )
}

type SectionProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: Category[]
  attributes: Attribute[]
  stars: VideoStar[]
}
function Section({ video, bookmarks, categories, attributes, stars }: SectionProps) {
  const playerRef = useRef<MediaPlayerInstance>(null)

  return (
    <Grid item xs={9} component='section'>
      <Header video={video} />

      <Player playerRef={playerRef} video={video} bookmarks={bookmarks} categories={categories} stars={stars} />

      <Timeline
        video={video}
        bookmarks={bookmarks}
        stars={stars}
        attributes={attributes}
        categories={categories}
        playerRef={playerRef}
      />
    </Grid>
  )
}

type SidebarProps = {
  video: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  attributes: Attribute[]
  categories: Category[]
}
function Sidebar({ video, stars, bookmarks, attributes, categories }: SidebarProps) {
  const { setActive } = useActiveContext()

  const filteredAttributes = useMemo(
    () =>
      getUnique(
        bookmarks.flatMap(({ attributes }) => attributes.sort((a, b) => a.name.localeCompare(b.name))),
        'id'
      ),
    [bookmarks]
  )

  return (
    <Grid item xs={3} id={styles.sidebar} component='aside'>
      <Grid container justifyContent='center' style={{ marginTop: 6, marginBottom: 18 }}>
        {/* <HeaderNetwork video={video} update={update} /> */}

        <div style={{ height: 30 }}></div>
      </Grid>

      <Franchise video={video} />

      <Grid container justifyContent='center'>
        <Stars video={video} stars={stars} bookmarks={bookmarks} attributes={attributes} categories={categories} />
      </Grid>

      <StarInput video={video} stars={stars} bookmarks={bookmarks} attributes={filteredAttributes} />

      <Attributes attributes={filteredAttributes} setActive={setActive.attribute} />

      <Outfits bookmarks={bookmarks} setActive={setActive.outfit} />
    </Grid>
  )
}

type StarsProps = {
  video: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  attributes: Attribute[]
  categories: Category[]
}
function Stars({ video, stars, bookmarks, attributes, categories }: StarsProps) {
  const { setActive } = useActiveContext()

  const sortedStars = useMemo(() => {
    const bookmarkTime = (star: VideoStar) => {
      return bookmarks.find(bookmark => bookmark.starID === star.id)?.start ?? Infinity
    }

    return stars.toSorted((a, b) => bookmarkTime(a) - bookmarkTime(b))
  }, [bookmarks, stars])

  return (
    <Grid container justifyContent='center' id={styles.stars}>
      {sortedStars.map(star => (
        <Star
          key={star.id}
          video={video}
          star={star}
          bookmarks={bookmarks}
          attributes={attributes}
          categories={categories}
          setActive={setActive.star}
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
  setActive: SetState<VideoStar | null>
}
function Star({ video, star, bookmarks, attributes, categories, setActive }: StarProps) {
  const [border, setBorder] = useState(false)
  const { mutate: mutateAddBookmark } = videoService.useAddBookmark(video.id)
  const { mutate: mutateAddStar } = bookmarkService.useAddStar(video.id)
  const { mutate: mutateAddStarAttribute } = bookmarkService.useAddStarAttribute(video.id, star.id)
  const { mutate: mutateRemoveStar } = videoService.useRemoveStar(video.id)

  const { getEvent, getDefault, setEvent } = useStarEventContext()
  const { setModal } = useModalContext()

  const removeStar = () => {
    mutateRemoveStar({ starID: star.id })
  }

  const addBookmark = (category: Category, star: VideoStar) => {
    const player = document.getElementsByTagName('video')[0]

    const time = Math.round(player.currentTime)
    if (time) {
      mutateAddBookmark({
        categoryID: category.id,
        time,
        starID: star.id
      })
    }
  }

  const addAttribute = (attribute: Attribute) => {
    mutateAddStarAttribute({ attributeID: attribute.id })
  }

  // TODO auto-run if only 1 star
  const addStar = (star: VideoStar) => {
    const bookmark = getEvent.data

    // Remove Border
    setBorder(false)
    setEvent(false, getDefault)

    // Check if bookmark already contains one of the attributes from the star
    const bookmarkItem = bookmarks.find(item => item.id === bookmark.id)
    if (bookmarkItem !== undefined) {
      const overlappingAttributes = bookmarkItem.attributes.some(attr => {
        return star.attributes.some(sAttr => sAttr.id === attr.id)
      })

      // Bookmark has ZERO Overlapping Attributes
      if (!overlappingAttributes) {
        // Request Bookmark Update
        mutateAddStar({ id: bookmark.id, starID: star.id })
      }
    }
  }

  const commonAttributes = useMemo(() => {
    const starBookmarks = bookmarks.filter(b => b.starID === star.id)
    const attributeIds = starBookmarks.map(bookmark => bookmark.attributes.map(attribute => attribute.id))
    const commonAttributeIds = attributeIds.reduce(
      (common, ids) => common.filter(id => ids.includes(id)),
      attributeIds.shift() ?? []
    )

    return commonAttributeIds
  }, [bookmarks, star.id])

  const isMissing = star.image === null
  return (
    <Grid
      item
      xs={4}
      onClick={getEvent.event ? () => addStar(star) : undefined}
      onMouseEnter={getEvent.event ? () => setBorder(true) : () => setActive(star)}
      onMouseLeave={getEvent.event ? () => setBorder(false) : () => setActive(null)}
    >
      <motion.div layoutId={star.id.toString()}>
        <ContextMenuTrigger id={`star-${star.id}`}>
          <RibbonContainer component={Card} className={`${styles.star} ${border ? styles.active : ''}`}>
            <CardMedia style={isMissing ? { height: 200 } : {}}>
              {isMissing ? (
                <MissingImage renderStyle='transform' scale={5} />
              ) : (
                <img
                  src={`${serverConfig.newApi}/star/${star.id}/image`}
                  alt='star'
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </CardMedia>

            <Link to='/star/$starId' params={{ starId: star.id }}>
              <Typography>{star.name}</Typography>
            </Link>

            {bookmarks.every(bookmark => bookmark.starID !== star.id) && <Ribbon label='NEW' />}
          </RibbonContainer>
        </ContextMenuTrigger>

        <ContextMenu id={`star-${star.id}`}>
          <IconWithText
            component={ContextMenuItem}
            icon='add'
            text='Add Bookmark'
            onClick={() => {
              setActive(null)
              setModal(
                'Add Bookmark',
                categories.map(category => (
                  <Button
                    key={category.id}
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      setModal()
                      addBookmark(category, star)
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
            icon='add'
            text='Add Attribute'
            disabled={bookmarks.every(bookmark => bookmark.starID !== star.id)}
            onClick={() => {
              setActive(null)
              setModal(
                'Add Attribute',
                attributes
                  .filter(attribute => !commonAttributes.includes(attribute.id))
                  .map(attribute => (
                    <Button
                      key={attribute.id}
                      variant='outlined'
                      color='primary'
                      onClick={() => {
                        setModal()
                        addAttribute(attribute)
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
            text='Remove'
            disabled={bookmarks.some(bookmark => bookmark.starID === star.id)}
            onClick={removeStar}
          />
        </ContextMenu>
      </motion.div>
    </Grid>
  )
}

type StarInputProps = {
  video: Video
  stars: VideoStar[]
  bookmarks: Bookmark[]
  attributes: Attribute[]
}
function StarInput({ video, stars, bookmarks, attributes }: StarInputProps) {
  const [input, setInput] = useState('')
  const [noStarToggle, setNoStarToggle] = useState(false)
  const { mutate } = videoService.useAddStar(video.id)

  useEffect(() => {
    setNoStarToggle(video.noStar)
  }, [video.noStar])

  const handleNoStar = (checked: boolean) => {
    videoService.toggleNoStar(video.id, checked).then(() => {
      location.reload()
    })
  }

  const addStar = (name: string) => {
    if (input.length > 0) {
      mutate({ name })
    }
  }

  return (
    <Grid container justifyContent='center'>
      {stars.length > 0 && <Divider sx={{ opacity: 0.6 }} />}

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
                ;(e.target as HTMLInputElement).blur()
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
                onChange={(_e, checked) => {
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
        <AddRelatedStars video={video} disabled={bookmarks.length > 0 || stars.length > 0 || noStarToggle} />

        <RemoveUnusedStars bookmarks={bookmarks} stars={stars} disabled={stars.length === 0} video={video} />
      </Grid>

      {attributes.length > 0 && <Divider sx={{ opacity: 0.6 }} />}
    </Grid>
  )
}

type AddRelatedStarsProps = {
  video: Video
  disabled: boolean
}
function AddRelatedStars({ video, disabled }: AddRelatedStarsProps) {
  const { data: relatedStars } = videoService.useRelatedStars(video.id)
  const { mutateAll } = videoService.useAddStar(video.id)

  if (disabled || relatedStars === undefined || relatedStars.length === 0) return null

  const handleClick = () => {
    mutateAll(relatedStars.map(star => ({ name: star.name })))
  }

  return (
    <div style={{ width: '100%' }} className='text-center'>
      <Button size='small' variant='outlined' color='primary' onClick={handleClick}>
        Add Related Stars ({relatedStars.length})
      </Button>
    </div>
  )
}

type RemoveUnusedStarsProps = {
  bookmarks: Bookmark[]
  stars: VideoStar[]
  video: Video
  disabled: boolean
}
function RemoveUnusedStars({ video, bookmarks, stars, disabled }: RemoveUnusedStarsProps) {
  const { mutateAll } = videoService.useRemoveStar(video.id)

  if (disabled || stars.every(star => bookmarks.some(bookmark => bookmark.starID === star.id))) {
    return null
  }

  const handleClick = () => {
    mutateAll(
      stars.filter(star => bookmarks.every(bookmark => bookmark.starID !== star.id)).map(star => ({ starID: star.id }))
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
function Franchise({ video }: FranchiseProps) {
  if (video.related.length === 1) return null

  return (
    <div id={styles.franchise}>
      {video.related.map(v => (
        <a href={`/video/${v.id}`} key={v.id}>
          <Grid container component={Card} className={styles.episode}>
            <Grid item xs={2} className={styles.thumbnail} justifyContent='center'>
              {v.image === null ? (
                <MissingImage />
              ) : (
                <img
                  src={`${serverConfig.newApi}/video/${v.id}/cover`}
                  style={{ width: '100%', height: '100%' }}
                  alt='video'
                />
              )}
            </Grid>

            <Grid className={styles.title}>
              {v.name.replace(new RegExp(`^${escapeRegExp(video.franchise)}\\s`), '')}
            </Grid>
          </Grid>
        </a>
      ))}
    </div>
  )
}

type AttributesProps = {
  attributes: Attribute[]
  setActive: SetState<Attribute | null>
}
function Attributes({ attributes, setActive }: AttributesProps) {
  return (
    <Grid container justifyContent='center' id={styles.attributes}>
      {attributes.map(attribute => (
        <Button
          key={attribute.id}
          size='small'
          variant='outlined'
          color='primary'
          className={styles.attribute}
          onMouseEnter={() => setActive(attribute)}
          onMouseLeave={() => setActive(null)}
        >
          {attribute.name}
        </Button>
      ))}
    </Grid>
  )
}

type OutfitProps = {
  bookmarks: Bookmark[]
  setActive: SetState<string | null>
}
function Outfits({ bookmarks, setActive }: OutfitProps) {
  const outfits = getUnique(bookmarks.flatMap(bookmark => (bookmark.outfit !== null ? [bookmark.outfit] : [])))

  return (
    <Grid container justifyContent='center' id={styles.outfits}>
      {outfits.map(outfit => (
        <Button
          key={outfit}
          size='small'
          variant='outlined'
          color='primary'
          className={styles.outfit}
          onMouseEnter={() => setActive(outfit)}
          onMouseLeave={() => setActive(null)}
        >
          {outfit}
        </Button>
      ))}
    </Grid>
  )
}
