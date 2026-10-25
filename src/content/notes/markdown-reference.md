---
title: Markdown reference
description: Every formatting option the blog supports, in one place. This is a draft, so it only shows up while running the site locally.
date: 2026-10-25
tags: [meta]
draft: true
---

Body text is plain Markdown. Use `##` for section headings and `###` below that. A writeup with three or more `##` headings gets a contents list automatically.

## Code

Inline code looks like `nmap -sV -p- target`. Fenced blocks get syntax highlighting and a copy button:

```bash
subfinder -d example.com -silent | httpx -silent -status-code -title
```

```python
import requests

r = requests.get("https://example.com/api/me", headers={"Authorization": "Bearer TOKEN"})
print(r.status_code, r.json())
```

## Lists and quotes

- Unordered item
- Another item
  - Nested item

1. First step
2. Second step

> Quotes are good for vendor responses or advisory text.

## Tables

| Tool      | Use                     |
| --------- | ----------------------- |
| ffuf      | Content discovery       |
| Burp Suite| Intercepting and replay |
| nuclei    | Template-based scanning |

## Images

Put the image file next to the post and link it with a relative path, for example `![Login request in Burp](./burp-login.png)`. Images placed this way are resized and optimised automatically, and the link keeps working if the blog moves to its own domain.

---

A horizontal rule, made with three dashes, separates major parts of a post.
