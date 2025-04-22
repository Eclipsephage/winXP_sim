export function initMusicPlayer(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  const instanceId = Math.random().toString(36).substr(2, 9);
  contentArea.innerHTML = `
    <div style="padding: 10px;" id="mp-container-${instanceId}">
      <h2>Music Player</h2>
      <div id="mp-song-info-${instanceId}" style="margin-bottom: 10px;">No song playing</div>
      <div id="mp-controls-${instanceId}" style="margin-bottom: 10px; display: flex; flex-wrap: nowrap; justify-content: space-around;">
        <button id="mp-prev-${instanceId}">Prev</button>
        <button id="mp-play-${instanceId}">Play</button>
        <button id="mp-pause-${instanceId}">Pause</button>
        <button id="mp-next-${instanceId}">Next</button>
      </div>
      <div style="margin-bottom:10px;">
        <input id="mp-progress-${instanceId}" type="range" min="0" max="100" value="0" style="width:100%; pointer-events: none;">
      </div>
      <ul id="mp-playlist-${instanceId}" style="list-style-type: none; padding: 0;"></ul>
    </div>
  `;

  const songs = [
    { title: "Jetpack Joyride Theme", src: "music_JetpackJoyride.mp3" },
    { title: "Super Mario 64 - Dire Dire Docks", src: "music_DireDireDocks.mp3" },
    { title: "Relaxed Scene", src: "music_RelaxedScene.mp3" },
    { title: "Kevin MacLeod - New Friendly", src: "music_NewFriendly.mp3" },
    { title: "Green Hill Zone - Act 1", src: "music_GreenHillZone.mp3" },
    { title: "Nintendo Wii - Mii Channel Theme", src: "music_MiiChannel.mp3" },
    { title: "Geometry Dash - Stereo Madness", src: "music_StereoMadness.mp3" },
    { title: "Minecraft - Sweden", src: "music_MinecraftSweeden.mp3" },
    { title: "Wii U - Mii Maker Theme", src: "music_MiiMakerWiiU.mp3" },
    { title: "Wii Sports Theme", src: "music_WiiSports.mp3" },
    { title: "Plants vs Zombies - Day Stage", src: "music_PvZDay.mp3" },
    { title: "Windows XP installation music [HD]", src: "music_WindowsXP.mp3" },
    { title: "Tomodachi Collection - Making a Friend", src: "music_MakingAFriend.mp3" },
    { title: "DKC2 - Stickerbush Symphony", src: "music_StickerbushSymphony.mp3" },
    { title: "Wii Party - Main Menu", src: "music_WiiParty.mp3" }
  ];

  const audio = new Audio();
  audio.preload = 'auto';

  const container = win.querySelector(`#mp-container-${instanceId}`);
  const songInfo = container.querySelector(`#mp-song-info-${instanceId}`);
  const progressBar = container.querySelector(`#mp-progress-${instanceId}`);
  const playlistEl = container.querySelector(`#mp-playlist-${instanceId}`);
  const playBtn = container.querySelector(`#mp-play-${instanceId}`);
  const pauseBtn = container.querySelector(`#mp-pause-${instanceId}`);
  const nextBtn = container.querySelector(`#mp-next-${instanceId}`);
  const prevBtn = container.querySelector(`#mp-prev-${instanceId}`);

  let currentSongIndex = 0;

  function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.style.padding = '5px';
      li.style.cursor = 'pointer';
      li.style.backgroundColor = index === currentSongIndex ? '#ddd' : 'transparent';
      li.addEventListener('click', () => {
        currentSongIndex = index;
        playSong();
      });
      playlistEl.appendChild(li);
    });
  }

  function updateSongInfo() {
    songInfo.textContent = songs[currentSongIndex].title;
    renderPlaylist();
  }

  function playSong() {
    const song = songs[currentSongIndex];
    if (audio.src !== song.src) {
      audio.src = song.src;
    }
    audio.play().then(() => {
      updateSongInfo();
      showNotification(`Playing: ${song.title}`);
    }).catch(err => {
      console.warn(`Audio play prevented: ${err.message}`);
      showNotification(`Error playing song: ${err.message}`);
    });
  }

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progressPercent;
    }
  });

  playBtn.addEventListener('click', () => {
    if (!audio.src) {
      playSong();
    } else {
      audio.play().then(() => {
        showNotification(`Resumed: ${songs[currentSongIndex].title}`);
      }).catch(err => {
        console.warn(`Audio play prevented: ${err.message}`);
        showNotification(`Error playing song: ${err.message}`);
      });
    }
  });

  pauseBtn.addEventListener('click', () => {
    audio.pause();
    showNotification(`Paused: ${songs[currentSongIndex].title}`);
  });

  nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong();
  });

  prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong();
  });

  audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong();
  });

  // Fix: Ensure the audio stops when the music app is closed.
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  renderPlaylist();
}