export default {
  qualities: [1080, 720, 480, 360],
  timeline: {
    offset: parseFloat(process.env.NEXT_PUBLIC_TIMELINE_OFFSET ?? '1'),
    spacing: parseFloat(process.env.NEXT_PUBLIC_TIMELINE_SPACING ?? '0')
  },
  player: {
    maxDurationDiff: parseInt(process.env.NEXT_PUBLIC_PLAYER_DURATIONDIFF ?? '1'),
    thumbnails: process.env.NEXT_PUBLIC_PLAYER_THUMBNAILS === 'true'
  },
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290')
}
