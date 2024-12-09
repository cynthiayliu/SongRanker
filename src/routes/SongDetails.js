import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomButton from "../components/CustomButton";

function SongDetails() {
  const song = useLoaderData(); // Load the song details from the loader
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [album, setAlbum] = useState(null);

  // Update the page title dynamically
  useEffect(() => {
    const artistName = artist?.name || "Unknown Artist";
    document.title = `${song.title} by ${artistName}`;
  }, [song.title, artist]);

  // Fetch artist and album details on component load
  useEffect(() => {
    // Fetch the artist
    if (song.artistId) {
      fetch(`http://localhost:3001/artists/${song.artistId}`)
        .then((res) => res.json())
        .then((data) => setArtist(data))
        .catch(() => toast.error("Error loading artist details."));
    }

    // Fetch the album
    if (song.albumId) {
      fetch(`http://localhost:3001/albums/${song.albumId}`)
        .then((res) => res.json())
        .then((data) => setAlbum(data))
        .catch(() => toast.error("Error loading album details."));
    }
  }, [song.artistId, song.albumId]);

  return (
    <div className="container mt-4">
      <h1>Song Details</h1>
      <div>
        <p>
          <strong>Title:</strong> {song.title}
        </p>
        <p>
          <strong>Artist:</strong> {artist?.name || "Unknown"}
        </p>
        <p>
          <strong>Album:</strong> {album?.title || "Unknown"}
        </p>
        <p>
          <strong>Genre:</strong> {song.genre}
        </p>
        <p>
          <strong>Description:</strong> {song.description}
        </p>
        <CustomButton
          label="Back to Songs"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        />
      </div>
    </div>
  );
}

export default SongDetails;
