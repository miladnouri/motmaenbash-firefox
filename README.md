# MotmaenBash Firefox Extension

MotmaenBash is a Firefox extension designed to verify the authenticity of Iranian payment gateways.

## Overview

This Firefox extension aims to provide users with a tool to verify the authenticity of payment gateways hosted on `shaparak.ir`. It visually indicates whether a payment gateway is secure and trustworthy.

## Features

- Checks if the current page belongs to a secure payment gateway on `shaparak.ir`.
- Displays an icon in the browser's toolbar to indicate the security status of the payment gateway.
- Adds a corner sign/logo to verified secure payment gateway pages.

## Installation

To install the extension, you can download it from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/motmaenbash-%D9%85%D8%B7%D9%85%D8%A6%D9%86-%D8%A8%D8%A7%D8%B4/).

Or install the extension locally:

1. Clone this repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on "Load Temporary Add-on" and select any file in the cloned repository's directory.


## Usage

Once installed, the extension will automatically detect pages on `shaparak.ir` that use HTTPS. If a secure payment gateway is detected, it will display the extension icon in the toolbar. Additionally, it will add a corner sign/logo on the page to signify its security.

## Contributing

Contributions are welcome! If you have any suggestions, bug fixes, or enhancements, please feel free to create issues or pull requests.

## Chrome Version

Check out the [Chrome version repository](https://github.com/miladnouri/motmaenbash-chrome) of this extension.

## License

This project is licensed under the [MIT License](LICENSE).
