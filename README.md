# GIF it to me
Node tool for hitting me with quick reaction gifs based on a search string

This is a very simple CLI, I made it because I found myself constantly switching from my current terminal to a browser page to search for a specific reaction gif. With gifit2me I can query the [giphy API](https://api.giphy.com/) and save some time, so I thought I'd share it.

## Installation

The usual, run ``npm install gifit2me -g`` and you can call ``gifit2me`` from anywhere in a terminal.

## Usage

    gifit2me "your-search-term" [--search] [--limit=10]

## Examples

    gifit2me "your-search-term"             Search the Giphy API for one gif and have the returned gif already copied to your clipboard
    gifit2me "your-search-term" -s          Search the Giphy API for a set of gifs
    gifit2me "your-search-term" -s -l=20    Search the Giphy API for a set of 20 gifs

## Options

    * -v, --version  Show version number
    * -l, --limit    Set search limit (default = 10)
    * -s, --search   Activate search mode (returns a set of gifs instead of single one)
