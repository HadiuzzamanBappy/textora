# Textora — Progressive TTS Translation PWA

Textora is a secure, browser-native, text-to-speech translation Progressive Web Application (PWA). It features a robust document reader with drag-and-drop support, chunks large text documents client-side, translates them progressively in the background, and synthesizes audio streams locally on the device with zero cloud audio costs.

## Key Features

- **Document Reader**: Drag-and-drop file upload support for reading and parsing large text documents.
- **Progressive Translation**: Translates large texts progressively chunk-by-chunk using either local browser capabilities or server-side APIs.
- **Advanced Audio Playback**: Enhanced bottom player controls with play/pause, voice selection, speech rate adjustment, and progressive tracking.
- **Audio Export**: Export synthesized speech to `.mp3` or `.wav` formats directly from the UI.
- **Flexible Providers**: Supports browser-native translation (with fallback scraping) or official Google Cloud Translation API.

---

## 1. Local Development Setup

To run Textora locally:

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and configure your active translation provider (see Environment Variables section).

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

4. **Run Unit Tests**:
   ```bash
   npm run test
   ```

---

## 2. Environment Variables

Textora supports flexible translation providers configured via environment variables.

| Key | Supported Values | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_TRANSLATION_PROVIDER` | `browser` \| `google` | Selects the active translation service. (Default is `browser`). |
| `GOOGLE_TRANSLATE_API_KEY` | `your_google_api_key` | Required only if you plan to use the official Google Translate API endpoint. |

---

## 3. Vercel Deployment Configuration

Textora is fully compatible with Vercel's Serverless execution model.

### Steps to Deploy:
1. **Push Code to Git**: Push your project repository to GitHub, GitLab, or Bitbucket.
2. **Import into Vercel**:
   - Log into the Vercel Dashboard and click **Add New** -> **Project**.
   - Import your repository.
3. **Set Environment Variables**:
   - Under the **Environment Variables** accordion during project setup, add your specific keys (e.g., `NEXT_PUBLIC_TRANSLATION_PROVIDER`, `GOOGLE_TRANSLATE_API_KEY`).
4. **Deploy**: Click **Deploy**. Vercel will build the frontend, deploy serverless functions, and generate PWA manifest routes statically.

---

## 4. Production Testing Procedure

Verify the live deployment on mobile and desktop:

1. **PWA Registration**:
   - Inspect Chrome DevTools -> **Application** -> **Service Workers** to confirm `/sw.js` is registered.
   - Confirm that the install badge (add to home screen) appears in compatible browsers.
2. **Document Upload & Translation Tests**:
   - Upload a large document (>5,000 characters) via drag-and-drop.
   - Click **Translate & Speak Pipeline**. Confirm the document splits, calls the translation API chunk-by-chunk sequentially, and plays audio within a second.
3. **Playback Controls & Export**:
   - Use the **Bottom Player** to pause, adjust speech speed, and change voices mid-speech.
   - Verify the audio export feature successfully generates an `.mp3` or `.wav` file of the translated text.

---

## 5. Versioning & Releases (For Maintainers)

Textora uses [Changesets](https://github.com/changesets/changesets) to automate semantic versioning and changelog generation.

When open-source contributors submit features, they generate a changeset file via `npm run changeset`. When you merge their PRs into the `main` branch, simply run:
```bash
npm run version
```
This command automatically consumes all pending changesets, bumps the `package.json` version accordingly, and generates a beautifully formatted `CHANGELOG.md` file!
