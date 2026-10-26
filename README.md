# 🔑 Modular KeyGen

A **modular, browser-based key generator** built with **pure JavaScript, HTML, and CSS**, featuring a **module registry** and **client-side DSA serial generation**. Runs **fully in the browser**, no backend required – perfect for **GitHub Pages**.

---

## ✨ Features

✔ **Modular architecture** – loadable keygen modules registered via manifest  
✔ **010 Editor 16.0.4 Keygen** module  
✔ **Macro-Recorder 5.9.0 KeyGen** module with DSA signing (SHA-1, ASN.1 DER)  
✔ **Clipboard copy** for generated keys  
✔ 100% **client-side**, secure, and offline-capable  

---

## 🎮 Live

👉 [**View on GitHub Pages**](https://th3c0d3r.github.io/MacroRecorder_KeyGen/)

---

## 🚀 How to Use

1. Clone the repo and open `index.html` in any modern browser.
2. **Choose a keygen module** from the dropdown.
3. **Fill in the required data** (e.g. Name).
4. Click **Generate Key** to produce the serial locally.
5. Copy the output from the result field.

```bash
git clone https://github.com/Th3C0D3R/MacroRecorder_KeyGen.git
cd MacroRecorder_KeyGen
open index.html
```

---

## 🧩 Module Structure

```
js/
  app.js            # Module loader and UI controller
  modules/
    manifest.js     # Module registry
    _010editor.js   # 010 Editor 16.0.4 keygen module
    macrorecorder.js# Macro-Recorder 5.9.0 keygen module (DSA signing)
css/
  style.css         # Neon dark theme styles
index.html
```

Modules are registered in `js/modules/manifest.js` and expose a `metadata` object plus an `interfaced(...)` entry point. The app dynamically renders input fields from each module's field definitions.

---

## 📦 Deployment

1. Push your project to GitHub.
2. Enable **GitHub Pages** in repo settings.
3. Access your **live version** via your GitHub Pages link.

---

## 🔥 Extras

* Fully responsive for **desktop & mobile**.
* Local-only key generation – speed depends on your device's hardware.

---

## 📜 License

MIT License – free to use, modify, and share.
