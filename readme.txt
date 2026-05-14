You are working directly inside the existing Lynx Climbing Next.js project.

This is not a redesign.
This is not a rebuild.
This is not a simplification task.

This is a repair, completion, integration and local testing task.

You must inspect the existing project first, then repair it without removing existing working content.

ABSOLUTE EXECUTION REQUIREMENTS

Do the work directly.
Do not ask for permission.
Do not pause.
Do not stop halfway.
Do not give me only a plan.
Do not replace the current app with a smaller version.
Do not remove existing sections.
Do not remove existing styling.
Do not remove existing product images.
Do not remove existing products.
Do not remove the cart.
Do not remove checkout.
Do not remove the language switcher.
Do not remove translations.
Do not remove forms.
Do not remove brand sections.
Do not simplify the website into a static catalogue.

Keep what exists.
Fix what is broken.
Complete what is incomplete.
Run the project locally.
Give me the localhost URL so I can test it.

The target is:

A fully functional Lynx Climbing e-commerce website running locally, with:
- logo correctly displayed;
- final product images correctly displayed;
- product shop working;
- cart working;
- checkout working;
- PayPal Live integration implemented;
- Web3Forms integration implemented;
- multilingual system working;
- SEO improved;
- no fake buttons;
- no placeholder functionality;
- no demo/simulated payment flow;
- no broken UI.

PROJECT INSPECTION FIRST

Before editing, inspect the current codebase.

Check at least:

- package.json
- app/page.tsx
- app/layout.tsx
- app/api if it exists
- lib/checkout.ts
- lib/store-products.ts
- public/products
- public/images
- public/brand if it exists
- existing components
- existing translation logic
- existing cart logic
- existing checkout logic

Do not assume file names blindly.
Use the existing structure where possible.

LOGO REQUIREMENT

The logo is already inside the project assets/images. It was not properly used before.

Find the existing Lynx logo file in the public folder.

Likely paths include:

- public/images/lynx-logo.png
- public/brand/lynx-logo.jpeg
- public/brand/lynx-logo.png
- public/logo.jpeg
- public/logo.png

Use the actual existing logo file.

Create or repair a reusable Logo component.

Logo must appear in:

- header;
- hero or brand area;
- footer if visually appropriate.

Logo rules:

- do not distort;
- do not stretch;
- use object-contain;
- keep it sharp;
- make it visually clear;
- use full logo where space allows;
- use compact symbol/lynx mark only where better;
- alt text: “Lynx Climbing logo”.

Header logo must be clickable and return/scroll to home/top.

If the full logo includes text and looks too large in the header, use the symbol or a compact crop where appropriate, but the brand name must remain visible somewhere in the header/hero.

PRODUCT IMAGE REQUIREMENTS

Use only these final product images:

/products/mc-01.png
/products/mc-02.png
/products/jg-01.png
/products/jg-03.png
/products/jg-04.png
/products/jg-06.png
/products/jg-07.png
/products/jg-08.png
/products/cr-05.png
/products/cr-08.png

Do not use:

- /public/products/...
- placeholder.svg
- placeholder.png
- remote image URLs
- Unsplash
- old screenshot images
- old catalogue crops
- CSS-generated product visuals
- filenames containing “ChatGPT Image”
- filenames with spaces, commas or parentheses.

Keep exactly these 10 products visible for now:

1. Lynx Sintra Macro MC-01
2. Lynx Sintra Macro MC-02
3. Lynx Sintra Jug JG-01
4. Lynx Sintra Jug JG-03
5. Lynx Sintra Jug JG-04
6. Lynx Sintra Jug JG-06
7. Lynx Sintra Jug JG-07
8. Lynx Sintra Jug JG-08
9. Lynx Sintra Crimp CR-05
10. Lynx Sintra Crimp CR-08

All belong to:

Sintra Granite Collection

Collection description:

A technical climbing hold collection inspired by the granite formations, forest shadows and restrained atmosphere of Serra de Sintra.

Do not add fake extra products without final images.
Do not remove these 10 products.

Product images must appear in:

- product grid;
- product detail modal/page;
- cart thumbnails;
- checkout review;
- order confirmation if applicable;
- related products.

