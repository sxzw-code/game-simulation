# game-simulation
A platform used to simulate games/trading situations

## Alpha

A simple, modern single-page website with a navigation bar and multiple tabs:

- **Home**: Landing section explaining the hub.
- **Game One**: Placeholder area for your first game.
- **Game Two**: Placeholder area for a second game.
- **Simulation Lab**: Placeholder area for future simulations.

Each tab is already wired up; clicking a tab (or any button with a matching `data-target`) swaps the visible content panel.

### How to run it

```bash
npm install
npm start
```

Then open the URL shown in the terminal (usually `http://localhost:3000`). You can also open `index.html` directly in your browser if you prefer.

### Where to put your games/simulations

- **Game One**: Add your game UI and logic inside the `#game-1` section in `index.html`.
- **Game Two**: Use the `#game-2` section.
- **Simulation Lab**: Use the `#simulation` section for visualizations or simulations.

You can also extend the navigation by:

1. Adding a new button in the nav with `data-target="your-new-id"`.
2. Creating a matching `<section id="your-new-id" class="tab-panel">...</section>` in the main content.

