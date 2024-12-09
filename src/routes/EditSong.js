import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomButton from "../components/CustomButton";

function EditSong() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    artistName: "",
    albumTitle: "",
    genre: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch song details
    fetch(`http://localhost:3001/songs/${id}`)
      .then((res) => res.json())
      .then((songData) => {
        setForm(songData);

        // Set page title based on song title
        document.title = `Edit Song: ${songData.title || "Untitled Song"}`;
      })
      .catch(() => {
        toast.error("Error loading song details.");
        document.title = "Error - Edit Song";
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.genre.trim()) newErrors.genre = "Genre is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";
    if (!form.artistName.trim())
      newErrors.artistName = "Artist name is required.";
    if (!form.albumTitle.trim())
      newErrors.albumTitle = "Album title is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please correct the form errors.");
      return;
    }

    try {
      await fetch(`http://localhost:3001/songs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      toast.success("Song updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Error updating song.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Song</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
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

        {/* Artist */}
        <div className="mb-3">
          <label className="form-label">Artist Name</label>
          <input
            type="text"
            name="artistName"
            className={`form-control ${errors.artistName ? "is-invalid" : ""}`}
            value={form.artistName}
            onChange={handleChange}
            required
          />
          {errors.artistName && (
            <div className="invalid-feedback">{errors.artistName}</div>
          )}
        </div>

        {/* Album */}
        <div className="mb-3">
          <label className="form-label">Album Title</label>
          <input
            type="text"
            name="albumTitle"
            className={`form-control ${errors.albumTitle ? "is-invalid" : ""}`}
            value={form.albumTitle}
            onChange={handleChange}
            required
          />
          {errors.albumTitle && (
            <div className="invalid-feedback">{errors.albumTitle}</div>
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
        </fieldset>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            rows="3"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>

        <CustomButton
          type="submit"
          label="Update Song"
          className="btn btn-success"
        />
        <CustomButton
          type="button"
          label="Cancel"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/")}
        />
      </form>
    </div>
  );
}

export default EditSong;
