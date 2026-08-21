# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-08-21

### Added

- Configurable extension options stored locally in Firefox.
- Auto-size PDF windows for supported ServiceM8 PDF dialogs.
- Open supported ServiceM8 PDFs at Actual Size (100%).
- Compact ServiceM8 UI with an adjustable 75–100% scale.
- Compact scaling for supported popups and floating menus.
- Extension icon declaration.

### Changed

- Renamed the extension from ServiceM8 PDF Preview Fix to ServiceM8 Enhancements for Firefox.
- Expanded PDF handling to supported ServiceM8 attachment URLs.
- Improved PDF window sizing for View Document and Custom Invoice.
- Compact popup and menu scaling now uses CSS transforms to preserve correct click targets and positioning.

### Fixed

- Slow ServiceM8-generated PDF preview behaviour in Firefox.
- Blurry PDF rendering caused by automatic fit-to-window zoom.
- Incorrect popup and menu interaction coordinates when Compact UI is enabled.

## [1.0.0]

- Initial release providing the ServiceM8 fast PDF preview workaround.
