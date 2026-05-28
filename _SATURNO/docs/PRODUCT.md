# Product

## Identity

- Product name: **Saturno FancyHeader**
- Repo: `repos\VSCode\mdheader`
- Type: VS Code extension
- Primary command: `saturno-fancy-header.addHeader`

## Purpose

Generate a consistent file header at the top of the active editor using the language comment syntax plus project, date, and author metadata.

## Current Behavior

- Inserts the header at line 1 of the active file
- Uses Git metadata when available
- Falls back to file creation date and OS username when Git data is missing
- Supports configurable template lines, single or multiple editable template files, line width, border fill character, and author overrides
