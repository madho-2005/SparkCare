# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Environment Configuration & Security

- Copy `.env.example` to `.env` or `.env.local` to define environment variables.
- **Frontend Security Warning**: Only variables starting with `VITE_` are bundled into frontend code. Never store secret keys, database connection strings, or service role credentials in client environment files.
- **Git History Secret Rotation Warning**: Rotate any secrets or credentials in production immediately if they were previously hardcoded or committed to git history.
