# Mankon Online Dictionary

This repository contains the source code for publishing an online searchable dictionary for the Mankon language. The project is designed to provide an intuitive, user-friendly interface to explore and learn the Mankon language, offering a rich set of features for browsing, searching, and understanding word meanings, pronunciations, and example usages.

---

# Features

- Search Functionality: Quickly look up words and their translations.

- Browse by Language: Explore words in alphabetical order.

- Pronunciation Support: Listen to audio clips for accurate pronunciation.
- Language Support: Learn to read and write using the Mankon alphabet.

- Example Sentences: Learn through real-world contextual examples.

---

# Project Structure

```
mankon-dictionary/
|--public
| |--audio            # Recordings for word and sentence pronunciation
| |--image            # Functional images and definition clarifying images
|--src
| |--aboutItems       # About MACUDA-MN / MACUDA-A page
| |--alphabetItems    # Language Resources
| |--assets           # Dictionary json file and notes.txt for json guidance
| |--browseItems      # Dictionary rendered to screen in alphabetical order
| |--entryItems       # Basic template for Entry pages
| |--headerItems      # Elements that appear in the Header
| |--homeItems        # Home page
| |--notFoundItems    # Source
```

---

# Getting Started

### Prerequisites

- Node.js

- npm

### Installation

1. Clone this repository:

```
git clone https://github.com/danakenneyl/mankon-dictionary.git
cd mankon-dictionary
```

2. Install dependencies:

```
npm install
```

### Running the Project Locally

1. Start the development server:

```
npm run dev
```

2. Open your browser and navigate to the url specified in your terminal.

---

# Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.

2. Create a new branch for your feature or fix:

```
git checkout -b feature-name
```

3. Commit your changes:

```
git commit -m "Add feature-name"
```

4. Push to your branch:

```
git push origin feature-name
```

5. Open a pull request.

---

# Acknowledgments

This project is a collaborative effort to document and preserve the Mankon language, supporting its study and use in the community and beyond. Special thanks to native speakers for their invaluable input.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
npm dev
# or
run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
