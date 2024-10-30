import React from 'react';
import ReactImageMagnify from 'react-image-magnify';

function ImageZoomComponent({ src }) {
  const imageProps = {
    smallImage: {
      alt: 'Your Image',
      isFluidWidth: true,
      src,
    },
    largeImage: {
      alt: 'Your Image', // Alt text for the large image
      src,
      width: 1200,
      height: 1800,
    },
    enlargedImagePosition: 'over',
    isHintEnabled: true,
  };

  return <ReactImageMagnify {...imageProps} />;
}

export default ImageZoomComponent;
