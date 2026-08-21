(() => {
  "use strict";

  const DEFAULTS = {
    fastPdfPreview: true,
    autoSizePdfWindows: true,
    actualSizePdf: true,
    compactUi: true,
    uiScalePercent: 85
  };

  let settings = { ...DEFAULTS };

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

  function isServiceM8PopupPdf(url) {
    try {
      const parsed = new URL(url);

      if (isServiceM8Pdf(url)) {
        return true;
      }

      const isDataCdn =
        /^data-cdn-[a-z0-9-]+\.servicem8\.com$/i.test(parsed.hostname);

      const isAttachment =
        parsed.pathname.startsWith("/attachments/");

      const isPdf =
        /\.pdf$/i.test(parsed.pathname);

      return isDataCdn && isAttachment && isPdf;
    } catch {
      return false;
    }
  }

  function setZoomParameter(url, enabled) {
    try {
      const parsed = new URL(url);
      const params = new URLSearchParams(
        parsed.hash.startsWith("#")
          ? parsed.hash.slice(1)
          : parsed.hash
      );

      if (enabled) {
        params.set("zoom", "100");
      } else if (params.get("zoom") === "100") {
        params.delete("zoom");
      }

      parsed.hash = params.toString();
      return parsed.href;
    } catch {
      return url;
    }
  }

  function updateActualSizePdfIframes() {
    for (const iframe of document.querySelectorAll("iframe")) {
      if (iframe.dataset.sm8FastPdfOverlay === "1") {
        continue;
      }

      const currentUrl = iframe.src || "";

      if (!isServiceM8PopupPdf(currentUrl)) {
        continue;
      }

      if (settings.actualSizePdf) {
        const desiredUrl = setZoomParameter(currentUrl, true);

        if (desiredUrl !== currentUrl) {
          iframe.dataset.sm8ActualSizeApplied = "1";
          iframe.src = desiredUrl;
        }
      } else if (iframe.dataset.sm8ActualSizeApplied === "1") {
        const desiredUrl = setZoomParameter(currentUrl, false);

        delete iframe.dataset.sm8ActualSizeApplied;

        if (desiredUrl !== currentUrl) {
          iframe.src = desiredUrl;
        }
      }
    }
  }

  function windowContainsServiceM8Pdf(win) {
    return [...win.querySelectorAll("iframe")].some(iframe => {
      if (iframe.dataset.sm8FastPdfOverlay === "1") {
        return false;
      }

      return isServiceM8PopupPdf(iframe.src || "");
    });
  }

  function getExtWindowComponent(win) {
    try {
      const pageWindow = window.wrappedJSObject;

      if (!pageWindow || !pageWindow.Ext) {
        return null;
      }

      const Ext = pageWindow.Ext;
      let component = null;

      if (win.id && typeof Ext.getCmp === "function") {
        component = Ext.getCmp(win.id);
      }

      if (
        !component &&
        Ext.ComponentMgr &&
        Ext.ComponentMgr.all &&
        typeof Ext.ComponentMgr.all.each === "function"
      ) {
        Ext.ComponentMgr.all.each(cmp => {
          if (component) {
            return;
          }

          try {
            if (
              cmp.getEl &&
              cmp.getEl() &&
              cmp.getEl().dom === win.wrappedJSObject
            ) {
              component = cmp;
            }
          } catch {
            // Ignore unrelated or partially destroyed components.
          }
        });
      }

      return component;
    } catch {
      return null;
    }
  }

  function getPdfWindowTargetWidth(win) {
    const title =
      win.querySelector(".x-window-header-text")
        ?.textContent
        ?.trim();

    if (title === "Custom Invoice") {
      return 1200;
    }

    return 900;
  }

  function restorePdfWindowSize(win) {
    const originalWidth =
      Number(win.dataset.sm8OriginalWidth);

    if (!Number.isFinite(originalWidth) || originalWidth <= 0) {
      delete win.dataset.sm8AutoSizeWidth;
      delete win.dataset.sm8OriginalWidth;
      return;
    }

    const component = getExtWindowComponent(win);

    if (
      component &&
      typeof component.setWidth === "function"
    ) {
      component.setWidth(originalWidth);

      if (typeof component.doLayout === "function") {
        component.doLayout();
      }

      if (typeof component.center === "function") {
        component.center();
      }
    }

    delete win.dataset.sm8AutoSizeWidth;
    delete win.dataset.sm8OriginalWidth;
  }

  function autoSizePdfWindows() {
    for (const win of document.querySelectorAll(".x-window")) {
      if (!windowContainsServiceM8Pdf(win)) {
        continue;
      }

      if (
        !settings.autoSizePdfWindows ||
        !settings.actualSizePdf
      ) {
        if (win.dataset.sm8OriginalWidth) {
          restorePdfWindowSize(win);
        }

        continue;
      }

      const component = getExtWindowComponent(win);

      if (
        !component ||
        typeof component.getWidth !== "function" ||
        typeof component.setWidth !== "function"
      ) {
        continue;
      }

      if (!win.dataset.sm8OriginalWidth) {
        const originalWidth = component.getWidth();

        if (
          Number.isFinite(originalWidth) &&
          originalWidth > 0
        ) {
          win.dataset.sm8OriginalWidth =
            String(originalWidth);
        }
      }

      const targetWidth =
        getPdfWindowTargetWidth(win);

      const viewportLimit =
        Math.max(320, window.innerWidth - 40);

      const desiredWidth =
        Math.min(targetWidth, viewportLimit);

      if (
        win.dataset.sm8AutoSizeWidth ===
        String(desiredWidth)
      ) {
        continue;
      }

      component.setWidth(desiredWidth);

      if (typeof component.doLayout === "function") {
        component.doLayout();
      }

      if (typeof component.center === "function") {
        component.center();
      }

      win.dataset.sm8AutoSizeWidth =
        String(desiredWidth);
    }
  }

  function getUiScale() {
    const percent =
      Number(settings.uiScalePercent);

    const safePercent =
      Math.min(
        100,
        Math.max(
          75,
          Number.isFinite(percent)
            ? percent
            : 85
        )
      );

    return safePercent / 100;
  }

  function isVisibleElement(el) {
    const style =
      getComputedStyle(el);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }

  function getMainUiRoots() {
    return [...document.body.children].filter(el => {
      if (!(el instanceof HTMLElement)) {
        return false;
      }

      if (
        el.matches(
          ".x-window, .ext-el-mask, .x-tip, .x-layer, " +
          "iframe, script, style, link, pre"
        )
      ) {
        return false;
      }

      if (!isVisibleElement(el)) {
        return false;
      }

      if (el.id === "header") {
        return true;
      }

      const rect =
        el.getBoundingClientRect();

      return (
        rect.width > 500 &&
        rect.height > 100 &&
        (
          el.classList.contains("x-border-panel") ||
          el.classList.contains("x-tab-panel") ||
          el.classList.contains("x-panel")
        )
      );
    });
  }

  function rememberMainUiRoot(el) {
    if (el.dataset.sm8CompactRoot === "1") {
      return;
    }

    el.dataset.sm8CompactRoot = "1";

    el.dataset.sm8CompactOriginalZoom =
      el.style.zoom || "__empty__";

    el.dataset.sm8CompactOriginalWidth =
      el.style.width || "__empty__";

    const component =
      getExtWindowComponent(el);

    if (
      component &&
      typeof component.getWidth === "function"
    ) {
      const width =
        component.getWidth();

      if (
        Number.isFinite(width) &&
        width > 0
      ) {
        el.dataset.sm8CompactOriginalComponentWidth =
          String(width);
      }
    }
  }

  function restoreMainUiRoot(el) {
    const component =
      getExtWindowComponent(el);

    const componentWidth =
      Number(
        el.dataset.sm8CompactOriginalComponentWidth
      );

    if (
      component &&
      Number.isFinite(componentWidth) &&
      componentWidth > 0 &&
      typeof component.setWidth === "function"
    ) {
      component.setWidth(componentWidth);

      if (typeof component.doLayout === "function") {
        component.doLayout();
      }
    } else {
      const originalWidth =
        el.dataset.sm8CompactOriginalWidth;

      if (
        originalWidth &&
        originalWidth !== "__empty__"
      ) {
        el.style.width = originalWidth;
      } else {
        el.style.removeProperty("width");
      }
    }

    const originalZoom =
      el.dataset.sm8CompactOriginalZoom;

    if (
      originalZoom &&
      originalZoom !== "__empty__"
    ) {
      el.style.zoom = originalZoom;
    } else {
      el.style.removeProperty("zoom");
    }

    delete el.dataset.sm8CompactRoot;
    delete el.dataset.sm8CompactOriginalZoom;
    delete el.dataset.sm8CompactOriginalWidth;
    delete el.dataset.sm8CompactOriginalComponentWidth;
  }

  function applyMainUiScale(scale) {
    for (const el of getMainUiRoots()) {
      rememberMainUiRoot(el);

      el.style.zoom =
        String(scale);

      const left =
        Number.parseFloat(el.style.left) || 0;

      const rightMargin =
        el.id === "header"
          ? 0
          : left;

      const availableWidth =
        Math.max(
          320,
          window.innerWidth -
            left -
            rightMargin
        );

      const targetWidth =
        Math.ceil(
          availableWidth / scale
        );

      const component =
        getExtWindowComponent(el);

      if (
        component &&
        typeof component.setWidth === "function"
      ) {
        component.setWidth(targetWidth);

        if (typeof component.doLayout === "function") {
          component.doLayout();
        }
      } else {
        el.style.width =
          `${targetWidth}px`;
      }
    }
  }

  function rememberPopupTransform(win) {
    if (win.dataset.sm8CompactPopup === "1") {
      return;
    }

    win.dataset.sm8CompactPopup = "1";

    win.dataset.sm8CompactOriginalTransform =
      win.style.transform || "__empty__";

    win.dataset.sm8CompactOriginalTransformOrigin =
      win.style.transformOrigin || "__empty__";
  }

  function restorePopupScale(win) {
    const originalTransform =
      win.dataset.sm8CompactOriginalTransform;

    const originalTransformOrigin =
      win.dataset.sm8CompactOriginalTransformOrigin;

    if (
      originalTransform &&
      originalTransform !== "__empty__"
    ) {
      win.style.transform = originalTransform;
    } else {
      win.style.removeProperty("transform");
    }

    if (
      originalTransformOrigin &&
      originalTransformOrigin !== "__empty__"
    ) {
      win.style.transformOrigin =
        originalTransformOrigin;
    } else {
      win.style.removeProperty("transform-origin");
    }

    const component =
      getExtWindowComponent(win);

    if (
      component &&
      typeof component.center === "function"
    ) {
      component.center();
    }

    delete win.dataset.sm8CompactPopup;
    delete win.dataset.sm8CompactPopupScale;
    delete win.dataset.sm8CompactOriginalTransform;
    delete win.dataset.sm8CompactOriginalTransformOrigin;
  }

  function centreScaledPopup(win) {
    const component =
      getExtWindowComponent(win);

    if (
      !component ||
      typeof component.getPosition !== "function" ||
      typeof component.setPosition !== "function"
    ) {
      return;
    }

    const rect =
      win.getBoundingClientRect();

    const deltaX =
      (window.innerWidth / 2) -
      (rect.left + rect.width / 2);

    const deltaY =
      (window.innerHeight / 2) -
      (rect.top + rect.height / 2);

    const position =
      component.getPosition();

    if (
      !Array.isArray(position) ||
      position.length < 2
    ) {
      return;
    }

    /*
     * CSS transform preserves the element's top-left
     * positioning coordinate, so the visual centring
     * correction is applied directly rather than being
     * divided by the scale as it was for CSS zoom.
     */
    component.setPosition(
      position[0] + deltaX,
      position[1] + deltaY
    );
  }

  function applyPopupScale(scale) {
    for (
      const win of
      document.querySelectorAll(".x-window")
    ) {
      if (!isVisibleElement(win)) {
        continue;
      }

      /*
       * Never scale PDF-containing windows.
       * Their embedded PDF needs to remain at a true
       * device-pixel scale for crisp rendering.
       */
      if (windowContainsServiceM8Pdf(win)) {
        if (win.dataset.sm8CompactPopup === "1") {
          restorePopupScale(win);
        }

        continue;
      }

      rememberPopupTransform(win);

      if (
        win.dataset.sm8CompactPopupScale ===
        String(scale)
      ) {
        continue;
      }

      win.style.transformOrigin = "0 0";
      win.style.transform = `scale(${scale})`;

      centreScaledPopup(win);

      win.dataset.sm8CompactPopupScale =
        String(scale);
    }
  }

  function rememberFloatingMenu(menu) {
    if (menu.dataset.sm8CompactMenu === "1") {
      return;
    }

    menu.dataset.sm8CompactMenu = "1";

    menu.dataset.sm8CompactOriginalTransform =
      menu.style.transform || "__empty__";

    menu.dataset.sm8CompactOriginalTransformOrigin =
      menu.style.transformOrigin || "__empty__";
  }

  function restoreFloatingMenu(menu) {
    const originalTransform =
      menu.dataset.sm8CompactOriginalTransform;

    const originalTransformOrigin =
      menu.dataset.sm8CompactOriginalTransformOrigin;

    if (
      originalTransform &&
      originalTransform !== "__empty__"
    ) {
      menu.style.transform = originalTransform;
    } else {
      menu.style.removeProperty("transform");
    }

    if (
      originalTransformOrigin &&
      originalTransformOrigin !== "__empty__"
    ) {
      menu.style.transformOrigin =
        originalTransformOrigin;
    } else {
      menu.style.removeProperty("transform-origin");
    }

    delete menu.dataset.sm8CompactMenu;
    delete menu.dataset.sm8CompactMenuScale;
    delete menu.dataset.sm8CompactOriginalTransform;
    delete menu.dataset.sm8CompactOriginalTransformOrigin;
  }

  function applyFloatingMenuScale(scale) {
    for (
      const menu of
      document.querySelectorAll(
        ".x-menu.x-menu-floating.x-layer"
      )
    ) {
      if (!isVisibleElement(menu)) {
        continue;
      }

      if (
        menu.dataset.sm8CompactMenuScale ===
        String(scale)
      ) {
        continue;
      }

      rememberFloatingMenu(menu);

      menu.style.transformOrigin = "0 0";
      menu.style.transform = `scale(${scale})`;

      menu.dataset.sm8CompactMenuScale =
        String(scale);
    }
  }

  function restoreCompactUi() {
    for (
      const el of
      document.querySelectorAll(
        '[data-sm8-compact-root="1"]'
      )
    ) {
      restoreMainUiRoot(el);
    }

    for (
      const win of
      document.querySelectorAll(
        '[data-sm8-compact-popup="1"]'
      )
    ) {
      restorePopupScale(win);
    }

    for (
      const menu of
      document.querySelectorAll(
        '[data-sm8-compact-menu="1"]'
      )
    ) {
      restoreFloatingMenu(menu);
    }
  }

  function updateCompactUi() {
    const scale =
      getUiScale();

    if (
      !settings.compactUi ||
      scale >= 1
    ) {
      restoreCompactUi();
      return;
    }

    applyMainUiScale(scale);
    applyPopupScale(scale);
    applyFloatingMenuScale(scale);
  }

  function removePdfOverlays() {
    for (
      const overlay of
      document.querySelectorAll(
        'iframe[data-sm8-fast-pdf-overlay="1"]'
      )
    ) {
      overlay.remove();
    }
  }

  function updatePdfOverlays() {
    updateCompactUi();
    updateActualSizePdfIframes();
    autoSizePdfWindows();

    if (!settings.fastPdfPreview) {
      removePdfOverlays();
      return;
    }

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

  async function loadSettings() {
    settings = await browser.storage.local.get(DEFAULTS);
    updatePdfOverlays();
  }

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    let relevantChange = false;

    for (const key of Object.keys(DEFAULTS)) {
      if (!(key in changes)) {
        continue;
      }

      settings[key] = changes[key].newValue;
      relevantChange = true;

      if (
        key === "fastPdfPreview" &&
        settings.fastPdfPreview === false
      ) {
        removePdfOverlays();
      }

      if (
        key === "autoSizePdfWindows" &&
        settings.autoSizePdfWindows === false
      ) {
        for (const win of document.querySelectorAll(".x-window")) {
          if (win.dataset.sm8OriginalWidth) {
            restorePdfWindowSize(win);
          }
        }
      }
    }

    if (relevantChange) {
      updatePdfOverlays();
    }
  });

  const observer = new MutationObserver(updatePdfOverlays);

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(
      updatePdfOverlays,
      100
    );
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"]
  });

  loadSettings();
})();