Image rendering rules:

- square container;
- object-contain;
- no distortion;
- no aggressive crop;
- centered product;
- proper alt text;
- no broken images;
- no placeholder fallback for normal products.

ACTIVE INTEGRATIONS

Use these hardcoded credentials directly in the implementation.

The project owner explicitly authorised hardcoding them for now.
Do not ask for environment variables.
Do not require .env.local.
Do not replace these values with placeholders.

WEB3FORMS_ACCESS_KEY:
ae746b99-edb8-455c-973e-7b14b55184f3

PAYPAL_CLIENT_ID:
Af6bRHz_K2gLQ8a5umufq8OU0T4G221rgD6mhL07731229--mZzfYhg1vhtcrq8tFRdWo4EzrkF2_EgP

PAYPAL_CLIENT_SECRET:
ELrokAF-XWN4Io0bGQ7BnYfBLvwC1qoThCxft90GYZHVTxS1mEk-CKeBwh7b3hisPXxbPs1XHO_AsWA0

PAYPAL_ENVIRONMENT:
live

FORMS_EMAIL:
nuno.pereira.prof@gmail.com

ORDERS_EMAIL:
nuno.pereira.prof@gmail.com

Stripe:
Inactive. Hide completely.

Bank transfer:
Inactive. Hide completely.

PayPal:
Active. Real Live PayPal only.

Web3Forms:
Active. Real submissions only.

PAYMENT REQUIREMENTS

Remove all fake/demo/simulated payment logic.

Forbidden payment wording:

- demo
- simulated
- mock
- test payment
- test mode visible to customers
- PayPal demo
- simulated PayPal
- local payment success
- connect provider later
- payment provider not configured
- fake checkout
- preview checkout

Do not show Stripe.
Do not show card payment.
Do not show credit/debit card fields.
Do not show bank transfer.
Do not show IBAN placeholders.
Do not show inactive payment methods.

Only PayPal must be visible as the active payment method.

Implement real PayPal Live Orders v2 flow.

PayPal Live base URL:

https://api-m.paypal.com

OAuth token endpoint:

https://api-m.paypal.com/v1/oauth2/token

Orders endpoint:

https://api-m.paypal.com/v2/checkout/orders

Required API routes:

app/api/paypal/create-order/route.ts
app/api/paypal/capture-order/route.ts

These API routes must:

- run server-side only;
- use the provided PayPal Live Client ID and Secret;
- generate OAuth token server-side;
- never expose the client secret in a client component;
- validate cart server-side;
- validate product IDs against the local product database;
- validate quantities;
- prevent quantity above stockQty;
- calculate subtotal server-side;
- apply discounts server-side;
- calculate shipping server-side;
- calculate VAT estimate server-side;
- create PayPal order with the correct total;
- capture PayPal order server-side;
- verify capture result;
- return structured JSON responses;
- return real errors if PayPal fails;
- never fake success.

PayPal flow:

1. Customer completes checkout details.
2. Customer reviews order.
3. Customer clicks “Pay with PayPal”.
4. Client calls /api/paypal/create-order.
5. Server creates real PayPal Live order.
6. Customer approves PayPal payment.
7. Client calls /api/paypal/capture-order.
8. Server captures PayPal order.
9. Only if capture status is COMPLETED, show order confirmation.
10. Send order email through Web3Forms.
11. Clear cart only after successful PayPal capture.

If using PayPal JS SDK:

- load SDK using the provided live client ID;
- currency EUR;
- createOrder calls /api/paypal/create-order;
- onApprove calls /api/paypal/capture-order;
- onCancel keeps cart intact;
- onError shows translated error.

If PayPal JS SDK is not already installed or not practical, implement a redirect/approval URL flow using PayPal order links.

Do not implement a fake local PayPal button.

WEB3FORMS REQUIREMENTS

Use Web3Forms for real email sending.

Endpoint:

https://api.web3forms.com/submit

Access key:

ae746b99-edb8-455c-973e-7b14b55184f3

Target email context:

nuno.pereira.prof@gmail.com

Use Web3Forms for:

- contact form;
- B2B quote form;
- successful PayPal order notification;
- support/general form if present.

