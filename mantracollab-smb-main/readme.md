# Mantra SMB Main

This package provides a simple interface to initialize and interact with your database and related modules (such as `website`) in a Node.js environment.

## Features

- Environment-based database configuration and initialization
- Centralized database connection management
- Modular architecture (e.g., website methods)
- Easy-to-use API for consumers

## Usage

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Initialization

Before using any module, initialize the SMB package:

```javascript
const SMB = require("./src");

(async () => {
  await SMB.init("development"); // or 'production', etc.
})();
```

### 3. Accessing Website Methods

After initialization, you can access website-related methods via the `SMB.website` object:

```javascript
const websites = await SMB.website.getWebsites();
```

### 4. Disconnecting

To gracefully close the database connection:

```javascript
await SMB.disconnect();
```

## Project Structure

```
src/
  ├── constants/
  ├── config/
  ├── db/
  ├── exceptions/
  ├── logger/
  ├── methods/
  │     └── websites.js
  └── index.js
```

- **index.js**: Main entry point, handles initialization and exposes modules.
- **methods/websites.js**: Website-related methods, initialized with the database instance.

## Example

```javascript
const SMB = require("./src");

async function main() {
  await SMB.init("development");
  const websites = await SMB.website.getWebsites();
  console.log(websites);
  await SMB.disconnect();
}

main();
```

## Notes

- Always call `SMB.init(env)` before using any module methods.
- The `website` module and others are initialized with the database instance and accessed via the `SMB` object.

## License

MIT
