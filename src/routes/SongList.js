import React from "react";
import CustomButton from "../components/CustomButton";

function SongList({
  songs,
  onDeleteSong,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
}) {
  const isFavorited = (songId) =>
    favorites.some((favorite) => favorite.songId === songId);

  return (
    <div>
      {songs.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No songs available. <a href="/songs/form">Add a new song!</a>
        </div>
      ) : (
        songs.map((song) => (
          <div key={song.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{song.title}</h5>
              <p>
                <strong>Artist:</strong> {song.artist?.name || "Unknown"}
              </p>
              <p>
                <strong>Album:</strong> {song.album?.title || "Unknown"}
              </p>

              {/* View Details Button */}
              <CustomButton
                label="🔍 View Details"
                className="btn btn-primary me-2"
                onClick={() => (window.location.href = `/songs/${song.id}`)}
              />

              {/* Edit Button */}
              <CustomButton
                label="✏️ Edit"
                className="btn btn-warning me-2"
                onClick={() => (window.location.href = `/songs/${song.id}/edit`)}
              />

              {/* Delete Button */}
              <CustomButton
                label="❌ Delete"
                className="btn btn-secondary me-2"
                onClick={() =>
                  onDeleteSong(song.id, song.albumId, song.artistId)
                }
              />

              {/* Add/Remove from Favorites Button */}
              {isFavorited(song.id) ? (
                <CustomButton
                  label="Remove from Favorites"
                  className="btn btn-danger"
                  onClick={() => onRemoveFavorite(song.id)}
                />
              ) : (
                <CustomButton
                  label="Add to Favorites"
                  className="btn btn-success"
                  onClick={() => onAddFavorite(song.id)}
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SongList;
