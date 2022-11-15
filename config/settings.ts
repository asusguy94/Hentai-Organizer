export default {
  timeline: {
    offset: 0.88,
    spacing: 2
  },
  maxDurationDiff: 1,
  thumbnails: true,
  qualities: [1080, 720, 480, 360],
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290')
}
