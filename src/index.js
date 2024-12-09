import "bootstrap/dist/css/bootstrap.css";
import reportWebVitals from "./reportWebVitals";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import Root from "./routes/Root";
import Songs from "./routes/Songs";
import SongDetails from "./routes/SongDetails";
import EditSong from "./routes/EditSong";
import SongForm from "./routes/SongForm";
import Favorites from "./routes/Favorites";


// Define routes
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Songs /> },
      { path: "/favorites", element: <Favorites /> },
      {
        path: "/songs/:id",
        element: <SongDetails />,
        loader: ({ params }) =>
          fetch(
            `http://localhost:3001/songs/${params.id}?_expand=artist&_expand=album`
          ).then((res) => res.json()),
      },
      {
        path: "/songs/form",
        element: <SongForm />,
      },
      {
        path: "/songs/:id/edit",
        element: <EditSong />,
        loader: ({ params }) =>
          fetch(
            `http://localhost:3001/songs/${params.id}?_expand=artist&_expand=album`
          ).then((res) => res.json()),
      },
    ],
  },
]);

// Render application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  </React.StrictMode>
);

reportWebVitals();
