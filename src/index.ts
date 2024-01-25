// Deklaracje zmiennych i elementów interfejsu użytkownika
let songlist: object;
let song_display = document.getElementById("song-display") as HTMLElement;
let currsongDisplay = document.getElementById("current_song") as HTMLElement;
let pervs = document.getElementById("pervs") as HTMLElement;
let nexts = document.getElementById("nexts") as HTMLElement;


//--------------------Interfejsy i klasy dla komponentów muzycznych i strategii odtwarzania--------------------------------------

interface MusicItem {
  title: string;
  filePath: string;
  getTitle(): string;
}

//wzorzec strategii
interface PlaybackStrategy {
  audio: HTMLAudioElement | null;
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  previous(): void;
  setLoop(isLooping: boolean): void;
  setRandom(isRandom: boolean): void;
  setVolume(volume: number): void;
}

//wzorzec observator
interface Observer {
  update(): void;
}

//wzorzec decorator
interface MusicDecorator {
  decorate(): void;
}

//wzorzec iterator
interface Iterator<T> {
  next(): IteratorResult<T>;
}

//wzorzec komendy ostatecznie nie użyty
interface MusicCommand {
  execute(): void;
}


//Kompozyt, ostatecznie zaimplementowany, jednak nie użyty, ale działa ;)
interface MusicComponent {
  play(): void;
  stop(): void;
  getDuration(): number;
}

//wzorzes Stanu
interface MusicState {
  changeState(): void;
}

//Stara klasa implementująca metodę komponentu, nie użyta
class Song implements MusicComponent, MusicItem {
  public title: string;
  public filePath: string;
  private audio: HTMLAudioElement;

  constructor(title: string, filePath: string) { //kontruktor
    this.title = title;
    this.filePath = filePath;
    this.audio = new Audio(filePath);
  }

  play(): void {
    // Implementation to play a song
  }

