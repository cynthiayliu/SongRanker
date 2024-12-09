import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomButton from "../components/CustomButton";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch favorites on component load
  useEffect(() => {
    document.title = 'Favorites';
    fetchFavorites();
  }, []);

  // Handle Likes and Unlikes
  const handleLikeClick = async (favorite, action) => {
    const updatedLikes =
      action === "like" ? favorite.likes + 1 : Math.max(favorite.likes - 1, 0);

    // Optimistically update UI
    const updatedFavorites = favorites.map((f) =>
      f.id === favorite.id ? { ...f, likes: updatedLikes } : f
    );
    setFavorites(updatedFavorites.sort((a, b) => b.likes - a.likes));

    try {
      const rankUrl = `http://localhost:3001/ranks?songId=${favorite.songId}`;
      const response = await fetch(rankUrl);
      const ranks = await response.json();

      if (updatedLikes === 0) {
        // Delete rank when likes are zero
        if (ranks.length > 0) {
          await fetch(`http://localhost:3001/ranks/${ranks[0].id}`, {
            method: "DELETE",
          });
        }
      } else if (ranks.length > 0) {
        // Update existing rank
        await fetch(`http://localhost:3001/ranks/${ranks[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likes: updatedLikes }),
        });
      } else {
        // Create new rank
        await fetch("http://localhost:3001/ranks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songId: favorite.songId,
            likes: updatedLikes,
          }),
        });
      }

      toast.success(action === "like" ? "Liked!" : "Unliked!");
    } catch (error) {
      console.error("Failed to update like status:", error);
      toast.error("Failed to update like status.");
    }
  };

  // Remove Favorite and Clean Ranks
  const handleRemoveFavorite = async (favoriteId, songId) => {
    try {
      // Get ranks tied to the songId
      const rankResponse = await fetch(
        `http://localhost:3001/ranks?songId=${songId}`
      );
      const ranks = await rankResponse.json();

      // Delete the favorite and its associated rank
      await Promise.all([
        fetch(`http://localhost:3001/favorites/${favoriteId}`, {
          method: "DELETE",
        }),
        ...ranks.map((rank) =>
          fetch(`http://localhost:3001/ranks/${rank.id}`, { method: "DELETE" })
        ),
      ]);

      // Update local state
      const updatedFavorites = favorites.filter((f) => f.id !== favoriteId);
      setFavorites(updatedFavorites);

      toast.error("Removed from Favorites and Rank Cleaned!");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Error removing from favorites.");
    }
  };

  // Fetch Favorites and Ranks Cleanly
  const fetchFavorites = async () => {
    try {
      const responses = await Promise.all([
        fetch("http://localhost:3001/favorites").then((res) => res.json()),
        fetch("http://localhost:3001/songs").then((res) => res.json()),
        fetch("http://localhost:3001/artists").then((res) => res.json()),
        fetch("http://localhost:3001/albums").then((res) => res.json()),
        fetch("http://localhost:3001/ranks").then((res) => res.json()),
      ]);

      const [favoritesData, songsData, artistsData, albumsData, ranksData] =
        responses;

      const enrichedFavorites = favoritesData.map((favorite) => {
        const song = songsData.find((s) => s.id === favorite.songId);
        const artist = song
          ? artistsData.find((a) => a.id === song.artistId)
          : null;
        const album = song
          ? albumsData.find((a) => a.id === song.albumId)
          : null;
        const rank = ranksData.find((r) => r.songId === favorite.songId);

        return {
          ...favorite,
          song: song ? { ...song, artist, album } : null,
          likes: rank ? rank.likes : 0,
        };
      });

      setFavorites(enrichedFavorites.sort((a, b) => b.likes - a.likes));
      setLoading(false);
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast.error("Error loading favorites.");
      setLoading(false);
    }
  };


  // Calculate Total Likes
  const calculateLikes = (songId, ranksData) => {
    const rank = ranksData.find((rank) => rank.songId === songId);
    return rank ? rank.likes : 0;
  };
  
  // Open Song Details
  const handleViewDetails = (song) => {
    setSelectedSong(song);
  };

  // Close Modal
  const closeModal = () => {
    setSelectedSong(null);
  };

  return (
    <div className="container mt-4">
      <h1>Favorites</h1>

      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length > 0 ? (
        <div className="favorites-list">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  {favorite.song?.title || "Unknown"}
                </h5>
                <p>
                  <strong>Artist:</strong>{" "}
                  {favorite.song?.artist?.name || "Unknown"}
                </p>
                <p>
                  <strong>Album:</strong>{" "}
                  {favorite.song?.album?.title || "Unknown"}
                </p>
                <p>
                  <strong>Likes:</strong> {favorite.likes}
                </p>
                <div className="btn-group">
                  <CustomButton
                    type="button"
                    label="👍 Like"
                    className="btn btn-success"
                    onClick={() => handleLikeClick(favorite, "like")}
                  />
                  <CustomButton
                    type="button"
                    label="👎 Unlike"
                    className="btn btn-danger ms-2"
                    onClick={() => handleLikeClick(favorite, "unlike")}
                  />
                  <CustomButton
                    type="button"
                    label="❌ Remove"
                    className="btn btn-warning ms-2"
                    onClick={() =>
                      handleRemoveFavorite(favorite.id, favorite.songId)
                    }
                  />
                  <CustomButton
                    type="button"
                    label="🔍 View Details"
                    className="btn btn-info ms-2"
                    onClick={() => handleViewDetails(favorite.song)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center" role="alert">
          No favorites available. <a href="/">Add a new favorite!</a>
        </div>
      )}

      {selectedSong && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Song Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Title:</strong> {selectedSong.title || "Unknown"}
                </p>
                <p>
                  <strong>Artist:</strong>{" "}
                  {selectedSong.artist?.name || "Unknown"}
                </p>
                <p>
                  <strong>Album:</strong>{" "}
                  {selectedSong.album?.title || "Unknown"}
                </p>
                <p>
                  <strong>Genre:</strong> {selectedSong.genre || "Unknown"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedSong.description || "No description available"}
                </p>
              </div>
              <div className="modal-footer">
                <CustomButton
                  type="button"
                  label="❌ Close"
                  className="btn btn-secondary"
                  onClick={closeModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
