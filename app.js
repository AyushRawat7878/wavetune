// User data management
const userData = {
    currentUser: null,
    playlists: [],
    likedSongs: [],
    recentlyPlayed: []
};

// Initialize data from localStorage
function initializeData() {
    const savedUser = localStorage.getItem('currentUser');
    const savedPlaylists = localStorage.getItem('playlists');
    const savedLikedSongs = localStorage.getItem('likedSongs');
    const savedRecentlyPlayed = localStorage.getItem('recentlyPlayed');

    if (savedUser) userData.currentUser = JSON.parse(savedUser);
    if (savedPlaylists) userData.playlists = JSON.parse(savedPlaylists);
    if (savedLikedSongs) userData.likedSongs = JSON.parse(savedLikedSongs);
    if (savedRecentlyPlayed) userData.recentlyPlayed = JSON.parse(savedRecentlyPlayed);

    // Ensure liked songs playlist exists
    const likedSongsPlaylist = userData.playlists.find(p => p.name === "Liked Songs");
    if (!likedSongsPlaylist) {
        userData.playlists.push({
            id: 1,
            name: "Liked Songs",
            songs: userData.likedSongs
        });
    } else {
        likedSongsPlaylist.songs = userData.likedSongs;
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('currentUser', JSON.stringify(userData.currentUser));
    localStorage.setItem('playlists', JSON.stringify(userData.playlists));
    localStorage.setItem('likedSongs', JSON.stringify(userData.likedSongs));
    localStorage.setItem('recentlyPlayed', JSON.stringify(userData.recentlyPlayed));
}

// Authentication functions
function login(email, password) {
    // In a real app, this would make an API call
    const user = {
        email,
        name: email.split('@')[0], // Simple name generation
        id: Date.now().toString()
    };
    userData.currentUser = user;
    saveData();
    return user;
}

function logout() {
    userData.currentUser = null;
    saveData();
    window.location.href = 'login.html';
}

function signup(fullName, email, password) {
    // In a real app, this would make an API call
    const user = {
        fullName,
        email,
        id: Date.now().toString()
    };
    userData.currentUser = user;
    saveData();
    return user;
}

// Playlist management
function createPlaylist(name, description = '') {
    const playlist = {
        id: Date.now().toString(),
        name,
        description,
        songs: [],
        createdBy: userData.currentUser.id,
        createdAt: new Date().toISOString()
    };
    userData.playlists.push(playlist);
    saveData();
    return playlist;
}

function addSongToPlaylist(playlistId, song) {
    const playlist = userData.playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songs.push(song);
        saveData();
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    const playlist = userData.playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songs = playlist.songs.filter(s => s.id !== songId);
        saveData();
    }
}

// Like/Unlike songs
function toggleLikeSong(song) {
    const index = userData.likedSongs.findIndex(s => s.id === song.id);
    if (index === -1) {
        userData.likedSongs.push(song);
    } else {
        userData.likedSongs.splice(index, 1);
    }
    
    // Update liked songs playlist
    const likedSongsPlaylist = userData.playlists.find(p => p.name === "Liked Songs");
    if (likedSongsPlaylist) {
        likedSongsPlaylist.songs = userData.likedSongs;
    }
    
    saveData();
}

// Recently played
function addToRecentlyPlayed(song) {
    const index = userData.recentlyPlayed.findIndex(s => s.id === song.id);
    if (index !== -1) {
        userData.recentlyPlayed.splice(index, 1);
    }
    userData.recentlyPlayed.unshift(song);
    if (userData.recentlyPlayed.length > 50) {
        userData.recentlyPlayed.pop();
    }
    saveData();
}

// Navigation
function navigateTo(page) {
    if (!userData.currentUser && page !== 'login.html' && page !== 'signup.html') {
        window.location.href = 'login.html';
        return;
    }
    window.location.href = page;
}

// Initialize data when the script loads
initializeData();

// Export functions for use in HTML files
window.app = {
    login,
    logout,
    signup,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    toggleLikeSong,
    addToRecentlyPlayed,
    navigateTo,
    userData
}; 