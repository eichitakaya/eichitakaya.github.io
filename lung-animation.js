(function () {
  const character = document.querySelector(".hero-character");
  if (!character) return;

  const video = character.querySelector(".hero-character__video");
  const image = character.querySelector(".hero-character__png");
  const frameCount = 145;
  const framesPerSecond = 24;
  const frameDuration = 1000 / framesPerSecond;
  const framePath = (frameIndex) =>
    `pulpul-lunglung/hopping/pullung${String(frameIndex).padStart(4, "0")}.png`;

  let pngAnimationStarted = false;
  let animationFrameId;

  const startPngAnimation = () => {
    if (pngAnimationStarted) return;
    pngAnimationStarted = true;
    character.dataset.media = "png";

    const preloadFrame = (frameIndex) => new Promise((resolve, reject) => {
      const frame = new Image();
      frame.decoding = "async";
      frame.addEventListener("load", () => resolve(frame), { once: true });
      frame.addEventListener("error", reject, { once: true });
      frame.src = framePath(frameIndex);
    });

    Promise.all(Array.from({ length: frameCount }, (_, frameIndex) => preloadFrame(frameIndex)))
      .then((frames) => {
        const startedAt = performance.now();
        let displayedFrame = 0;

        const renderFrame = (now) => {
          const frameIndex = Math.floor((now - startedAt) / frameDuration) % frameCount;
          if (frameIndex !== displayedFrame) {
            image.src = frames[frameIndex].src;
            displayedFrame = frameIndex;
          }
          animationFrameId = requestAnimationFrame(renderFrame);
        };

        animationFrameId = requestAnimationFrame(renderFrame);
      })
      .catch(() => {
        // Keep the already visible default pose if any PNG cannot be loaded.
      });
  };

  const canPlayWebM = video.canPlayType("video/webm; codecs=vp9") !== "";
  if (!canPlayWebM) {
    startPngAnimation();
    return;
  }

  const usePngFallback = () => {
    cancelAnimationFrame(animationFrameId);
    video.pause();
    video.removeEventListener("error", usePngFallback);
    startPngAnimation();
  };

  const videoRendersTransparency = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return false;

    canvas.width = 1;
    canvas.height = 1;
    context.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[3] === 0;
  };

  const waitForFirstVideoFrame = () => new Promise((resolve) => {
    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(resolve);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  video.addEventListener("error", usePngFallback, { once: true });
  video.play()
    .then(waitForFirstVideoFrame)
    .then(() => {
      if (videoRendersTransparency()) {
        character.dataset.media = "video";
        return;
      }
      usePngFallback();
    })
    .catch(usePngFallback);
}());
