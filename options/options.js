"use strict";

const DEFAULTS = {
  fastPdfPreview: true,
  autoSizePdfWindows: true,
  actualSizePdf: true,
  compactUi: true,
  uiScalePercent: 85
};

const fastPdfPreview =
  document.getElementById("fastPdfPreview");

const autoSizePdfWindows =
  document.getElementById("autoSizePdfWindows");

const actualSizePdf =
  document.getElementById("actualSizePdf");

const compactUi =
  document.getElementById("compactUi");

const uiScalePercent =
  document.getElementById("uiScalePercent");

const status =
  document.getElementById("status");

async function loadSettings() {
  const settings = await browser.storage.local.get(DEFAULTS);

  fastPdfPreview.checked =
    settings.fastPdfPreview;

  autoSizePdfWindows.checked =
    settings.autoSizePdfWindows;

  actualSizePdf.checked =
    settings.actualSizePdf;

  compactUi.checked =
    settings.compactUi;

  uiScalePercent.value =
    settings.uiScalePercent;
}

async function saveSettings() {
  await browser.storage.local.set({
    fastPdfPreview:
      fastPdfPreview.checked,

    autoSizePdfWindows:
      autoSizePdfWindows.checked,

    actualSizePdf:
      actualSizePdf.checked,

    compactUi:
      compactUi.checked,

    uiScalePercent:
      Math.min(
        100,
        Math.max(
          75,
          Number(uiScalePercent.value) || 85
        )
      )
  });

  status.textContent = "Settings saved.";

  setTimeout(() => {
    status.textContent = "";
  }, 1200);
}

fastPdfPreview.addEventListener(
  "change",
  saveSettings
);

autoSizePdfWindows.addEventListener(
  "change",
  saveSettings
);

actualSizePdf.addEventListener(
  "change",
  saveSettings
);

compactUi.addEventListener(
  "change",
  saveSettings
);

uiScalePercent.addEventListener(
  "change",
  saveSettings
);

loadSettings();
