# Crypto Arbitrage

---

## Overview

Placeholder for project overview and description.

---

## Features

- Placeholder for feature 1
- Placeholder for feature 2
- Placeholder for feature 3

---

## Requirements

This project is primarily tested on macOS. The following toolchain components are recommended:

- **macOS** with recent Xcode command line tools
- Any additional dependencies required by the project

---

## Dev Setup

The recommended environment uses **Colima** with **Podman**. Install Colima, enable Podman, then start your containers:

```bash
colima start --runtime podman
```

Additional setup instructions will go here.

---

## Folder Structure

```text
root/
├── README.md
└── LICENSE
```

Add a brief description of each directory as the project grows.

___

## Pre-push hook

To automatically run project tests before each push, copy the provided hook file and make it executable:

```bash
cp githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

The hook runs `npm test`, `pytest`, and `mvn test`. If any of these fail, the push will be blocked and you'll see an error message in the console.
---

## License

Distributed under the MIT License. See `LICENSE` for more information.


