# ServiceM8 PDF Preview Fix for Firefox

An unofficial Firefox extension that works around unusually slow embedded PDF previews in the ServiceM8 web application.

## What it does

On affected Firefox installations, ServiceM8 PDF previews may take several seconds to appear even though the PDF itself has already loaded.

This extension detects ServiceM8's temporary PDF preview iframe and displays the same PDF using a separate iframe that is not managed by ServiceM8's existing component code.

## Scope

The extension runs only on:

https://go.servicem8.com/*

It only activates for ServiceM8 temporary PDF preview URLs hosted in ServiceM8's AWS S3 preview bucket.

## Privacy

This extension:

- collects no user data
- transmits no user data to the extension developer or any analytics service
- contains no analytics or tracking
- runs only on https://go.servicem8.com/*
- reuses the temporary PDF preview URL supplied by ServiceM8 and loads that PDF in a separate iframe

The PDF itself continues to be loaded directly from ServiceM8's temporary AWS S3 preview location as part of the normal ServiceM8 preview workflow.

## Disclaimer

This is an unofficial community extension and is not affiliated with, endorsed by, or maintained by ServiceM8.

## License

Mozilla Public License 2.0.
