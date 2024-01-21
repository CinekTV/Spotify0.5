let songlist: object;
let song_display = document.getElementById("song-display") as HTMLElement;

interface MusicItem {
  title: string;
  filePath: string;
  getTitle(): string;
}

interface PlaybackStrategy {
  audio: HTMLAudioElement | null; // Add this line
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




interface MusicComponent {
  play(): void;
  stop(): void;
  getDuration(): number;
}


interface MusicState {
  changeState(): void;
}


class Song implements MusicComponent, MusicItem {
  public title: string;
  public filePath: string;
  private audio: HTMLAudioElement;

  constructor(title: string, filePath: string) {
    this.title = title;
    this.filePath = filePath;
    this.audio = new Audio(filePath);
  }

  play(): void {
    // Implementation to play a song
    console.log(`Playing: ${this.title}`);
  }

  stop(): void {
    // Implementation to stop a song
    console.log(`Stopping: ${this.title}`);
  }

  getDuration(): number {
    // Implementation to get the duration of a song
    return 0; // Replace with actual implementation
  }
  getTitle(): string{
    return this.title;
  }

  getAudio(): HTMLAudioElement {
    return this.audio;
  }
}

// Composite class representing a playlist
class Playlist implements MusicComponent {
  private playlist: MusicComponent[] = [];
  private songsByName: Map<string, MusicComponent> = new Map();

  add(component: MusicComponent): void {
    this.playlist.push(component);
    if (component instanceof Song) {
      this.songsByName.set(component.getTitle(), component);
    }
  }

  play(): void {
    // Implementation to play all songs in the playlist
    this.playlist.forEach(song => song.play());
  }

  stop(): void {
    // Implementation to stop all songs in the playlist
    this.playlist.forEach(song => song.stop());
  }

  getDuration(): number {
    // Implementation to get the total duration of all songs in the playlist
    return this.playlist.reduce((total, song) => total + song.getDuration(), 0);
  }

  addSongByName(songName: string): void {
    const song = this.songsByName.get(songName);
    if (song) {
      this.add(song);
      console.log(`Song '${songName}' added to the playlist.`);
    } else {
      console.warn(`Song '${songName}' not found.`);
    }
  }

  getPlaylist(): MusicComponent[] {
    return this.playlist;
  }
}

class SongNameLoggingDecorator implements MusicDecorator {
  private musicPlayer: MusicPlayer;

  constructor(musicPlayer: MusicPlayer) {
    this.musicPlayer = musicPlayer;
  }
  update(): void{
    this.decorate();
    console.log("ELO LEO")
  }

  decorate(): void {
    const currentSongIndex = this.musicPlayer.getCurrentSongIndex();
    const currentPlaylist = this.musicPlayer.getPlaylist();
    const currentSong = currentPlaylist[currentSongIndex];
    const nextSong = currentPlaylist[(currentSongIndex + 1) % currentPlaylist.length];
    const previousSong = currentPlaylist[(currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length];
    console.log(currentSong)
    console.log(`Current Song: ${currentSong.title ? currentSong.title: 'No song playing'}`);
    console.log(`Next Song: ${nextSong.title ? nextSong.title : 'No next song'}`);
    console.log(`Previous Song: ${previousSong.title ? previousSong.title : 'No previous song'}`);
  }
}


class PlayingState implements MusicState {
  changeState(): void {
    console.log("Music is currently playing.");
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonpause && buttonstop){
          buttonplay.style.backgroundColor = "green";
          buttonpause.style.backgroundColor = "";
          buttonstop.style.backgroundColor = "";
    }
  }
}

class PausedState implements MusicState {
  changeState(): void {
    console.log("Music is currently paused.");
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonpause && buttonstop){
      buttonplay.style.backgroundColor = "";
      buttonpause.style.backgroundColor = "orange";
      buttonstop.style.backgroundColor = "";
    } 
  }
}

