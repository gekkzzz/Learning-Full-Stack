# HTML Foundations

---

## Introduction to HTML and CSS

**What do HTML and CSS stand for?**
HTML stands for HyperText Markup Language. CSS stands for Cascading Style Sheets.

---

**Between HTML and CSS, which would you use for putting paragraphs of text on a webpage?**
HTML — it defines the structure and content of a page. CSS handles styling only.

---

**Between HTML and CSS, which would you use for changing the font and background color of a button?**
CSS — it controls all visual styling such as fonts, colors, and layout.

---

**What is the difference between HTML, CSS and JavaScript?**

| Language       | Role                                      |
| -------------- | ----------------------------------------- |
| **HTML**       | Defines the structure of a webpage        |
| **CSS**        | Styles the appearance of the page         |
| **JavaScript** | Adds interactivity and dynamic behaviour  |

---

## HTML Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A comprehensive tutorial template for learning HTML5 and CSS basics.">
    <meta name="author" content="Your Name">
    <title>My Website</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
  </head>

  <body>
    <header>
      <h1>Welcome to My Website!</h1>
      <p>This is a structured, styled HTML5 template.</p>
    </header>

    <main>
      <section>
        <h2>Why these tags matter</h2>
        <p>
          The code inside the <code>&lt;head&gt;</code> tag tells the browser how to
          render the page correctly, optimise it for mobile screens, and load external styles.
        </p>
      </section>
    </main>

    <footer>
      <p>&copy; gekkzzz (me)</p>
    </footer>
  </body>
</html>
```

---

## 1. Document Structure & Metadata

These tags form the essential backbone of any HTML document. They set up the structural foundation and provide background data (metadata) to the browser.

| Tag | Name | Description |
| --- | ---- | ----------- |
| `<!DOCTYPE html>` | Document Type | Tells the browser that the file is an HTML5 document. Must be on line 1. |
| `<html>` | HTML Root | Wraps all content on the entire page. Includes the `lang` attribute (e.g., `<html lang="en">`). |
| `<head>` | Document Head | Contains invisible metadata, titles, character sets, and links to CSS stylesheets. |
| `<meta>` | Metadata | Defines data like character encoding (`charset="UTF-8"`), viewport settings for mobile, or SEO descriptions. |
| `<title>` | Page Title | Sets the title shown on the browser tab and in search engine results. |
| `<link>` | External Resource | Links the HTML document to external resources like CSS stylesheets or favicons. |
| `<body>` | Document Body | Contains all the visible content of the webpage (text, images, links). |

---

## 2. Structural & Semantic Layout Elements

Semantic tags give meaning to your layout, helping search engines (SEO) and screen readers understand the hierarchy and parts of your page.

- **`<header>`** — Used for introductory content, logos, or the main navigation bar at the top of a page or section.
- **`<nav>`** — Wraps a block of navigation links designed for site-wide or page-wide menus.
- **`<main>`** — Encloses the dominant, unique content of the webpage. There should only be one `<main>` per page.
- **`<section>`** — Defines a thematic grouping of content, typically with its own heading (e.g., "Features", "About Us").
- **`<article>`** — Represents a self-contained piece of content that could be reused or redistributed independently (e.g., a blog post, news story, or forum post).
- **`<aside>`** — Holds content that is tangentially related to the main content around it, like a sidebar, callout box, or advertising.
- **`<footer>`** — Contains closing information at the bottom of a page or section, such as copyright notices, legal links, or contact details.
- **`<div>`** — A generic block-level container. It has no semantic meaning and is used purely as a placeholder for CSS styling or JavaScript manipulation.

---

## 3. Text Formatting & Typography

These tags are used to organize, structure, and style the written content of your page.

| Tag | Name | Type | Description |
| --- | ---- | ---- | ----------- |
| `<h1>` to `<h6>` | Headings | Block | Section headings. `<h1>` is the most important (main title); `<h6>` is the least. |
| `<p>` | Paragraph | Block | Wraps a block of standard body text. Automatically adds space before and after. |
| `<br>` | Line Break | Inline | Forces a line break within text without creating a new paragraph. Self-closing. |
| `<hr>` | Horizontal Rule | Block | Creates a thematic break or horizontal dividing line across the page. Self-closing. |
| `<strong>` | Strong Importance | Inline | Marks text as highly important. Typically renders as bold text. |
| `<em>` | Emphasis | Inline | Marks text with stress emphasis. Typically renders as italicized text. |
| `<span>` | Generic Inline | Inline | A generic inline container used to style a specific word or phrase via CSS. |
| `<code>` | Code Snippet | Inline | Displays a short piece of computer code using a monospace font. |
| `<pre>` | Preformatted Text | Block | Displays text exactly as typed in the HTML file, preserving spaces, tabs, and line breaks. |

---

## 4. Hyperlinks & Multimedia

These inline and block tags allow you to connect pages together and embed media.

### `<a>` (Anchor/Link)

Creates a hyperlink to another webpage, file, or location.

- `href="url"` — The destination address.
- `target="_blank"` — Opens the link in a new browser tab.

### `<img>` (Image)

Embeds an image into the webpage. It is an empty/self-closing tag.

- `src="image-path.jpg"` — The source path of the image.
- `alt="description"` — Alternative text for screen readers and if the image fails to load.

### `<video>`

Embeds video files directly onto the page.

- Key attributes: `controls`, `autoplay`, `loop`, `src`.

### `<audio>`

Embeds audio streams or files onto the page.

- Key attributes: `controls`, `src`.

---

## 5. Lists

HTML supports ordered (numbered), unordered (bulleted), and description lists.

**Unordered List (Bulleted)**

```html
<ul>
  <li>First bullet point</li>
  <li>Second bullet point</li>
