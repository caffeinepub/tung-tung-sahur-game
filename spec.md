# Tung Tung Sahur Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A browser game inspired by the "Tung Tung Tung Sahur" meme
- Player drum-banging mechanic: click/tap to make the main character bang drums, triggering flying TUNG! text animations
- Dumb Bot character: an AI companion/opponent that randomly bangs drums at chaotic or wrong times with silly patterns
- Score counter: tracks player's drum hits and bot's chaotic contributions
- Combo/streak system: consecutive fast taps increase score multiplier
- Chaos meter: fills up as the bot does silly things, triggers a "chaos event" (screen shake, random TUNG! explosions)
- Timer: countdown (e.g. 30 seconds) to wake up everyone before Fajr prayer
- Game states: idle/start screen, playing, game over with results
- Flying text animations: TUNG!, TUNG TUNG!, SAHUR!, BANGUN! (wake up!), YA ALLAH!, etc.
- Leaderboard stored in backend: top scores with player names
- Sound-like visual effects: big bold impact text, screen shake, character bounce animations

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Backend (Motoko): leaderboard canister storing top 10 scores with name + score + timestamp
2. Frontend game loop:
   - Canvas or DOM-based game area with character sprites (emoji-based or CSS art)
   - Click/tap handler on player drum zone
   - Bot AI: setInterval with random delays, occasional burst patterns, "wrong" timing moments
   - Animated TUNG! text particles that fly up and fade out
   - Score state, combo multiplier, chaos meter
   - Timer countdown
   - Game over screen with score submission to leaderboard
   - Leaderboard display screen
3. Visual style: bright yellow/orange/red, big Impact-style font, chaotic fun energy