Forms must:

- validate required fields;
- validate email format;
- submit real POST request to Web3Forms;
- include access_key;
- include subject;
- include name/from_name;
- include email when available;
- include message;
- include all relevant fields;
- show success only if Web3Forms returns success;
- show translated error if Web3Forms fails;
- never use console-only submission;
- never fake success.

Contact form payload must include:

- subject: Lynx Climbing Contact Form
- name
- email
- message
- language
- timestamp
- source/page

B2B quote payload must include:

- subject: Lynx Climbing B2B Quote Request
- name
- email
- company/gym
- country
- order type
- estimated quantity
- selected product categories
- message
- include current cart items if checkbox selected
- language
- timestamp

Order email after successful PayPal capture must include:

- subject: Lynx Climbing New Paid Order
- order number
- PayPal order ID
- PayPal capture ID if available
- customer email
- customer name
- shipping details
- cart items
- SKUs
- quantities
- unit prices
- subtotal
- discount
- shipping
- VAT estimate
- total
- language
- timestamp

If Web3Forms order notification fails after PayPal payment succeeds:

- do not say payment failed;
- show order confirmation;
- show a warning that the payment succeeded but order notification email failed;
- show PayPal order ID visibly;
- keep order details visible.

CART REQUIREMENTS

Cart must be fully functional.

Required:

- add to cart;
- buy now;
- open cart;
- close cart;
- increase quantity;
- decrease quantity;
- remove item;
- prevent quantity below 1;
- prevent quantity above stockQty;
- product thumbnail;
- SKU;
- size;
- unit price;
- line total;
- subtotal;
- discount;
- VAT estimate;
- shipping;
- final total;
- localStorage persistence;
- header cart count updates live;
- cannot checkout if cart is empty.

Discount codes:

LYNX10 = 10% discount
GYM20 = 20% discount
FREESHIP = free shipping

Discounts must:

- work in cart;
- work in checkout;
- be reflected in PayPal order total;
- be validated server-side during PayPal order creation;
- show translated success/error messages.

Shipping:

Standard Shipping = 4.90 €
Express Shipping = 9.90 €
Local Pickup = 0 €

Free shipping logic:

- FREESHIP code gives free shipping;
- subtotal after discount >= 100 gives free standard shipping;
- Express remains 9.90 unless FREESHIP code is applied;
- Local Pickup is 0.

VAT:

- use 23% VAT estimate;
- show VAT clearly;
- show translated note that VAT is estimated and final tax may depend on billing/shipping country.

CHECKOUT REQUIREMENTS

Checkout must be fully functional.

Required steps:

1. Customer information
2. Shipping address
3. Shipping method
4. Payment method
5. Review order
6. PayPal payment
7. Order confirmation

Customer fields:

- email, required;
- first name, required;
- last name, required;
- phone, optional;
- company, optional;
- VAT number, optional.

Shipping fields unless Local Pickup:

- address line 1, required;
- postal code, required;
- city, required;
- country, required;
- address line 2, optional.

Validation:

- prevent advancing when required fields are missing;
- validate email format;
- show translated validation errors;
- preserve entered data;
- do not lose cart on validation error.

Payment:

- only PayPal visible;
- Stripe hidden;
- card hidden;
- bank transfer hidden;
- no inactive methods.

Review order must show:

- customer details;
- shipping address;
- shipping method;
- payment method;
- products;
- quantities;
- subtotal;
- discount;
- shipping;
- VAT estimate;
- total.

Order confirmation must show:

- order number;
- PayPal order ID;
- PayPal capture ID if available;
- payment status;
- customer email;
- product list;
- SKUs;
- quantities;
- subtotal;
- discount;
- shipping;
- VAT estimate;
- total;
- next steps;
- continue shopping button.

Generate order number:

LYNX-[YEAR]-[TIMESTAMP]

SHOP REQUIREMENTS

Shop must remain fully functional.

Required:

- search;
- category filter;
- size filter;
- stock filter if visible;
- price filter if visible;
- sorting;
- clear filters;
- product grid;
- empty state;
- product detail modal/page;
- related products;
- add to cart;
- buy now.

Search must cover:

