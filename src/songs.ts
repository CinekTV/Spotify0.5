export type Song = {
    songname: string,
    artist1: string,
    artist2: string | null,
    artist3: string | null,
    artist4: string | null,
    artist5: string | null,
    length: number,
    image: string,
}

export type Playlist = {
    name: string,
    image: string,
    link: string
}