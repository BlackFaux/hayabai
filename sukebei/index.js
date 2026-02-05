export default new class Sukebei {
  base = 'https://nyaaapi.onrender.com/sukebei?sub_category=anime&category=art&q=';

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }
  batch = this.single
  movie = this.single

  async search(title, episode) {
    const query = title.replace(/[^\w\s-]/g, ' ').trim()
    let episodeQuery = `${query} ${episode.toString().padStart(2, '0')}`

    const episodeResponse = await fetch(this.base + encodeURIComponent(episodeQuery));
    const episodeResults = await this.filterSeedless(episodeResponse, 'high');
    const genericResponse = await fetch(this.base + encodeURIComponent(query));
    const genericResults = await this.filterSeedless(genericResponse, 'medium');
    return [...episodeResults, ...genericResults];
  }

  async filterSeedless(response, accuracy, firstTitle) {
    const data = (await response.json())?.data
    if (!Array.isArray(data)) return []

    return data.filter(item => item.seeders).map(item => ({
      title: item.title,
      link: item.magnet || item.torrent,
      hash: item.magnet?.match(/btih:([A-Fa-f0-9]+)/)?.[1] || '',
      seeders: item.seeders,
      leechers: item.leechers,
      downloads: item.downloads,
      size: this.calculateSize(item.size),
      date: new Date(item.time),
      accuracy,
      type: accuracy === 'high' ? 'best' : undefined
    }));
  }

  calculateSize(itemSize) {
    const sizeComponents = itemSize.split(' ');
    const sizeNumber = parseFloat(sizeComponents[0]);
    const sizeType = sizeComponents[1];
    switch (sizeType) {
      case 'MiB':
        return Math.floor(sizeNumber * 1048576);
      case 'GiB':
        return Math.floor(sizeNumber * 1073741824);
      default:
        return 0;
    }
  }

  async test() {
    const res = await fetch(this.base)
    return res.ok
  }
}();
