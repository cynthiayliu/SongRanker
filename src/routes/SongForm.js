import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomButton from "../components/CustomButton";

function SongForm() {
  const [form, setForm] = useState({
    title: "",
    artistId: "",
    albumId: "",
    genre: "",
    description: "",
  });

  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isNewArtist, setIsNewArtist] = useState(false);
  const [isNewAlbum, setIsNewAlbum] = useState(false);
  const [newArtist, setNewArtist] = useState("");
  const [newAlbum, setNewAlbum] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Fetch artists and albums on load
  useEffect(() => {
    document.title = 'Add Song';
    Promise.all([
      fetch("http://localhost:3001/artists").then((res) => res.json()),
      fetch("http://localhost:3001/albums").then((res) => res.json()),
    ])
      .then(([artistsData, albumsData]) => {
        setArtists(artistsData);
        setAlbums(albumsData);
      })
      .catch(() => toast.error("Error loading data."));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Validate Form Fields
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.genre.trim()) newErrors.genre = "Genre is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";
    if (!isNewArtist && !form.artistId)
      newErrors.artistId = "Please select an artist.";
    if (!isNewAlbum && !form.albumId)
      newErrors.albumId = "Please select an album.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      // Add new artist if needed
      if (isNewArtist && newArtist) {
        const artistRes = await fetch("http://localhost:3001/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newArtist }),
        });
        if (!artistRes.ok) throw new Error("Failed to add artist");

        const addedArtist = await artistRes.json();
        form.artistId = addedArtist.id;
        setArtists((prev) => [...prev, addedArtist]);
      }

      // Add new album if needed
      if (isNewAlbum && newAlbum) {
        const albumRes = await fetch("http://localhost:3001/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newAlbum,
            artistId: form.artistId,
          }),
        });
        if (!albumRes.ok) throw new Error("Failed to add album");

        const addedAlbum = await albumRes.json();
        form.albumId = addedAlbum.id;
        setAlbums((prev) => [...prev, addedAlbum]);
      }

      // Add new song
      const response = await fetch("http://localhost:3001/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to add the song");

      toast.success("Song added successfully!");
      navigate("/");

      // Reset Form After Submission
      setForm({
        title: "",
        artistId: "",
        albumId: "",
        genre: "",
        description: "",
      });
      setNewArtist("");
      setNewAlbum("");
      setIsNewArtist(false);
      setIsNewAlbum(false);
    } catch (error) {
      console.error("Error adding song:", error);
      toast.error("Failed to add the song.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Song</h2>
      <form onSubmit={handleSubmit}>
        {/* Song Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            value={form.title}
            onChange={handleChange}
            required
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>

        {/* Artist Selection */}
        <div className="mb-3">
          <label className="form-label">Artist</label>
          <div className="form-check mb-2">
            <input
              type="checkbox"
              id="newArtistCheck"
              className="form-check-input"
              checked={isNewArtist}
              onChange={() => setIsNewArtist(!isNewArtist)}
            />
            <label className="form-check-label" htmlFor="newArtistCheck">
              Add New Artist
            </label>
          </div>

          {isNewArtist ? (
            <input
              type="text"
              className="form-control"
              value={newArtist}
              placeholder="Enter new artist name"
              onChange={(e) => setNewArtist(e.target.value)}
              required
            />
          ) : (
            <select
              name="artistId"
              className={`form-select ${errors.artistId ? "is-invalid" : ""}`}
              value={form.artistId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select an artist
              </option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          )}
          {errors.artistId && (
            <div className="invalid-feedback">{errors.artistId}</div>
          )}
        </div>

        {/* Album Selection */}
        <div className="mb-3">
          <label className="form-label">Album</label>
          <div className="form-check mb-2">
            <input
              type="checkbox"
              id="newAlbumCheck"
              className="form-check-input"
              checked={isNewAlbum}
              onChange={() => setIsNewAlbum(!isNewAlbum)}
            />
            <label className="form-check-label" htmlFor="newAlbumCheck">
              Add New Album
            </label>
          </div>

          {isNewAlbum ? (
            <input
              type="text"
              className="form-control"
              value={newAlbum}
              placeholder="Enter new album title"
              onChange={(e) => setNewAlbum(e.target.value)}
              required
            />
          ) : (
            <select
              name="albumId"
              className={`form-select ${errors.albumId ? "is-invalid" : ""}`}
              value={form.albumId}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select an album
              </option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          )}
          {errors.albumId && (
            <div className="invalid-feedback">{errors.albumId}</div>
          )}
        </div>

        {/* Genre Radio Buttons */}
        <fieldset className="mb-3">
          <legend className="form-label">Genre</legend>
          {["Rock", "Pop", "Jazz", "Classical"].map((genre) => (
            <div key={genre} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="genre"
                id={`genre-${genre}`}
                value={genre}
                checked={form.genre === genre}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor={`genre-${genre}`}>
                {genre}
              </label>
            </div>
          ))}
          {errors.genre && (
            <div className="invalid-feedback d-block">{errors.genre}</div>
          )}
        </fieldset>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="3"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <CustomButton
          type="submit"
          label="Add Song"
          className="btn btn-success"
        />
      </form>
    </div>
  );
}

export default SongForm;