class StoppedState implements MusicState {
  changeState(): void {
    console.log("Music is currently stopped.");
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonpause && buttonstop){
      buttonplay.style.backgroundColor = "";
      buttonpause.style.backgroundColor = "";
      buttonstop.style.backgroundColor = "red";
    } 
  }
}


class DefaultPlaybackStrategy implements PlaybackStrategy {
  

  public audio: HTMLAudioElement | null = null;
  private playbackPosition: number = 0;
  private isPlaying: boolean = false;
  private currentSongIndex: number = 0;
  private volume: number = 100; // Default volume
 // private decorator: MusicDecorator

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
    } else {
      console.log("No song is currently playing.");
    }
  }

  next(): void {
    this.stop();
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonstop){
      buttonplay.style.backgroundColor = "green";
      buttonstop.style.backgroundColor = "";
    }
    this.decorate();
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
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonstop){
      buttonplay.style.backgroundColor = "green";
      buttonstop.style.backgroundColor = "";
    }
    this.decorate();
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
    //console.log(`Current Song: ${currentSong ? currentSong.title : 'No song playing'}`);
  }
}


class SongChangeObserver implements Observer {
  private musicPlayer: MusicPlayer;
  //private songnames: SongNameLoggingDecorator;

  constructor(musicPlayer: MusicPlayer) {
    this.musicPlayer = musicPlayer;
    //this.songnames = songnames
  }

  update(): void {
    const currentSongIndex = this.musicPlayer.getCurrentSongIndex();
    const currentSong = this.musicPlayer.getPlaylist()[currentSongIndex];
    // this.musicPlayer.addDecorator
    if (currentSong) {
      console.log(`Current Song changed: ${currentSong.title} (Index: ${currentSongIndex})`);
    } else {
      console.log('No current song found.');
    }
  }
}



