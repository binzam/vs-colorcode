# colorcodestore README

# extension.ts

- the entry point for a VS Code extension — it defines what happens when the extension is activated or deactivated.

## purpose

It wires up and registers:

- A Webview View Provider (the sidebar UI)

- A Command (colorcodestore.previewColor) to preview colors in a separate panel

# class ColorPickerViewProvider

- a Visual Studio Code extension class responsible for rendering and managing a side panel (WebviewView) that acts as a color management UI. It's built using the VS Code Webview API and communicates with a backend manager (ColorProjectManager) to let users:

## purpose

- To provide an interactive color picker and manager as a sidebar view in VS Code where users can:

- Add/remove saved colors

- Create/select/delete projects

- Assign colors to projects

- Preview, copy, and organize colors

# class ColorPreviewPanel

- class that creates and displays a webview panel in VS Code to show a visual preview of a color the user selects. This is part of a Visual Studio Code extension.

# ColorProjectManager class

- a Backend manager class for color data. backend utility/service for a Visual Studio Code extension that helps manage saved colors and color projects.

- It handles all data-related logic — including loading, saving, adding, removing, and organizing colors — and provides a bridge between persistent VS Code configuration storage and the webview-based frontend UI.
