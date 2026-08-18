(() => {
  "use strict";

  const overlays = new WeakMap();

  function isServiceM8Pdf(url) {
    try {
      const parsed = new URL(url);

      const validHost =
        /^servicem8-temp-[a-z0-9-]+\.s3\.[a-z0-9-]+\.amazonaws\.com$/i
          .test(parsed.hostname);

      const validPath =
        parsed.pathname.includes(
          "/bucket-type-temp/plugin_job_card/pdf_preview/"
        );

      return validHost && validPath;
    } catch {
      return false;
    }
  }

  function updatePdfOverlays() {
    for (const original of document.querySelectorAll("iframe")) {
      if (original.dataset.sm8FastPdfOverlay === "1") {
        continue;
      }

      const url = original.src || "";
      const existing = overlays.get(original);

      if (!isServiceM8Pdf(url)) {
        if (existing) {
          existing.remove();
          overlays.delete(original);
        }
        continue;
      }

      let fast = existing;

      if (!fast || !fast.isConnected) {
        fast = original.cloneNode(false);

        fast.id =
          "sm8-fast-pdf-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2);

        fast.removeAttribute("src");
        fast.removeAttribute("name");
        fast.dataset.sm8FastPdfOverlay = "1";

        fast.style.cssText = [
          "position:absolute",
          "left:0",
          "top:0",
          "width:100%",
          "height:100%",
          "margin:0",
          "border:0",
          "z-index:9999",
          "background:white"
        ].join(";");

        original.parentElement.appendChild(fast);
        overlays.set(original, fast);
      }

      if (fast.src !== url) {
        fast.src = url;
      }
    }
  }

  const observer = new MutationObserver(updatePdfOverlays);

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"]
  });

  updatePdfOverlays();
})();
