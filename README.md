# PayLeo Frontend

React + Vite + Tailwind CSS client for the PayLeo Flask API.

## Run it

```bash
npm install
cp .env.example .env     # optional
npm run dev              # http://localhost:3000
```

Start the backend on port 5000 first (`python run.py` in the backend project). In development Vite proxies `/api` to `http://localhost:5000`, so there are no CORS issues.

## Production

```bash
VITE_API_URL=https://your-api.example.com VITE_CURRENCY=USD npm run build
```

Serve `dist/` from any static host with a fallback to `index.html` (single-page app). Add the site's origin to the backend's `CORS_ORIGINS`.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API origin. Leave blank in dev to use the proxy. |
| `VITE_CURRENCY` | ISO 4217 code for money formatting (default `USD`). |

## Structure

```text
src/
├── lib/         api client (JWT, error handling), auth context, formatting
├── components/  ui kit, layout, toasts
└── pages/       Auth, Dashboard, Invoices, InvoiceForm, InvoiceDetail, Customers, Products
```

## Notes

- All totals shown while editing are previews; the backend recalculates and returns the authoritative values on save.
- A 401/422 on any protected call signs the user out.
- Animations respect `prefers-reduced-motion`.
# payLeo
