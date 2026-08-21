# ServiceM8 Enhancements for Firefox

An unofficial Firefox extension that improves several aspects of the ServiceM8 web application, including embedded PDF previews, PDF window sizing, PDF readability, and interface scaling.

## Features

Each feature can be enabled or disabled independently from the extension's Options page.

### Fast PDF Preview

Works around unusually slow ServiceM8-generated PDF previews in Firefox.

On affected Firefox installations, some ServiceM8 PDF previews may take several seconds to appear even though the PDF itself has already loaded.

The extension detects supported ServiceM8 temporary PDF preview iframes and displays the same PDF using a separate iframe that is not managed by ServiceM8's existing preview component code.

### Auto-size PDF Windows

Automatically resizes supported ServiceM8 PDF windows so that PDFs opened at Actual Size fit comfortably without unnecessarily maximising the window.

Current sizing includes support for:

- View Document
- Custom Invoice

The extension uses ServiceM8's existing ExtJS window system to resize and centre these windows.

### Open PDFs at Actual Size

Opens supported ServiceM8 embedded PDFs at 100% zoom.

This helps avoid the softer text rendering that can occur when Firefox's built-in PDF viewer displays a PDF at a fractional automatic zoom level.

This setting applies only to ServiceM8 PDF previews and does not change Firefox's global PDF zoom preference.

### Compact ServiceM8 UI

Proportionally scales supported areas of the ServiceM8 interface while leaving embedded PDF previews unscaled.

The scale can be adjusted from 75% to 100%.

Current confirmed support:

- Dispatch Board
- Invoicing

Normal ServiceM8 pop-up windows on supported pages are scaled and re-centred automatically.

PDF-containing windows are deliberately excluded from UI scaling so that embedded PDFs remain crisp.

Support for additional areas of ServiceM8 may be added in future releases.

## Options

The extension currently provides these configurable options:

- Fast PDF Preview
- Auto-size PDF Windows
- Open PDFs at Actual Size
- Compact ServiceM8 UI
- Compact UI scale percentage

Settings are stored locally in Firefox using the WebExtensions storage API.

## Scope

The extension runs only on:

https://go.servicem8.com/*

PDF-specific features activate only for recognised ServiceM8 PDF preview and attachment URLs.

The Fast PDF Preview workaround is specifically used for ServiceM8 temporary PDF previews hosted in ServiceM8's AWS S3 preview infrastructure.

## Privacy

This extension:

- collects no user data
- transmits no user data to the extension developer
- contains no analytics or tracking
- runs only on https://go.servicem8.com/*
- stores extension preferences locally in Firefox
- reuses PDF URLs already supplied by ServiceM8 as part of the normal ServiceM8 workflow

PDF documents continue to be loaded directly from ServiceM8's own infrastructure.

No PDF content is sent to the extension developer or to any third-party service by this extension.

## Support

Please report bugs or compatibility problems using the repository's [GitHub Issues](https://github.com/rab1dd0g/servicem8-enhancements-for-firefox/issues).

When reporting an issue, include your Firefox version, operating system, and a description of the affected ServiceM8 feature. Do not include ServiceM8 credentials, session tokens, signed PDF URLs, or customer information.

## Disclaimer

This is an unofficial community extension and is not affiliated with, endorsed by, or maintained by ServiceM8.

ServiceM8 may change its web application at any time, which may affect compatibility with individual enhancement features.

## License

Mozilla Public License 2.0.
