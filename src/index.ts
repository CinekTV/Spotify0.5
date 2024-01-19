interface PlaybackStrategy {
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  previous(): void;
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

interface MusicItem {
  // Define properties and methods for a music item
}


class DefaultPlaybackStrategy implements PlaybackStrategy {
  play(): void {
    console.log("Playing...");
  }

  pause(): void {
    console.log("Pausing...");
  }

  stop(): void {
    console.log("Stopping...");
  }

  next(): void {
    console.log("Next track...");
  }

  previous(): void {
    console.log("Previous track...");
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
  
  public static getInstanceCount(): number {
    return MusicPlayer.instanceCount;
  }

  private constructor() {
    MusicPlayer.instanceCount++;
    // Private constructor to prevent external instantiation
    // Default strategy, state, etc., can be set here
    this.currentStrategy = new DefaultPlaybackStrategy();/* default strategy */
    this.state = new DefaultMusicState();/* default state */
  }

  public static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
      // Additional setup can go here
    }
    console.log(MusicPlayer.instance)
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
}

// Example usage:

// console.log("a " + MusicPlayer.getInstanceCount()); // Output: 0

const musicPlayer = MusicPlayer.getInstance();
console.log("Instancja singleton " + MusicPlayer.getInstanceCount()); // Output: 1

// const musicPlayer2 = MusicPlayer.getInstance();
// console.log("c " + MusicPlayer.getInstanceCount());

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