</ul>
```

**Ordered List (Numbered)**

```html
<ol>
  <li>Step One</li>
  <li>Step Two</li>
</ol>
```

**Description List (Term/Definition)** — Used for glossaries, dictionaries, or key-value pairs.

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
</dl>
```

---

## 6. Tables

Tables are used to present structured data in rows and columns.

| Tag | Name | Description |
| --- | ---- | ----------- |
| `<table>` | Table Wrapper | The outer container for all table elements. |
| `<thead>` | Table Head | Groups the header content at the top of the table. |
| `<tbody>` | Table Body | Groups the primary data content of the table. |
| `<tr>` | Table Row | Defines a single horizontal row of cells. |
| `<th>` | Table Header | Defines a header cell inside a row (automatically bold and centered). |
| `<td>` | Table Data | Defines a standard data cell inside a row. |

---

## 7. Forms & Input Elements

Forms allow users to input data and send it back to a server or process it with JavaScript.

- **`<form>`** — The container wrapper for all interactive form fields. Uses `action` (where to send data) and `method` (`GET` or `POST`).
- **`<label>`** — Defines a text label for a specific input element, crucial for accessibility. Uses the `for` attribute to match an input's `id`.
- **`<input>`** — The primary, multi-purpose element for gathering user input. Changes based on its `type` attribute:
  - `type="text"` — A single-line text field.
  - `type="password"` — Obscures typed characters.
  - `type="email"` — Validates that the input looks like an email address.
  - `type="checkbox"` — A square toggle box for multiple-choice selections.
  - `type="radio"` — A circular button where only one option in a group can be selected.
  - `type="submit"` — A button that submits the form data to the server.
- **`<textarea>`** — A multi-line text input field (useful for comments, bio fields, or messages).
- **`<select>`** — Creates a drop-down selection menu.
- **`<option>`** — Defines an individual selectable choice inside a `<select>` drop-down.
- **`<button>`** — Creates a clickable button element that can hold text, HTML elements, or images inside it.

---

## Quick Concept Reminder: Block vs. Inline

**Block-level elements** (`<div>`, `<p>`, `<h1>`, `<section>`) always start on a new line and stretch out to take up the full width available to them.

**Inline elements** (`<span>`, `<a>`, `<strong>`, `<img>`) do not start on a new line. They only take up as much width as their content requires and sit side-by-side with other inline elements.