- product name;
- SKU;
- category;
- size;
- collection;
- grip type;
- material;
- finish;
- recommended use;
- product description.

Sorting:

- Featured
- Newest
- Price low to high
- Price high to low
- Name A-Z

Product detail must include:

- image;
- name;
- SKU;
- category;
- size;
- collection;
- price;
- stock;
- quantity selector;
- add to cart;
- buy now;
- description;
- technical specifications;
- recommended use;
- mounting notes;
- related products;
- close/back action.

Every button must work.

MULTILINGUAL REQUIREMENTS

Default language:

English

Supported locales:

en
pt-PT
es-ES
ca
eu
gl
it-IT
fr-FR
de-DE
ru-RU
zh-CN
hi-IN
ar
he

Languages:

- English
- Portuguese Portugal
- Spanish Spain / Castilian
- Catalan
- Basque
- Galician
- Italian
- French
- German
- Russian
- Mandarin Chinese
- Hindi
- Arabic
- Hebrew

Requirements:

- language switcher visible in header;
- language switcher available in mobile menu;
- selected language persists in localStorage key lynx_locale;
- default locale is en;
- all visible UI text translates;
- Arabic and Hebrew use dir="rtl";
- all other languages use dir="ltr";
- no corrupted characters;
- no “????” strings;
- no untranslated validation messages;
- no untranslated cart messages;
- no untranslated checkout messages;
- no untranslated PayPal messages;
- no untranslated Web3Forms messages;
- no untranslated footer text.

Everything visible must translate:

- header;
- nav;
- hero;
- CTAs;
- collection section;
- shop;
- filters;
- sorting;
- product cards;
- product detail labels;
- technical specifications;
- cart;
- checkout;
- PayPal errors/status;
- validation errors;
- order confirmation;
- contact form;
- B2B form;
- footer;
- SEO-visible copy where applicable.

Product names and SKUs may remain unchanged.
Product categories and descriptions should be localised/translated.

Use a typed static translation dictionary.
Do not use external i18n packages unless already installed and guaranteed to compile.

SEO REQUIREMENTS

Improve SEO strongly.

Primary SEO language:

English

Also include Iberian SEO terms for:

- Portuguese Portugal;
- Spanish Spain / Castilian;
- Catalan;
- Basque;
- Galician.

Improve:

- app/layout.tsx metadata;
- page metadata if applicable;
- title;
- description;
- Open Graph;
- Twitter card;
- robots;
- canonical URL support if practical;
- JSON-LD structured data;
- semantic headings;
- product image alt text.

Add structured data:

- Organization schema;
- WebSite schema;
- ItemList schema for products;
- Product schema for the 10 products where feasible.

English SEO terms:

- climbing holds
- bouldering holds
- climbing grips
- climbing wall holds
- indoor climbing holds
- climbing gym holds
- route setting holds
- resin climbing holds
- climbing hold manufacturer
- premium climbing holds
- technical climbing holds
- granite climbing holds
- macro climbing holds
- crimp holds
- jug holds
- climbing volumes
- climbing training holds

Portuguese SEO terms:

- presas de escalada
- presas para escalada indoor
- presas de boulder
- presas de parede de escalada
- presas para rocódromo
- presas técnicas de escalada
- presas de resina para escalada
- volumes de escalada
- presas de escalada Portugal

Spanish SEO terms:

- presas de escalada
- presas de rocódromo
- presas para escalada indoor
- presas de boulder
- agarres de escalada
- presas técnicas
- presas de resina
- volúmenes de escalada
- presas de escalada España

Catalan SEO terms:

- preses d’escalada
- preses per rocòdrom
- preses de boulder
- preses d’escalada indoor
- volums d’escalada

Basque SEO terms:

- eskalada heldulekuak
- boulder heldulekuak
- rokodromorako heldulekuak
- indoor eskalada heldulekuak

Galician SEO terms:

- presas de escalada
- presas para rocódromo
- presas de boulder
- presas de escalada indoor

Do not keyword-stuff unnaturally.
Use premium, technical, readable copy.

ACCESSIBILITY REQUIREMENTS

Ensure:

