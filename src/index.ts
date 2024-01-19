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
  //isPlaying(): boolean;
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

class DefaultPlaybackStrategy implements PlaybackStrategy {
  private currentSongIndex: number = 0;
  private isPlaying: boolean = false;

  private audio: HTMLAudioElement | null = null;

  play(): void {
    if (!this.isPlaying) {
      const song = this.loadSong();
      if (song) {
        this.playLoadedSong(song);
      }
    } else {
      console.log("Already playing a song.");
    }
  }

  private loadSong(): MusicItem | null {
    const song = this.getCurrentSong();
    if (song) {
      console.log(`Loading song: ${song.title}`);
      return song;
    } else {
      console.log("No more songs in the playlist.");
      return null;
    }
  }

  private getCurrentSong(): MusicItem | undefined {
    return musicPlayer.getPlaylist()[this.currentSongIndex];
  }

  private async playLoadedSong(song: MusicItem): Promise<void> {
    try {
      this.audio = new Audio(song.filePath);

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
      });

      await this.audio.play();
      console.log(`Playing: ${song.title}`);
    } catch (error) {
      console.error(`Error playing the song: ${song.title}`, error);
      this.isPlaying = false;
    }
  }

  pause(): void {
    if (this.isPlaying && this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      console.log("Pausing...");
    } else {
      console.log("No song is currently playing.");
    }
  }

  stop(): void {
    console.log("Stopping...");
    this.isPlaying = false;
  }

  next(): void {
    console.log("Next track...");
    this.stop();
    this.play();
  }

  previous(): void {
    console.log("Previous track...");
    this.stop();
    this.play();
  }
}



class DefaultMusicState implements MusicState {
  changeState(): void {
    console.log("Changing state...");
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
  private isPaused: boolean = false;

  isPlaying: boolean = false;

  public isSongPlaying(): boolean {
    return this.isPlaying;
  }

  public isSongPaused(): boolean {
    return this.isPaused;
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
    this.isPaused = true;
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
}

// Example usage:
const musicPlayer = MusicPlayer.getInstance();

// Add songs to the playlist
musicPlayer.addToPlaylist({ title: 'Song 1', filePath: './songs/Valley_of_Mines.mp3' });
musicPlayer.addToPlaylist({ title: 'Song 2', filePath: './songs/InitialD.mp3' });
// Add more songs as needed

// Check if a song is playing
console.log("Is song playing?", musicPlayer.isPlaying);

// Add event listeners as before
document.getElementById("playButton")?.addEventListener("click", function() {
  musicPlayer.play();
  console.log("Is song playing?", musicPlayer.isPlaying);
});

// ... (other event listeners remain unchanged)


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