  stop(): void {
    // Implementation to stop a song
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Klasa do listy playlist
class PlaylistList {
  private playlists: Playlist[] = [];
  private index: number = 0;

  addPlaylist(playlist: Playlist): void {
    this.playlists.push(playlist);
  }

  // Metoda zwracająca kolejną playlistę
  nextPlaylist(): Playlist | null {
    return this.index < this.playlists.length ? this.playlists[this.index++] : null;
  }

  // Metoda sprawdzająca, czy są jeszcze dostępne playlisty
  hasNextPlaylist(): boolean {
    return this.index < this.playlists.length;
  }
  getLenth(): number {
    return this.playlists.length;
  }
}

// wzorzec iterator w playlistach
class PlaylistListIterator implements Iterator<Playlist> {
  private playlistList: PlaylistList;
  private index: number = 0;
  
  constructor(playlistList: PlaylistList) {
    this.playlistList = playlistList;
  }

  // Metoda next zwracająca kolejną playlistę
  next(): IteratorResult<Playlist> {
    const playlist = this.playlistList.nextPlaylist();
    if (playlist!=null) {
      return { value: playlist, done: false };
    } else {
      return { value: undefined as any, done: true };;
    }
  }
}

// Klasa implemetująca kompozyt, zaweirająca playlisty
class Playlist implements MusicComponent {
  private name: string;
  private playlist: Song[] = [];
  private songsByName: Map<string, MusicComponent> = new Map();

  constructor(name: string) {
    this.name = name;
  }
  
  public getSongs(){
    return this.playlist;
  }

  add(component: Song): void {
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

/*  addSongByName(songName: string): void {
    const song = this.songsByName.get(songName);
    if (song) {
      this.add(song);
      console.log(`Song '${songName}' added to the playlist.`);
    } else {
      console.warn(`Song '${songName}' not found.`);
    }
  } */

  getPlaylist(): MusicComponent[] {
    return this.playlist;
  }

  getName():string{
    return this.name;
  }

  isSongInPlaylist(song: Song): boolean {
    return this.playlist.some(existingSong => existingSong.getTitle() === song.getTitle());
  }

}

class SongNameLoggingDecorator implements MusicDecorator {// Wzorzec dekorator
  private musicPlayer: MusicPlayer;

  constructor(musicPlayer: MusicPlayer) {
    this.musicPlayer = musicPlayer;
  }
  update(): void{// update dekoratora coś ala odświeżenie
    this.decorate();
  }

  decorate(): void {
    let currentSongIndex = this.musicPlayer.getCurrentSongIndex();
    const currentPlaylist = this.musicPlayer.getPlaylist();
    if(currentSongIndex == this.musicPlayer.getPlaylist().length){
      currentSongIndex--;
    }
    //wyświetlanie nazw piosenek przed, aktualnej i po
    const currentSong = currentPlaylist[currentSongIndex]; //aktualna piuosenka
    const nextSong = currentPlaylist[(currentSongIndex + 1) % currentPlaylist.length];//następna piuosenka
    const previousSong = currentPlaylist[(currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length];//poprzednia piuosenka
    
    //dekorowanie samo w sobie, "wstrzykiwanie" w HTMLa textu z nazwami
    if(musicPlayer.isRandom){
      pervs.innerText = nexts.innerText = "?"
    }else{
      currsongDisplay.innerText = currentSong.title
      pervs.innerText = previousSong.title
      nexts.innerText = nextSong.title
    }
  }
}


class PlayingState implements MusicState {// wzorzec stanu grającego
  changeState(): void {
    console.log("Music is currently playing.");
    //deklaracje przycisków, na które wpływa diagram stanu
    let buttonplay :HTMLElement | null = document.getElementById("playButton") //przycisk grania
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")//przycisk gpauzy
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")//przycisk stopu
    //"kolorawnie" przycosku danego stanu
    if(buttonplay && buttonpause && buttonstop){
          buttonplay.style.backgroundColor = "green";
          buttonpause.style.backgroundColor = "";
          buttonstop.style.backgroundColor = "";
    }
  }
}

class PausedState implements MusicState { // wzorzec stanu zapauzowanego
  changeState(): void {
    console.log("Music is currently paused.");
    let buttonplay :HTMLElement | null = document.getElementById("playButton")  //przycisk grania
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")//przycisk gpauzy
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")//przycisk stopu
    //"kolorawnie" przycosku danego stanu
    if(buttonplay && buttonpause && buttonstop){
      buttonplay.style.backgroundColor = "";
      buttonpause.style.backgroundColor = "orange";
      buttonstop.style.backgroundColor = "";
    } 
  }
}

class StoppedState implements MusicState {// wzorzec stanu zastopowanego
  changeState(): void {
    console.log("Music is currently stopped.");
    let buttonplay :HTMLElement | null = document.getElementById("playButton")//przycisk grania
    let buttonpause :HTMLElement | null = document.getElementById("pauseButton")//przycisk gpauzy
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")//przycisk stopu
    //"kolorawnie" przycosku danego stanu
    if(buttonplay && buttonpause && buttonstop){
      buttonplay.style.backgroundColor = "";
      buttonpause.style.backgroundColor = "";
      buttonstop.style.backgroundColor = "red";
    } 
  }
}


class DefaultPlaybackStrategy implements PlaybackStrategy { //implementacja wzorca strategii
  

  public audio: HTMLAudioElement | null = null; // właśności utworu samego w sobie
  private playbackPosition: number = 0; // aktualna pozycja odtwarzanego utworu, czas jak się odtawrza
  private isPlaying: boolean = false; //flaga pilnująca czy odtwarzacz odtwarza piosenke
  private currentSongIndex: number = 0; //Podstawowy index
  private volume: number = 100; // Podstawowy poziom głośności
 // private decorator: MusicDecorator

  constructor() {
    this.setVolume(this.volume);
  }

  setVolume(volume: number): void {// 
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume / 100;
    }
  }

  private isLooping: boolean = false;
  private isRandom: boolean = false;

  setLoop(isLooping: boolean): void { // strategia Loopowania
    this.isLooping = isLooping;
  }

  setRandom(isRandom: boolean): void {
    this.isRandom = isRandom;
    musicPlayer.setRandom(isRandom);  // Strategia losowania
  }

  play(): void { // strategia odwtarzania
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

  pause(): void { // strategia pauzy
    if (this.isPlaying && this.audio) {
      this.audio.pause();
      this.playbackPosition = this.audio.currentTime;
      this.isPlaying = false;
      musicPlayer.changeState(new PausedState());
    } else {
      console.log("No song is currently playing.");
    }
  }

  stop(): void { // strategia stopu
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playbackPosition = 0;
      this.isPlaying = false;
      musicPlayer.changeState(new StoppedState());
    } else {
      console.log("No song is currently playing.");
    }
  }

  next(): void { // strategia kolejnego utowru
    this.stop();
    let buttonplay :HTMLElement | null = document.getElementById("playButton")
    let buttonstop :HTMLElement | null = document.getElementById("stopButton")
    if(buttonplay && buttonstop){
      buttonplay.style.backgroundColor = "green";
      buttonstop.style.backgroundColor = "";
    }
    const playlist = musicPlayer.getPlaylist();
    if (playlist.length > 0) {
        if (musicPlayer.isRandom) { //sprawdzenie czy zaimplementowane są już jakieś strategie
            this.playRandomSong(playlist);// i na tej podstawie wybór kolejnej piosenki
            this.decorate();
        } else {
            if (musicPlayer.isLooping) {
                this.currentSongIndex = (this.currentSongIndex + 1) % playlist.length;
            } else {
                this.currentSongIndex = Math.min(this.currentSongIndex + 1, playlist.length - 1);
            }
                this.decorate();
            const nextSong = playlist[this.currentSongIndex];
            this.playLoadedSong(nextSong);
        }
    } else {
        console.log("Playlist is empty.");
    }
}


previous(): void { // strategia poprzedniego utworu
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
        if (musicPlayer.isRandom) {//sprawdzenie czy zaimplementowane są już jakieś strategie
            this.playRandomSong(playlist);// i na tej podstawie wybór kolejnej piosenki
        } else {
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

  playRandomSong(playlist: MusicItem[]): void { //jeśli jest włączona strategia losowej piosenki, włącza sie owa metoda, która losuje kolejny utwór do zagrania
    const randomIndex = Math.floor(Math.random() * playlist.length);
    musicPlayer.currentSongIndex = randomIndex;
    const randomSong = playlist[randomIndex];
    currsongDisplay.innerText = randomSong.title;
    this.playLoadedSong(randomSong);
}

  private async playLoadedSong(song: MusicItem): Promise<void> { // metoda "wczytująca" otwór, który zostanie kolejno zagrany
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
    } catch (error) {
      console.error(`Error playing the song: ${song.title}`, error);
      this.isPlaying = false;
    }
  }

  private getCurrentSong(): MusicItem | null { // pobieranie informacju o akutalnym utworze, aby ją udpostępnić innym klasom
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
  }
}


class SongChangeObserver implements Observer { //implementacja observatora
  private musicPlayer: MusicPlayer;

  constructor(musicPlayer: MusicPlayer) { // kontruktor wzoraca observator
    this.musicPlayer = musicPlayer;
    //this.songnames = songnames
  }

  update(): void {// typowa dla observatora metoda update, która jest uzywana w przypadku zaobserwowania zmiany
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



class MusicPlayer { //Singleton klasa możnaby żec główna. Posiada on całą masę informacji o obecnych strategiacha stanach utworu,
  // a przede wszystkim zapenia jedną instacje odtwarzacza, aby nie było problemow komunikacji między innymi klasami
  private static instanceCount: number = 0;
  private static instance: MusicPlayer | null = null; //Tutaj podstawowe zapamiętywanie wzorców, meteod i innych rzeczy, które są następnie używane w innych klasach
  private currentStrategy: PlaybackStrategy; 
  private observers: Observer[] = []; 
  private decorators: MusicDecorator[] = [];
  private state: MusicState; //aktualny stan
  private playlist: MusicItem[] = [];
  public currentSongIndex: number = 0; // numer aktualnei odtarzanej piosenki
  private currentPlaylist: Playlist;
  

  isPlaying: boolean = false;
  isLooping: boolean = true;
  isRandom: boolean = false;

 /* public setPlaylist(playlistToSet: Playlist): void {
    this.currentPlaylist = playlistToSet;
    console.log("proba zmiany na" + this.currentPlaylist?.getName()+" na "+playlistToSet?.getName());
  } */

  public setPlaylist(playlistToSet: MusicItem[]){
      this.playlist=playlistToSet;
  }

  public isSongPlaying(): boolean {// sprawdzenie czy piosenka jest aktualnie odtwarzana
    return this.isPlaying;
  }
  public async loadAndPlaySong(song: MusicItem): Promise<void> {//metoda która włącza kolejna w kolejności piosenke po zakończeniu poprzedniej
    try {
      const audio = new Audio(song.filePath);

      audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      audio.addEventListener('ended', () => {
        this.isPlaying = false;
      });
      // this.currentSongIndex++;
      await audio.play();
    } catch (error) {
      console.error(`Error playing the song: ${song.title}`, error);
    }
  }

  public static getInstanceCount(): number { //pobieranie wiadomości o tym ile Singleton ma instacji
    return MusicPlayer.instanceCount; //metoda głównie używana do debugowania i sprawdzania czy Singleton jest poprawnie zaqimplementowany
  }

  private constructor() { //kontruktor
    this.currentPlaylist = playlistFromFolder; //playlistfromFolder jako pierwsza playlista startowa
    MusicPlayer.instanceCount++;
    this.currentStrategy = new DefaultPlaybackStrategy();
    this.state = new DefaultMusicState();
    this.state = new StoppedState();
  }

  public static getInstance(): MusicPlayer { //pobieranie wiadomości instacji Singletona
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  public setPlaybackStrategy(strategy: PlaybackStrategy): void { //ustawianie strategi ostawrzacza
    this.currentStrategy = strategy;
  }

  public registerObserver(observer: Observer): void {//rejestrowanie observera
    this.observers.push(observer);
  }

  public unregisterObserver(observer: Observer): void {//wyrejestrowanie observera
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notifyObservers(): void { //powiadamianie observera
    this.observers.forEach(observer => observer.update());
  }

  public play(): void { //wysyłanie inputu dotyczątcego odwarzania utwóru
    this.currentStrategy.play();
    //this.notifyObservers();
  }

  public pause(): void { //wysyłanie inputu dotyczątcego zapauzowania utwóru
    this.currentStrategy.pause();
    // this.notifyObservers();
  }

  public stop(): void { //wysyłanie inputu dotyczątcego zatrzymania utowru
    this.currentStrategy.stop();
    // this.notifyObservers();
  }

  public next(): void { //wysyłanie inputu dotyczątcego następnego utwóru
    this.currentSongIndex++;
    if (this.currentSongIndex >= this.getPlaylist().length) {
      this.currentSongIndex = 0;
    }
    this.currentStrategy.next();
    // this.notifyObservers();
  }

  public previous(): void {//wysyłanie inputu dotyczątcego poprzedniego utwóru
    this.currentSongIndex--;
    if (this.currentSongIndex < 0) {
      this.currentSongIndex = this.getPlaylist().length;
    }
    this.currentStrategy.previous();
    // this.notifyObservers();
  }

  public getDecorators(): MusicDecorator[] { //pobieranie inormacji o dekoratorach
    return this.decorators;
  }


  public addDecorator(decorator: MusicDecorator): void { //dodawanie dekoratora
    this.decorators.push(decorator);
  }

  public executeCommand(command: MusicCommand): void { //ekzekucja komendy, ostatecznie nie używana, wzorzec nie zaimplenetowany; placehodler na przyszłość
    command.execute();
  }

  public changeState(state: MusicState): void { //informowanie o zmianie stanu
    this.state = state;
    this.state.changeState();
    this.notifyObservers();
    //this.getDecorators().forEach(decorator => decorator.decorate());
  }

  public addToPlaylist(item: MusicItem): void { //dodawanie do playlisty - komponent
    this.playlist.push(item);
    this.notifyObservers();
  }

  public removeFromPlaylist(item: MusicItem): void {//usuwanie z playlisty - komponent
    const index = this.playlist.indexOf(item);
    console.log("OROBA USUNIECIA"+ item.getTitle());
    if (index !== -1) {
      this.playlist.splice(index, 1);
      this.notifyObservers();
    }
  }

  public getPlaylist(): MusicItem[] { //pobieranie informacji o playliście
    return this.playlist;
  }

  public getCurrentPlaylist(): Playlist {
    return this.currentPlaylist;
    console.log("GETCUTTENPLAYLSIT"+ this.currentPlaylist?.getName());
  }

  public setCurrentSongIndex(index: number): void { //ustawanie aktualnego indeksu piosenki tj. numeru utworu aklutalnie odtwarzanego względem playlisty
    this.currentSongIndex = index;
  }

  public getCurrentSongIndex(): number { //pobieranie aktualnego indeksu pioseneke tj. numeru utworu aklutalnie odtwarzanego względem playlisty
    return this.currentSongIndex;
  }

  public async loadSongsFromFolder(folderPath: string): Promise<void> {
    try {
      //this.clearSongDisplay();
      const response = await fetch(`${folderPath}songs.json`); // pobieranie utworór (playlisty) do odtwarzacza
      const data = await response.json();

      const songs = data.songs || [];

      songs.forEach((song: Song) => {
      //  if(this.currentPlaylist.isSongInPlaylist(song))
      //  {
       // this.addToPlaylist(song);
      //  }
      });
    //  this.addToPlaylist(new Song('GRRRLS', './songs/GRRRLS.mp3'));
   //   this.clearSongDisplay();

      console.log("zmiana playlisty");
      currsongDisplay.innerText = this.getPlaylist()[0].title;
     // currsongDisplay.innerText = this.getCurrentPlaylist().getPlaylist()[0]
      console.log(this.currentPlaylist?.getName())
      song_display.innerText='';
      for (let index = 0; index < this.getPlaylist().length; index++) {
        const element = this.getPlaylist()[index];
        let songlist: string | undefined = this.getPlaylist()[index].title;
        console.log(this.getPlaylist()[index].title);
        if (song_display != undefined) {
          song_display.innerText += songlist + "\n";
          //song_display.innerText.replace
        }
      }
    } catch (error) {
      console.error("Error loading songs from folder:", error);
    }
  }

  setLoop(isLooping: boolean): void {
    this.currentStrategy.setLoop(isLooping); //ustawienie loopa
  }

  setRandom(isRandom: boolean): void {
    this.isRandom = isRandom; //ustawienie losowości
  }

  public getCurrentStrategy(): PlaybackStrategy { // pobranie informacji o aktualnej strategii
    return this.currentStrategy;
  }

}


class EqualizerDecorator implements MusicDecorator { // decorator - equlizer
  private musicPlayer: MusicPlayer;
  private equalizerSettings: number[];
  private audioContext: AudioContext | null;
  private sourceNode: MediaElementAudioSourceNode | null;
  private equalizerNode: BiquadFilterNode | null;

  constructor(musicPlayer: MusicPlayer, equalizerSettings: number[]) { // kontryuktor equlizera
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

  decorate(): void { // dekorowanie quzlizerem utworu
    const currentSongIndex = this.musicPlayer.getCurrentSongIndex();
    const currentSong = this.musicPlayer.getPlaylist()[currentSongIndex];
    
    if (currentSong) {
    this.applyEqualizerSettings(this.musicPlayer.getCurrentStrategy().audio);
  } else {
    console.log('No current song found.');
  }
  }

  private applyEqualizerSettings(audio: HTMLAudioElement | null): void {
    if (audio && this.audioContext) {
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

///utworzone playlisty
const playlistFromFolder = new Playlist("Playlist 2");
const playlistByName = new Playlist("Playlist 3");
const playlistFreyi = new Playlist("Playlist 1");
const playlistList = new PlaylistList();
// Add songs to playlistByName by name - kompozyt
const song1 = new Song('GRRRLS', './songs/GRRRLS.mp3');
const song2 = new Song('MmmMmm', './songs/MmmMmm.mp3');
playlistByName.add(song1);
playlistByName.add(song2);
playlistByName.add(new Song('Faring','./songs/Faring.mp3'));
playlistFreyi.add(song1);
playlistFreyi.add(new Song('Sobieski.mp3','./songs/Sobieski.mp3'));
playlistFromFolder.add(new Song('Believe','./songs/Believe.mp3'));
playlistFromFolder.add(new Song('Careless','./songs/Careless.mp3'));
playlistFromFolder.add(new Song('Destiny','./songs/Destiny.mp3'));


//podstawowa zmienna, rozpoczęcie instacji, singletona
const musicPlayer = MusicPlayer.getInstance();

//rejestracja observatora
const songChangeObserver = new SongChangeObserver(musicPlayer);
musicPlayer.registerObserver(songChangeObserver)

// Assume you have loaded songs into playlistFromFolder using loadSongsFromFolder
musicPlayer.loadSongsFromFolder('./songs/').then(() => {
  // Additional actions after loading songs from the folder, if needed
});

// dodawanie decoratorów

const songNameDisplayDecorator = new SongNameDisplayDecorator(musicPlayer);
musicPlayer.addDecorator(songNameDisplayDecorator);

const songDisplay = new SongNameLoggingDecorator(musicPlayer);
musicPlayer.addDecorator(songDisplay);


const equalizerSettings = [1000, 5]; // Example settings: frequency = 1000 Hz, gain = 5 dB

// Add the equalizer decorator to the MusicPlayer
const equalizerDecorator = new EqualizerDecorator(musicPlayer, equalizerSettings);
musicPlayer.addDecorator(equalizerDecorator);


playlistList.addPlaylist(playlistFreyi);
playlistList.addPlaylist(playlistFromFolder);
playlistList.addPlaylist(playlistByName);
// Przejrzyj i wypisz nazwy playlist na stronie
  var lista = document.getElementById("playlistslist");
  if(lista!=null)
  {
    const iterator = new PlaylistListIterator(playlistList);
    let result = iterator.next();
    while (!result.done) {
      const chosenPlaylist = result.value;
      if (chosenPlaylist != null) {
        var listItem = document.createElement("button");
        listItem.className = "btn btn-dark playlist"
        listItem.type = "button"
        listItem.textContent = chosenPlaylist.getName();
        listItem?.addEventListener("click", function() {
          
          musicPlayer.setPlaylist(chosenPlaylist.getSongs());
         musicPlayer.loadSongsFromFolder('./songs/').then(() => {});

          const equalizerDecorator = new EqualizerDecorator(musicPlayer, equalizerSettings);
          musicPlayer.addDecorator(equalizerDecorator);
          musicPlayer.setPlaylist(chosenPlaylist.getSongs());
        });
        lista.appendChild(listItem);
        lista.appendChild(document.createElement("br"));
      }
      result = iterator.next();
    }
  } 

  console.log("OBECNA PLAYLISTA:" + musicPlayer.getCurrentPlaylist()?.getName());

// Wsyzstskie przyciski i eventlistenery, który wprawiają w ruch maszyne
document.getElementById("playButton")?.addEventListener("click", function() {
  musicPlayer.play();
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
  loopButton.style.backgroundColor = musicPlayer.isLooping ? "green" : "";
});

// Add event listener for the random button
document.getElementById("random")?.addEventListener("click", function() {
  const randomButton = document.getElementById("random") as HTMLButtonElement;
  musicPlayer.isRandom = !musicPlayer.isRandom; // Toggle random mode directly on MusicPlayer
  if(musicPlayer.isRandom){
    pervs.innerText = nexts.innerText = "?"
  }else{
    //songDisplay.update();
  }
  randomButton.style.backgroundColor = musicPlayer.isRandom ? "green" : "";
});

//deklaracja  nasłuchiwania zmiana w suwaku głośności
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
  if (musicPlayer.getCurrentPlaylist() === playlistFromFolder) {
    musicPlayer.setPlaylist(playlistByName.getSongs());
  } else {
    musicPlayer.setPlaylist(playlistFromFolder.getSongs());
  } 

  /* Get the playlist and play each song sequentially
  const playlist = currentPlaylist.getPlaylist();
  for (const song of playlist) {
    await playSong(song);
  } */
});


//granie piosenek pojedynczo z kompozytu, jednakże nie słychać ich - wszystują się poprawnie ale nie są dodawane do akltualnej playlisty
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
