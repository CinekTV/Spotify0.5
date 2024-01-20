let songlist: object;
let song_display = document.getElementById("song-display") as HTMLElement;

interface MusicItem {
  title: string;
  filePath: string;
}

interface PlaybackStrategy {
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  previous(): void;
  setLoop(isLooping: boolean): void;
  setRandom(isRandom: boolean): void;
  setVolume(volume: number): void;
}

interface Observer {
  update(): void;
}

interface MusicDecorator {
  decorate(): void;
}

interface MusicCommand {
  execute(): void;
}

interface MusicState {
  changeState(): void;
}


class PlayingState implements MusicState {
  changeState(): void {
    console.log("Music is currently playing.");
  }
}

class PausedState implements MusicState {
  changeState(): void {
    console.log("Music is currently paused.");
  }
}

class StoppedState implements MusicState {
  changeState(): void {
    console.log("Music is currently stopped.");
  }
}


class DefaultPlaybackStrategy implements PlaybackStrategy {

  constructor() {
    // ... Existing code
    this.setVolume(this.volume);
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume / 100;
    }
  }

  private audio: HTMLAudioElement | null = null;
  private playbackPosition: number = 0;
  private isPlaying: boolean = false;
  private currentSongIndex: number = 0;
  private volume: number = 100; // Default volume

  private isLooping: boolean = false;
  private isRandom: boolean = false;

  setLoop(isLooping: boolean): void {
    this.isLooping = isLooping;
  }

  setRandom(isRandom: boolean): void {
    this.isRandom = isRandom;
    musicPlayer.setRandom(isRandom); // Synchronize with MusicPlayer
  }

  play(): void {
    if (!this.isPlaying) {
      const song = this.getCurrentSong();
      if (song) {
        this.playLoadedSong(song);
        musicPlayer.changeState(new PlayingState());
        this.decorate();
      }
    } else {
      console.log("Already playing a song.");
    }
  }

  pause(): void {
    if (this.isPlaying && this.audio) {
      this.audio.pause();
      this.playbackPosition = this.audio.currentTime;
      this.isPlaying = false;
      console.log("Pausing...");
      musicPlayer.changeState(new PausedState());
      this.decorate();
    } else {
      console.log("No song is currently playing.");
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playbackPosition = 0;
      this.isPlaying = false;
      console.log("Stopping...");
      musicPlayer.changeState(new StoppedState());
      this.decorate();
    } else {
      console.log("No song is currently playing.");
    }
  }

  next(): void {
    this.stop();
    const playlist = musicPlayer.getPlaylist();
    if (playlist.length > 0) {
        if (musicPlayer.isRandom) {
            this.playRandomSong(playlist);
        } else {
            if (musicPlayer.isLooping) {
                this.currentSongIndex = (this.currentSongIndex + 1) % playlist.length;
            } else {
                this.currentSongIndex = Math.min(this.currentSongIndex + 1, playlist.length - 1);
            }
            const nextSong = playlist[this.currentSongIndex];
            this.playLoadedSong(nextSong);
        }
    } else {
        console.log("Playlist is empty.");
    }
}