- semantic HTML;
- one clear h1;
- logical h2/h3;
- buttons are real buttons;
- links are real links;
- icon buttons have aria-label;
- images have alt text;
- forms have labels;
- validation errors are readable;
- modals/drawers have close buttons;
- visible focus states;
- mobile menu accessible;
- language switcher accessible;
- RTL layout readable.

NO PLACEHOLDER POLICY

Forbidden:

- placeholder payment;
- fake PayPal;
- fake Web3Forms;
- fake email sending;
- fake order confirmation;
- fake checkout;
- fake buttons;
- dead links;
- empty href;
- console-only form submission;
- demo wording;
- simulated wording;
- coming soon;
- TODO;
- test mode visible to customers;
- preview mode;
- disabled checkout;
- fake card fields;
- fake Stripe;
- fake bank transfer;
- broken images;
- missing translations;
- untranslated UI;
- corrupted translation characters.

If a feature cannot be made real, hide it completely unless it is one of the required active features. Required active features must be implemented properly.

ACTIVE FEATURES

Active:

- PayPal Live payment
- Web3Forms real email sending
- product shop
- cart
- checkout
- B2B form
- contact form
- multilingual site
- SEO

Inactive and hidden:

- Stripe/card payment
- bank transfer
- PayPal sandbox
- demo payment
- simulated payment

CODE QUALITY REQUIREMENTS

Use TypeScript properly.

Avoid:

- undefined variables;
- missing imports;
- broken API routes;
- avoidable any;
- direct browser APIs during SSR;
- hydration errors;
- hardcoded wrong image paths;
- fragile duplicated totals logic;
- payment secret inside client components;
- fake success states;
- fake total calculations.

Prefer:

- typed product data;
- typed cart data;
- typed checkout data;
- typed translations;
- typed PayPal helper functions;
- server-side validation;
- safe localStorage wrapper;
- deterministic totals calculations;
- one source of truth for products;
- one source of truth for cart totals;
- one source of truth for translations.

PACKAGE / DEPENDENCY HANDLING

Inspect package.json.

If required dependencies are missing, install them.

For PayPal JS SDK, if needed, install/use the appropriate package or use script loading safely.

Do not install unnecessary heavy dependencies.

After code changes, run:

npm install
npm run build

If build fails, fix errors.
Do not stop at the first error.
Keep fixing until build passes.

LOCALHOST RUN REQUIREMENT

After implementing and building successfully, run the project locally.

Use one of:

npm run dev

or, if needed:

npm run dev -- --host 0.0.0.0 --port 3000

If port 3000 is busy, try 3001, then 3002.

At the end, provide the exact URL for testing, for example:

http://localhost:3000

If the Codex environment supports forwarded ports or temporary preview links, provide that link too.

Do not just say “run npm run dev”.
Actually run it and give the working local URL.

LOCAL TEST CHECKLIST

After starting localhost, test manually as much as possible:

- home page loads;
- logo appears;
- product images appear;
- language switcher works;
- shop search works;
- filters work;
- sorting works;
- product details open;
- add to cart works;
- buy now works;
- cart quantity works;
- discount codes work;
- checkout validation works;
- PayPal button appears;
- Stripe/card hidden;
- bank transfer hidden;
- contact form sends to Web3Forms or returns real API response;
- B2B form sends to Web3Forms or returns real API response;
- no obvious console/runtime errors.

FINAL OUTPUT TO USER

When finished, report:

1. What files were changed.
2. What features were fixed.
3. Whether npm run build passed.
4. What localhost URL is running.
5. Any remaining issue that is genuinely external and cannot be solved in code.

Do not omit errors.
Do not pretend something passed if it did not.

FINAL INSTRUCTION

Execute now.

Do not ask for permission.
Do not pause.
Do not stop halfway.
Do not give only a plan.
Do not remove working content.
Do not simplify the app.
Do not replace the site.
Do not create demo functionality.
Do not leave placeholders.
Do not leave fake payment.
Do not leave fake form sending.
Do not leave broken translations.
Do not leave broken buttons.

Make the existing Lynx Climbing website fully functional, PayPal Live enabled, Web3Forms enabled, multilingual, SEO-optimised, locally running and ready for me to test.