# Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. In **Settings → Upload → Upload presets**, create an **unsigned** preset:
   - Name: `ictim_unsigned` (or match your `.env`)
   - Signing mode: **Unsigned**
   - Folder: `ictim` (optional default)
3. Add to `.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=ictim_unsigned
   ```
4. Restart the dev server (`npm run dev`)

Upload folders used by the dashboard:

| Folder | Content |
|--------|---------|
| `ictim/hero` | Hero section images |
| `ictim/speakers` | Speaker photos |
| `ictim/workshops` | Workshop banners |
| `ictim/dates` | Important dates images |
| `ictim/sponsors` | Partner logos |
| `ictim/general` | Site logo & misc |

Manage hero images in **Dashboard → Hero**. Site logo is under **Dashboard → Media**. Other uploads are in per-entity forms (Speakers, Workshops, etc.).
