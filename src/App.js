import React from 'react';
import ImageGallery from "react-image-gallery";
// import stylesheet if you're not already using CSS @import
import "react-image-gallery/styles/css/image-gallery.css";

const doUpload = () => {
  const myInput = document.getElementById('my-input');
  // Later, perhaps in a form 'submit' handler or the input's 'change' handler:
  fetch('https://localhost:4000/upload', {
    method: 'POST',
    body: myInput.files[0],
  });
}


const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
  },
];

const App = () => {
  return(
    <div className="appContainer">
      <div className="optionsContainer">
        <ImageGallery showNav="false" className="fit-element"  showThumbnails={false} showFullscreenButton={false} showPlayButton={false} items={images} />
      </div>
      <div>
      <form action="http://localhost:4000/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*"/>
        <button type="submit">Upload Image</button>
      </form>
      </div>
    </div>
  );
}

export default App