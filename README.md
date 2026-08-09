# Textora — Progressive TTS Translation PWA

Textora is a secure, browser-native, text-to-speech translation Progressive Web Application (PWA). It chunks large text documents client-side, translates them progressively in the background, and synthesizes audio streams locally on the device with zero cloud audio costs.

---

## 1. Local Development Setup

To run Textora locally:

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and configure your active translation provider.

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

Textora supports three translation providers configured server-side.

| Key | Supported Values | Description |
| :--- | :--- | :--- |
| `TRANSLATION_PROVIDER` | `mock` \| `deepl` \| `google` | Selects active translation service. (Default is `mock`). |
| `DEEPL_API_KEY` | `your_deepl_api_key` | Required only if `TRANSLATION_PROVIDER=deepl`. |
| `GOOGLE_TRANSLATE_API_KEY` | `your_google_api_key` | Required only if `TRANSLATION_PROVIDER=google`. |

---

## 3. Vercel Deployment Configuration

Textora is fully compatible with Vercel's Serverless execution model.

### Steps to Deploy:
1. **Push Code to Git**: Push your project repository to GitHub, GitLab, or Bitbucket.
2. **Import into Vercel**:
   - Log into the Vercel Dashboard and click **Add New** -> **Project**.
   - Import your repository.
3. **Set Environment Variables**:
   - Under the **Environment Variables** accordion during project setup, add:
     - `TRANSLATION_PROVIDER` = `google` or `deepl`
     - `GOOGLE_TRANSLATE_API_KEY` or `DEEPL_API_KEY` = *[Your Secret Key]*
4. **Deploy**: Click **Deploy**. Vercel will build the frontend, deploy serverless functions, and generate PWA manifest routes statically.

---

## 4. Production Testing Procedure

Verify the live deployment on mobile and desktop:

1. **PWA Registration**:
   - Inspect Chrome DevTools -> **Application** -> **Service Workers** to confirm `/sw.js` is registered.
   - Confirm that the install badge (add to home screen) appears in compatible browsers.
2. **Translation & Pipeline Tests**:
   - Input a large document (>5,000 characters) and verify the static translation panel blocks it with a warning.
   - Click **Translate & Speak Pipeline**. Confirm the document splits, calls the translation API chunk-by-chunk sequentially, and plays audio within a second.
3. **Queue Interrupts & Restarts**:
   - Click **Stop** mid-speech; verify all background fetches and synthesis threads halt immediately.
   - Change voice/speed rates during speech and ensure updates take effect instantly.
