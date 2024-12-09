import React, { useState, useEffect } from "react";
import SongList from "../routes/SongList";
import { toast } from "react-toastify";

function Songs() {
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);

  // Fetch songs and favorites on load
  useEffect(() => {
    document.title = 'Song List';
    Promise.all([
      fetch("http://localhost:3001/songs").then((res) => res.json()),
      fetch("http://localhost:3001/artists").then((res) => res.json()),
      fetch("http://localhost:3001/albums").then((res) => res.json()),
    ])
      .then(([songsData, artistsData, albumsData]) => {
        const enrichedSongs = songsData.map((song) => {
          const artist = artistsData.find(
            (artist) => artist.id === song.artistId
          );
          const album = albumsData.find((album) => album.id === song.albumId);
          return {
            ...song,
            artist,
            album,
          };
        });
        setSongs(enrichedSongs);
      })
      .catch(() => toast.error("Error loading data."));
    fetch("http://localhost:3001/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch(() => toast.error("Error loading favorites."));
  }, []);

  // Handle Add Song
  const handleAddSong = async (newSong) => {
    try {
      // Add Artist if New
      let artistId = newSong.artistId;
      if (newSong.isNewArtist && newSong.artist) {
        const artistResponse = await fetch("http://localhost:3001/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newSong.artist }),
        });

        if (!artistResponse.ok) throw new Error("Failed to add artist");

        const addedArtist = await artistResponse.json();
        artistId = addedArtist.id;

        // Update the artist list
        setArtists((prevArtists) => [...prevArtists, addedArtist]);
      }

      // Add Album if New
      let albumId = newSong.albumId;
      if (newSong.isNewAlbum && newSong.album) {
        const albumResponse = await fetch("http://localhost:3001/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newSong.album, artistId }),
        });

        if (!albumResponse.ok) throw new Error("Failed to add album");

        const addedAlbum = await albumResponse.json();
        albumId = addedAlbum.id;

        // Update the album list
        setAlbums((prevAlbums) => [...prevAlbums, addedAlbum]);
      }

      // Add the Song
      const songResponse = await fetch("http://localhost:3001/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSong,
          artistId,
          albumId,
        }),
      });

      if (!songResponse.ok) throw new Error("Failed to add song");

      const addedSong = await songResponse.json();
      setSongs((prevSongs) => [...prevSongs, addedSong]);
      toast.success("Song added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error adding song, artist, or album.");
    }
  };

  // Handle Delete Song
  const handleDeleteSong = async (id, albumId, artistId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    try {
      // Delete the song from the songs endpoint
      const response = await fetch(`http://localhost:3001/songs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete the song");

      // Update local state
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== id));

      // Check if the album is still used by another song
      const albumCheckResponse = await fetch(
        `http://localhost:3001/songs?albumId=${albumId}`
      );
      const albumSongs = await albumCheckResponse.json();

      if (albumSongs.length === 0) {
        const albumResponse = await fetch(
          `http://localhost:3001/albums/${albumId}`,
          { method: "DELETE" }
        );

        if (!albumResponse.ok) throw new Error("Failed to delete album");
        toast.info("Album deleted as it had no remaining songs.");
      }

      // Check if the artist is still used by another song
      const artistCheckResponse = await fetch(
        `http://localhost:3001/songs?artistId=${artistId}`
      );
      const artistSongs = await artistCheckResponse.json();

      if (artistSongs.length === 0) {
        const artistResponse = await fetch(
          `http://localhost:3001/artists/${artistId}`,
          { method: "DELETE" }
        );

        if (!artistResponse.ok) throw new Error("Failed to delete artist");
        toast.info("Artist deleted as they had no remaining songs.");
      }

      toast.success("Song, album, and artist deleted successfully if unused!");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting song, album, or artist.");
    }
  };

  const handleAddFavorite = async (songId) => {
    const newFavorite = {
      songId,
      bookmarkedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3001/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFavorite),
      });

      if (!response.ok) throw new Error("Failed to add to favorites");

      const addedFavorite = await response.json();
      setFavorites((prevFavorites) => [...prevFavorites, addedFavorite]);
      toast.success("Added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Failed to add to favorites.");
    }
  };

  const handleRemoveFavorite = async (songId) => {
    const favorite = favorites.find((fav) => fav.songId === songId);

    if (!favorite) {
      toast.error("Favorite not found.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/favorites/${favorite.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to remove from favorites");

      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav.songId !== songId)
      );
      toast.success("Removed from favorites!");
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast.error("Failed to remove from favorites.");
    }
  };

  return (
    <div>
      <SongList
        songs={songs}
        favorites={favorites}
        onDeleteSong={handleDeleteSong}
        onAddFavorite={handleAddFavorite} // Pass Add Favorite handler
        onRemoveFavorite={handleRemoveFavorite} // Pass Remove Favorite handler
      />
    </div>
  );
}

export default Songs;
