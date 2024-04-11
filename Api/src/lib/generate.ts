function generateTitle(franchise: string, episode: number) {
  return `${franchise} Episode ${episode}`
}

function generateEpisode(slug: string) {
  // check if episode is (bonus|special|extra)-episode
  const episodeString = slug.match(/-(\d+)$/)?.at(1)
  if (episodeString !== undefined) {
    return parseInt(episodeString)
  }

  return -1
}

export default function generate(path: string, slug: string, franchise: string) {
  //FIXME currently defaults to -1 for bonus episodes or episodes without numbers
  // defaulting to "1" would solve the issue, but might cause duplicate episodes
  // it would also mark every bonus episode as "1"
  //get franchise as a slug (avaliable from api), and then split, probably the best solution

  const episodeNumber = generateEpisode(slug)
  const episodeName = generateTitle(franchise, episodeNumber)

  return {
    path,
    franchise,
    name: episodeName,
    episode: episodeNumber
  }
}
