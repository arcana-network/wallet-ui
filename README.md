<p align="center">
<a href="#start"><img height="30rem" src="https://raw.githubusercontent.com/arcana-network/branding/main/an_logo_light_temp.png"/></a>
<h2 align="center"> <a href="https://arcana.network/">Arcana Wallet UI </a></h2>
</p>
<br/>
<p id="banner" align="center">
<br/>
<a title="MIT License" href="https://github.com/arcana-network/license/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue"/></a>
<a title="Beta release" href="https://github.com/arcana-network/wallet-ui/releases"><img src="https://img.shields.io/github/v/release/arcana-network/wallet-ui?style=flat-square&color=28A745"/></a>
<a title="Twitter" href="https://twitter.com/ArcanaNetwork"><img alt="Twitter URL" src="https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FArcanaNetwork"/></a>
<!---
<a title="CodeCov" href="https://codecov.io/gh/arcana-network/wallet-ui">
 <img src="https://codecov.io/gh/arcana-network/wallet-ui/branch/dev/graph/badge.svg?token=KmdjEs3enL"/></a>
-->
</p><p id="start" align="center">
<a href="https://docs.beta.arcana.network/"><img src="https://raw.githubusercontent.com/arcana-network/branding/main/an_banner_docs.png" alt="Arcana Wallet UI"/></a>
</p>

# Arcana Wallet UI

The Arcana wallet is a non-custodial, embedded Web3 wallet that is instantly available to authenticated users of Web3 apps that use the [Arcana Auth SDK](https://github.com/arcana-network/auth). Web3 app developers must install and integrate the Auth SDK to enable users to sign blockchain transactions. Users do not have to install any software to access the Arcana Wallet UI.

Developers can also choose to disable the Arcana Wallet UI and plug in a custom wallet UI for their apps using the white-labeled Auth feature.

This repo contains Aracna Wallet UI implementation. It is a Vue app written in TypeScript and styled with Tailwind CSS.

**Note:**  Arcana Wallet UI is NOT a standalone wallet. It is part of the Arcana Auth SDK.

## 📋 Installation

Use the Node version listed in the [.nvmrc](./.nvmrc) file.

| Command         | Action                                 |
| :-------------- | :------------------------------------- |
| `npm install`   | Install dependencies locally           |
| `npm run serve` | Start local dev server for development |
| `npm run lint`  | Lint and auto-fix errors               |
| `npm run build` | Build and minify site for production   |

If you are using VS Code, see the recommended [settings](./.vscode/settings.json) and [extensions](./.vscode/extensions.json).

## 📒 Usage

To use Arcana Wallet UI in a Web3 app, follow the instructions [here](https://docs.arcana.network/quick-start/index.html) to register the app with Arcana Network, configure the chains and social login settings and install, and integrate the app with the Arcana Auth SDK.

## 📚 Documentation

Check out [Arcana Auth documentation](https://docs.arcana.network/) and use the [Auth SDK Quick Start Guide](https://docs.arcana.network/quick-start/index.html) to integrate any Web3 app and enable the Arcana Wallet UI. See [Arcana Wallet User Guide](https://docs.arcana.network/user-guides/wallet-ui/index.html) for usage details.

## 💡 Support

For any support or integration-related queries, contact [Arcana Support Team](mailto:support@arcana.network).

## ℹ️ License

Arcana Wallet UI is distributed under the [MIT License](https://fossa.com/blog/open-source-licenses-101-mit-license/).

For details see [Arcana License](https://github.com/arcana-network/license/blob/main/LICENSE.md).
