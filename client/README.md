# Trafficking escape game client

## Tutorial / Info

### Running the Front-end Locally 🌐💻 (`http://localhost:5173/`)

1. Add the `.env` file to project ( in `client/.env`):

```json
VITE_BACKEND="http://localhost:8080" #default backend for testing
VITE_GPT_TOKEN="sk-..." #add your gpt token
```

2. Use `yarn install` to **Install Dependencies**

- This project is developed with `yarn`, why?🤔:
  - **⚡ Speed** (Parallel Installation and Efficient Caching)
  - **🔒 Reliability** (Lockfile Consistency and Deterministic Installations)
  - **✨Enhanced Features** and **Better CLI Experience**
  - **📦 Improved Dependency Management** (Flat Mode and Offline Mode:)

3. Start the **Development Server** 🚀

- Use `yarn dev` to start the local development server

📌 Additional:

- This will start the project on a local server, usually accessible at `http://localhost:5173`.
- Network: use `--host` to expose (`yarn dev --host`)

### Additional Notes 📌

- **Port Configuration: 🔢** - If the default ports (`5173` for **development**, `4173` for `preview`) are in use,
- If these are in use, Vite will suggest an alternative port automatically. 🔄

### The `client/package.json` scripts: 📜

```json
"scripts": {
"dev": "vite",
"build": "tsc -b && vite build",
"lint": "eslint .",
"preview": "vite preview",
"format": "prettier --write .",
"check-format": "prettier --check .",
"deploy": "yarn build && wrangler pages deploy ./dist --project-name=traffikingescape",
"predeploy": "yarn build"
}
```