class MusicPlayer { //Singleton
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
    //this.notifyObservers();
  }

  public pause(): void {
    this.currentStrategy.pause();
    // this.notifyObservers();
  }

  public stop(): void {
    this.currentStrategy.stop();
    // this.notifyObservers();
  }

  public next(): void {
    this.currentSongIndex++;
    if (this.currentSongIndex >= this.getPlaylist().length) {
      //console.log("Wyszło szydło z worka: " + this.getPlaylist().length)
      this.currentSongIndex = 0;
    }
    this.currentStrategy.next();
    // this.notifyObservers();
  }

  public previous(): void {
    this.currentSongIndex--;
    if (this.currentSongIndex < 0) {
      //console.log("Wyszło szydło z worka: " + this.getPlaylist().length)
      this.currentSongIndex = this.getPlaylist().length;
    }
    this.currentStrategy.previous();
    // this.notifyObservers();
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
    //this.getDecorators().forEach(decorator => decorator.decorate()); // Ensure decorate is called here
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
        console.log("S: " + song.title)
      });

      console.log("Songs loaded from folder:", this.getPlaylist()[0]);
      //console.log(typeof( this.getPlaylist()));
      for (let index = 0; index < this.getPlaylist().length; index++) {
        const element = this.getPlaylist()[index];
        let songlist: string | undefined = this.getPlaylist()[index].title;
        if (song_display != undefined) {
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


class EqualizerDecorator implements MusicDecorator {
  private musicPlayer: MusicPlayer;
  private equalizerSettings: number[]; // Adjust these values based on your equalizer requirements
  private audioContext: AudioContext | null;
  private sourceNode: MediaElementAudioSourceNode | null;
  private equalizerNode: BiquadFilterNode | null;

  constructor(musicPlayer: MusicPlayer, equalizerSettings: number[]) {
    this.musicPlayer = musicPlayer;
    this.equalizerSettings = equalizerSettings;
    this.audioContext = null;
    this.sourceNode = null; // Initialize sourceNode
    this.equalizerNode = null; // Initialize equalizerNode
  }

  update(): void {
    console.log('EqualizerDecorator: update method called');
    this.decorate();
  }

  decorate(): void {
    const currentSongIndex = this.musicPlayer.getCurrentSongIndex();
    const currentSong = this.musicPlayer.getPlaylist()[currentSongIndex];
    
    if (currentSong) {
    // console.log(`Equalizing: ${currentSong.title} (Index: ${currentSongIndex})`);
    this.applyEqualizerSettings(this.musicPlayer.getCurrentStrategy().audio);
  } else {
    console.log('No current song found.');
  }
  }

  private applyEqualizerSettings(audio: HTMLAudioElement | null): void {
    if (audio && this.audioContext) {
      // Check if the audio element is already connected to an AudioNode
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume(); // Resume the AudioContext if it's in a suspended state
      }

      if (!this.sourceNode) {
        // If not connected, create a new source node
        this.sourceNode = this.audioContext.createMediaElementSource(audio);
      }

      if (!this.equalizerNode) {
        // If not connected, create a new equalizer node
        this.equalizerNode = this.audioContext.createBiquadFilter();

        // Apply equalizer settings
        this.equalizerNode.type = 'peaking';
        this.equalizerNode.frequency.value = this.equalizerSettings[0] || 1000;
        this.equalizerNode.gain.value = this.equalizerSettings[1] || 0;

        // Connect the nodes in the audio processing graph
        this.sourceNode.connect(this.equalizerNode);
        this.equalizerNode.connect(this.audioContext.destination);
      }
    }
  }
}




// Example usage:
const musicPlayer = MusicPlayer.getInstance();

// Add songs to the playlist



const songChangeObserver = new SongChangeObserver(musicPlayer);
musicPlayer.registerObserver(songChangeObserver)
// musicPlayer.addToPlaylist({ title: 'Song 1', filePath: './songs/Valley_of_Mines.mp3' });
// musicPlayer.addToPlaylist({ title: 'Song 2', filePath: './songs/InitialD.mp3' });
// musicPlayer.loadSongsFromFolder('./songs/');
const playlistFromFolder = new Playlist();
const playlistByName = new Playlist();

// Assume you have loaded songs into playlistFromFolder using loadSongsFromFolder
musicPlayer.loadSongsFromFolder('./songs/').then(() => {
  // Additional actions after loading songs from the folder, if needed
});

// Add songs to playlistByName by name
const song1 = new Song('Song 1', './songs/GRRRLS.mp3');
const song2 = new Song('Song 2', './songs/MmmMmm.mp3');
playlistByName.add(song1);
playlistByName.add(song2);

// Set the initial current playlist
let currentPlaylist = playlistFromFolder;



// Add more songs as needed

// Check if a song is playing
//console.log("Is song playing?", musicPlayer.isPlaying);

const songNameDisplayDecorator = new SongNameDisplayDecorator(musicPlayer);
musicPlayer.addDecorator(songNameDisplayDecorator);

const songDisplay = new SongNameLoggingDecorator(musicPlayer);
musicPlayer.addDecorator(songDisplay);


const equalizerSettings = [1000, 5]; // Example settings: frequency = 1000 Hz, gain = 5 dB

// Add the equalizer decorator to the MusicPlayer
const equalizerDecorator = new EqualizerDecorator(musicPlayer, equalizerSettings);
musicPlayer.addDecorator(equalizerDecorator);



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

document.getElementById("switchPlaylistButton")?.addEventListener("click", async function () {
  // Toggle between the two playlists
  if (currentPlaylist === playlistFromFolder) {
    currentPlaylist = playlistByName;
  } else {
    currentPlaylist = playlistFromFolder;
  }

  // Get the playlist and play each song sequentially
  const playlist = currentPlaylist.getPlaylist();
  for (const song of playlist) {
    await playSong(song);
  }

  // You can perform other actions here, such as updating the UI to display the current playlist
});

async function playSong(song: MusicComponent): Promise<void> {
  return new Promise<void>((resolve) => {
    song.play();
    const audio = song instanceof Song ? (song as Song).getAudio() : null;
    if (audio) {
      audio.addEventListener('ended', () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}