previous(): void {
    this.stop();
    const playlist = musicPlayer.getPlaylist();
    if (playlist.length > 0) {
        if (musicPlayer.isRandom) {
            this.playRandomSong(playlist);
        } else {
            // Move to the previous song in the playlist
            if (musicPlayer.isLooping) {
                this.currentSongIndex = (this.currentSongIndex - 1 + playlist.length) % playlist.length;
            } else {
                this.currentSongIndex = Math.max(this.currentSongIndex - 1, 0);
            }
            const previousSong = playlist[this.currentSongIndex];
            this.playLoadedSong(previousSong);
        }
    } else {
        console.log("Playlist is empty.");
    }
}

  playRandomSong(playlist: MusicItem[]): void {
    const randomIndex = Math.floor(Math.random() * playlist.length);
    this.currentSongIndex = randomIndex;
    const randomSong = playlist[randomIndex];
    this.playLoadedSong(randomSong);
}

  private async playLoadedSong(song: MusicItem): Promise<void> {
    try {
      this.audio = new Audio(song.filePath);

      if (this.playbackPosition > 0) {
        this.audio.currentTime = this.playbackPosition;
      }

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.next();
      });

      await this.audio.play();
      console.log(`Playing: ${song.title}`);
    } catch (error) {
      console.error(`Error playing the song: ${song.title}`, error);
      this.isPlaying = false;
    }
  }

  private getCurrentSong(): MusicItem | null {
    const playlist = musicPlayer.getPlaylist();
    if (playlist.length > 0) {
      return playlist[this.currentSongIndex];
    } else {
      console.log("Playlist is empty.");
      return null;
    }
  }

  private decorate(): void {
    musicPlayer.getDecorators().forEach(decorator => decorator.decorate());
  }
}

class DefaultMusicState implements MusicState {
  changeState(): void {
    console.log("Changing state...");
  }
}

class SongNameDisplayDecorator implements MusicDecorator {
  private musicPlayer: MusicPlayer;

  constructor(musicPlayer: MusicPlayer) {
    this.musicPlayer = musicPlayer;
  }

  decorate(): void {
    const currentSong = this.musicPlayer.getPlaylist()[this.musicPlayer.getCurrentSongIndex()];
    console.log(`Current Song: ${currentSong ? currentSong.title : 'No song playing'}`);
  }
}



class MusicPlayer {
  private static instanceCount: number = 0;
  private static instance: MusicPlayer | null = null;
  private currentStrategy: PlaybackStrategy;
  private observers: Observer[] = [];
  private decorators: MusicDecorator[] = [];
  private state: MusicState;
  private playlist: MusicItem[] = [];
  private currentSongIndex: number = 0;
  

  isPlaying: boolean = false;
  isLooping: boolean = true;
  isRandom: boolean = false;

  public isSongPlaying(): boolean {
    return this.isPlaying;
  }
  public async loadAndPlaySong(song: MusicItem): Promise<void> {
    try {
      const audio = new Audio(song.filePath);

      audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      audio.addEventListener('ended', () => {
        this.isPlaying = false;
      });

      await audio.play();
      console.log(`Playing: ${song.title}`);
    } catch (error) {
      console.error(`Error playing the song: ${song.title}`, error);
    }
  }

  public static getInstanceCount(): number {
    return MusicPlayer.instanceCount;
  }

  private constructor() {
    MusicPlayer.instanceCount++;
    this.currentStrategy = new DefaultPlaybackStrategy();
    this.state = new DefaultMusicState();
    this.state = new StoppedState();
  }

  public static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  public setPlaybackStrategy(strategy: PlaybackStrategy): void {
    this.currentStrategy = strategy;
  }

  public registerObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public unregisterObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notifyObservers(): void {
    this.observers.forEach(observer => observer.update());
  }

  public play(): void {
    this.currentStrategy.play();
    this.notifyObservers();
  }

  public pause(): void {
    this.currentStrategy.pause();
    this.notifyObservers();
  }

  public stop(): void {
    this.currentStrategy.stop();
    this.notifyObservers();
  }

  public next(): void {
    this.currentStrategy.next();
    this.notifyObservers();
  }

  public previous(): void {
    this.currentStrategy.previous();
    this.notifyObservers();
  }

  public getDecorators(): MusicDecorator[] {
    return this.decorators;
  }


  public addDecorator(decorator: MusicDecorator): void {
    this.decorators.push(decorator);
  }

  public executeCommand(command: MusicCommand): void {
    command.execute();
  }

  public changeState(state: MusicState): void {
    this.state = state;
    this.state.changeState();
    this.notifyObservers();
  }

  public addToPlaylist(item: MusicItem): void {
    this.playlist.push(item);
    this.notifyObservers();
  }

