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

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import axios from 'axios'
import { Flipped, Flipper } from 'react-flip-toolkit'

import { ImageCard, ResponsiveImage } from '@components/image'
import Modal, { IModal, IModalHandler, useModal } from '@components/modal'
import { Header, Player, Timeline } from '@components/video'
import Icon from '@components/icon'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Link from '@components/link'

import useStarEvent, { type IEvent, type IEventData, type IEventHandler } from '@hooks/star-event'
import { attributeApi, categoryApi, videoApi } from '@api'
import { serverConfig } from '@config'
import { IAttribute, IBookmark, ICategory, ISetState, IVideoStar as IStar, IVideo, IGeneral } from '@interfaces'

import styles from './video.module.scss'

const VideoPage: NextPage = () => {
  const { query } = useRouter()

  const [video, setVideo] = useState<IVideo>()
  const [stars, setStars] = useState<IStar[]>([])
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [attributes, setAttributes] = useState<IAttribute[]>([])

  const { modal, setModal } = useModal()
  const { setEvent, getEvent, getDefault } = useStarEvent()

  useEffect(() => {
    if (typeof query.id === 'string') {
      const videoID = parseInt(query.id)

      // TODO seems like these requests are too fast? grouping them togheter fixes the issue
      // self-executing async does not solve the issue, becuse setState is not async
      Promise.all([
        categoryApi.getAll().then(({ data }) => setCategories(data)),
        attributeApi.getVideos().then(({ data }) => setAttributes(data)),
        videoApi.get(videoID).then(({ data }) => setVideo(data)),
        videoApi.getStars(videoID).then(({ data }) => setStars(data)),
        videoApi.getBookmarks(videoID).then(({ data }) => {
          setBookmarks(data.map(bookmark => ({ ...bookmark, active: false })))
        })
      ])
    }
  }, [query.id])

  return (
    <Grid container>
      {video !== undefined && (
        <>
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
        </>
      )}

      <Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </Modal>
    </Grid>
  )
}

