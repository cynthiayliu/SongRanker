import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import SongDetails from "./SongDetails";
import EditSong from "./EditSong";
import Favorites from "./Favorites";
import SongForm from "./SongForm";
import CustomButton from "./CustomButton";
import Songs from "./Songs";

// Mock Fetch Implementation
global.fetch = jest.fn();

test("renders song title and artist in SongDetails", async () => {
  // Arrange
  const song = {
    title: "Imagine",
    genre: "Pop",
    description: "A classic song by John Lennon",
    artistId: "1",
  };

  const artist = { id: "1", name: "John Lennon" };
  fetch.mockResolvedValueOnce({
    json: async () => artist,
  });

  // Act
  render(<SongDetails song={song} />);

  // Assert
  expect(screen.getByText("Song Details")).toBeInTheDocument();
  expect(screen.getByText("Title: Imagine")).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText("Artist: John Lennon")).toBeInTheDocument();
  });
});

test("renders EditSong form fields", () => {
  // Arrange & Act
  render(<EditSong />);

  // Assert
  expect(screen.getByLabelText("Title")).toBeInTheDocument();
  expect(screen.getByLabelText("Artist Name")).toBeInTheDocument();
  expect(screen.getByLabelText("Album Title")).toBeInTheDocument();
  expect(screen.getByLabelText("Genre")).toBeInTheDocument();
  expect(screen.getByLabelText("Description")).toBeInTheDocument();
});

test("CustomButton triggers click event", () => {
  // Arrange
  const onClickMock = jest.fn();

  // Act
  render(
    <CustomButton
      label="Click Me"
      className="btn-primary"
      onClick={onClickMock}
    />
  );
  fireEvent.click(screen.getByText("Click Me"));

  // Assert
  expect(onClickMock).toHaveBeenCalledTimes(1);
});

test("renders empty Songs list", async () => {
  // Arrange
  fetch.mockResolvedValueOnce({
    json: async () => [],
  });

  // Act
  render(<Songs />);

  // Assert
  expect(screen.getByText("No songs available.")).toBeInTheDocument();
});

test("Favorites loads without songs", async () => {
  // Arrange
  fetch.mockResolvedValueOnce({
    json: async () => [],
  });

  // Act
  render(<Favorites />);

  // Assert
  expect(
    screen.getByText("No favorites available. Add a new favorite!")
  ).toBeInTheDocument();
});

test("SongForm shows validation error on empty submit", () => {
  // Arrange
  render(<SongForm />);

  // Act
  fireEvent.click(screen.getByText("Add Song"));

  // Assert
  expect(
    screen.getByText("Please fill out all required fields.")
  ).toBeInTheDocument();
});

test("Favorites Add triggers fetch call", async () => {
  // Arrange
  fetch.mockResolvedValueOnce({
    json: async () => ({ id: "1", songId: "1" }),
  });

  // Act
  render(<Favorites />);
  fireEvent.click(screen.getByText("👍 Like"));

  // Assert
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/favorites",
      expect.any(Object)
    );
  });
});

test("View Details navigates correctly", () => {
  // Arrange & Act
  render(<Songs />);
  fireEvent.click(screen.getByText("🔍 View Details"));

  // Assert
  expect(window.location.href).toContain("/songs/");
});

test("Navbar has correct navigation links", () => {
  // Arrange & Act
  render(<Songs />);

  // Assert
  expect(screen.getByText("Songs")).toBeInTheDocument();
  expect(screen.getByText("Submit Song")).toBeInTheDocument();
  expect(screen.getByText("Favorites")).toBeInTheDocument();
});

test("Removing favorite triggers DELETE call", async () => {
  // Arrange
  fetch.mockResolvedValueOnce({
    json: async () => [{ id: "1", songId: "1" }],
  });

  // Act
  render(<Favorites />);
  fireEvent.click(screen.getByText("❌ Remove"));

  // Assert
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/favorites/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