  public removeFromPlaylist(item: MusicItem): void {
    const index = this.playlist.indexOf(item);
    if (index !== -1) {
      this.playlist.splice(index, 1);
      this.notifyObservers();
    }
  }

  public getPlaylist(): MusicItem[] {
    return this.playlist;
  }

  public setCurrentSongIndex(index: number): void {
    this.currentSongIndex = index;
  }

  public getCurrentSongIndex(): number {
    return this.currentSongIndex;
  }

  public async loadSongsFromFolder(folderPath: string): Promise<void> {
    try {
      const response = await fetch(`${folderPath}songs.json`);
      const data = await response.json();

      const songs = data.songs || [];

      songs.forEach((song: MusicItem) => {
        this.addToPlaylist(song);
      });

      console.log("Songs loaded from folder:", this.getPlaylist()[0]);
      //console.log(typeof( this.getPlaylist()));
      for (let index = 0; index < this.getPlaylist().length; index++) {
        const element = this.getPlaylist()[index];
        let songlist: string | undefined = this.getPlaylist()[index].title;
        if(song_display != undefined){
          song_display.innerText += songlist + "\n";
        } 
      }
    } catch (error) {
      console.error("Error loading songs from folder:", error);
    }
  }

  setLoop(isLooping: boolean): void {
    this.currentStrategy.setLoop(isLooping);
  }

  setRandom(isRandom: boolean): void {
    this.isRandom = isRandom;
  }

  public getCurrentStrategy(): PlaybackStrategy {
    return this.currentStrategy;
  }

}

// Example usage:
const musicPlayer = MusicPlayer.getInstance();

// Add songs to the playlist
// musicPlayer.addToPlaylist({ title: 'Song 1', filePath: './songs/Valley_of_Mines.mp3' });
// musicPlayer.addToPlaylist({ title: 'Song 2', filePath: './songs/InitialD.mp3' });
musicPlayer.loadSongsFromFolder('./songs/');
// Add more songs as needed

// Check if a song is playing
//console.log("Is song playing?", musicPlayer.isPlaying);
const songNameDisplayDecorator = new SongNameDisplayDecorator(musicPlayer);
musicPlayer.addDecorator(songNameDisplayDecorator);



// Add event listeners as before
document.getElementById("playButton")?.addEventListener("click", function() {
  musicPlayer.play();
  console.log("Is song playing?", musicPlayer.isPlaying);
});

document.getElementById("pauseButton")?.addEventListener("click", function() {
  musicPlayer.pause();
});

document.getElementById("stopButton")?.addEventListener("click", function() {
  musicPlayer.stop();
});

document.getElementById("nextButton")?.addEventListener("click", function() {
  musicPlayer.next();
});

document.getElementById("previousButton")?.addEventListener("click", function() {
  musicPlayer.previous();
});

// Add event listener for the loop button
document.getElementById("loop")?.addEventListener("click", function() {
  const loopButton = document.getElementById("loop") as HTMLButtonElement;
  musicPlayer.isLooping = !musicPlayer.isLooping; // Toggle loop mode directly on MusicPlayer
  loopButton.innerText = musicPlayer.isLooping ? "Loop (ON)" : "Loop (OFF)";
});

// Add event listener for the random button
document.getElementById("random")?.addEventListener("click", function() {
  const randomButton = document.getElementById("random") as HTMLButtonElement;
  musicPlayer.isRandom = !musicPlayer.isRandom; // Toggle random mode directly on MusicPlayer
  randomButton.innerText = musicPlayer.isRandom ? "Random (ON)" : "Random (OFF)";
});

const volumeRange = document.getElementById("volumeRange") as HTMLInputElement;

volumeRange.addEventListener("input", function () {
  const volume = parseInt(volumeRange.value);
  const currentStrategy = musicPlayer.getCurrentStrategy();
  if (currentStrategy) {
    currentStrategy.setVolume(volume);
  }
});