interface SectionProps {
  video: IVideo
  bookmarks: IBookmark[]
  categories: ICategory[]
  attributes: IAttribute[]
  stars: IStar[]
  update: {
    stars: ISetState<IStar[]>
    bookmarks: ISetState<IBookmark[]>
    video: ISetState<IVideo | undefined>
  }
  modal: {
    handler: IModalHandler
    data: IModal
  }
  setStarEvent: IEventHandler
}
const Section = ({ video, bookmarks, categories, attributes, stars, update, modal, setStarEvent }: SectionProps) => {
  // const [playerRef, ref] = useRefWithEffect()
  const [duration, setDuration] = useState(0)
  const plyrRef = useRef<HTMLVideoElement>()

  // Helper script for getting the player
  const getPlayer = () => plyrRef.current

  const playVideo = (time: number | null = null) => {
    const player = getPlayer()

    if (player !== undefined) {
      if (time === null) time = player.currentTime
      player.currentTime = Number(time)
      player.play()
    }
  }

  const setTime = (bookmarkID: number) => {
    if (plyrRef.current !== undefined) {
      const time = Math.round(plyrRef.current.currentTime)

      axios.put(`${serverConfig.api}/bookmark/${bookmarkID}`, { time }).then(() => {
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

  return (
    <Grid item xs={9}>
      <Header video={video} update={update.video} onModal={modal.handler} />

      <Player
        plyrRef={plyrRef}
        video={video}
        bookmarks={bookmarks}
        categories={categories}
        stars={stars}
        update={{ video: update.video, bookmarks: update.bookmarks }}
        updateDuration={setDuration}
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
        duration={duration}
        onModal={modal.handler}
        setStarEvent={setStarEvent}
      />
    </Grid>
  )
}

interface SidebarProps {
  video: IVideo
  stars: IStar[]
  bookmarks: IBookmark[]
  attributes: IAttribute[]
  categories: ICategory[]
  update: {
    stars: ISetState<IStar[]>
    bookmarks: ISetState<IBookmark[]>
    video: ISetState<IVideo | undefined>
  }
  onModal: IModalHandler
  starEvent: { getEvent: IEvent; getDefault: IEventData; setEvent: IEventHandler }
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
    const attributeArr: IAttribute[] = []
    bookmarks.forEach(({ attributes }) => {
      attributes
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(attribute => {
          if (!attributeArr.some(attr => attr.id === attribute.id)) attributeArr.push(attribute)
        })
    })

    return attributeArr
  }

  return (
    <Grid item xs={3} id={styles.sidebar}>
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

interface StarsProps {
  video: IVideo
  stars: IStar[]
  bookmarks: IBookmark[]
  attributes: IAttribute[]
  categories: ICategory[]
  clearActive: () => void
  update: {
    stars: ISetState<IStar[]>
    bookmarks: ISetState<IBookmark[]>
  }
  onModal: IModalHandler
  starEvent: { getEvent: IEvent; getDefault: IEventData; setEvent: IEventHandler }
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
    axios.delete(`${serverConfig.api}/video/${video.id}/star/${id}`).then(() => {
      update.stars([...stars].filter(star => star.id !== id))
    })
  }

  useEffect(() => {
    update.stars(
      [...stars].sort((a, b) => {
        const bookmarkTime = (star: IStar) => bookmarks.find(bookmark => bookmark.starID === star.id)?.start ?? Infinity

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

interface StarProps {
  video: IVideo
  star: IStar
  bookmarks: IBookmark[]
  attributes: IAttribute[]
  categories: ICategory[]
  clearActive: () => void
  update: ISetState<IBookmark[]>
  removeStar: (id: number) => void
  onModal: IModalHandler
  starEvent: {
    getEvent: IEvent
    setEvent: IEventHandler
    getDefault: IEvent['data']
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

  const handleRibbon = (star: IStar) => {
    const hasBookmark = bookmarks.some(bookmark => bookmark.starID === star.id)

    if (hasBookmark) return null

    return <Ribbon label='NEW' />
  }

  const addBookmark = (category: ICategory, star: IStar) => {
    const player = document.getElementsByTagName('video')[0]

    const time = Math.round(player.currentTime)
    if (time) {
      axios
        .post(`${serverConfig.api}/video/${video.id}/bookmark`, {
          categoryID: category.id,
          time,
          starID: star.id
        })
        .then(({ data }) => {
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

  const addAttribute = (star: IStar, attribute: IAttribute) => {
    axios
      .post(`${serverConfig.api}/bookmark/attribute`, {
        videoID: video.id,
        starID: star.id,
        attributeID: attribute.id
      })
      .then(() => {
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

  const setActive = (star: IStar) => {
    update(
      bookmarks.map(bookmark => {
        if (bookmark.starID === star.id) bookmark.active = true

        return bookmark
      })
    )
  }

  // TODO auto-run if only 1 star
  const addStar = (star: IStar) => {
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
          axios
            .post(`${serverConfig.api}/bookmark/${bookmark.id}/star`, {
              starID: star.id
            })
            .then(() => {
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
        <ContextMenuTrigger id={`star-${star.id}`} holdToDisplay={-1}>
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

interface StarInputProps {
  video: IVideo
  stars: IStar[]
  bookmarks: IBookmark[]
  getAttributes: () => IAttribute[]
  update: {
    video: ISetState<IVideo | undefined>
    stars: ISetState<IStar[]>
  }
}
const StarInput = ({ video, stars, bookmarks, getAttributes, update }: StarInputProps) => {
  const [input, setInput] = useState('')
  const [noStarToggle, setNoStarToggle] = useState(false)

  const handleNoStar = (checked: boolean) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { noStar: checked }).then(({ data }) => {
      update.video({ ...video, noStar: data.noStar })
    })
  }

  const addStar = (name: string) => {
    if (input.length) {
      axios.post(`${serverConfig.api}/video/${video.id}/star`, { name }).then(({ data }) => {
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

interface AddRelatedStarsProps {
  video: IVideo
  stars: any[]
  disabled: boolean
  update: ISetState<IStar[]>
}
const AddRelatedStars = ({ video, stars, disabled, update }: AddRelatedStarsProps) => {
  const [relatedStars, setRelatedStars] = useState<IGeneral[]>([])

  useEffect(() => {
    axios.get(`${serverConfig.api}/video/${video.id}/related/star`).then(({ data }) => {
      setRelatedStars(data)
    })
  }, [video])

  if (disabled || relatedStars.length === 0) return null

  const addStar = async (name: string) => {
    return new Promise(resolve => {
      axios.post(`${serverConfig.api}/video/${video.id}/star`, { name }).then(({ data }) => {
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

interface RemoveUnusedStarsProps {
  video: IVideo
  bookmarks: IBookmark[]
  stars: IStar[]
  disabled: boolean
  update: ISetState<IStar[]>
}
const RemoveUnusedStars = ({ video, bookmarks, stars, disabled, update }: RemoveUnusedStarsProps) => {
  if (disabled || !stars.some(star => bookmarks.every(bookmark => bookmark.starID !== star.id))) {
    return null
  }

  const handleClick = () => {
    update(
      stars.filter(star => {
        if (bookmarks.some(bookmark => bookmark.starID === star.id)) {
          return star
        } else {
          axios.delete(`${serverConfig.api}/video/${video.id}/star/${star.id}`).catch(() => {
            throw new Error('Cannot remove star' + star.name)
          })

          return null
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

interface FranchiseProps {
  video: IVideo
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
              />
            </Grid>

            <Grid className={styles.title}>{v.name}</Grid>
          </Grid>
        </a>
      ))}
    </div>
  )
}

interface AttributesProps {
  video: IVideo
  bookmarks: IBookmark[]
  clearActive: () => void
  update: ISetState<IBookmark[]>
  getAttributes: () => IAttribute[]
}
const Attributes = ({ video, bookmarks, clearActive, update, getAttributes }: AttributesProps) => {
  const attribute_setActive = (attribute: IAttribute) => {
    update(
      bookmarks.map(bookmark => {
        if (bookmark.attributes.some(bookmarkAttribute => bookmarkAttribute.id === attribute.id)) bookmark.active = true

        return bookmark
      })
    )
  }

  const removeAttribute = (attribute: IAttribute) => {
    axios.delete(`${serverConfig.api}/video/${video.id}/attribute/${attribute.id}`).then(() => {
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

interface OutfitProps {
  bookmarks: IBookmark[]
  clearActive: () => void
  update: ISetState<IBookmark[]>
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
