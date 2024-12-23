# Restaurant Ordering System

Tento projekt je kompletní systém pro správu objednávek restaurace. Obsahuje přihlašovací systém, kuchařské rozhraní, a backendovou API pro správu objednávek. Systém je navržen tak, aby byl uživatelsky přívětivý jak pro zákazníky, tak pro kuchaře.

---

## Popis fungování systému

1. Na stolech v restauraci je umístěn QR kód, který odkazuje na stránku `index.html`.
2. Zákazník pomocí QR kódu otevře stránku, kde zadá číslo svého stolu a vyplní objednávku.
3. Po odeslání objednávky je zákazník přesměrován na stránku `customer-orders.html`, kde může sledovat stav svých objednávek.
4. Kuchař přijme objednávku prostřednictvím stránky `kitchen.html`.
5. Jakmile kuchař připraví objednávku, označí ji jako dokončenou. Tím se:
   - Stav objednávky aktualizuje na stránce zákazníka.
   - Na LED matici se zobrazí zpráva, že objednávka je připravena.
   - Přehraje se zvukové upozornění signalizující, že objednávka je hotová.

---

## Struktura projektu

### Hlavní komponenty

1. **`package.json`**
   - Definuje projektové závislosti a specifikace prostředí.
   - Klíčové závislosti:
     - `express`: Rámec pro webový server.
     - `body-parser`: Middleware pro parsování JSON.
     - `cors`: Middleware pro povolení CORS.

2. **`server.js`**
   - Hlavní backendová aplikace.
   - Obsahuje endpointy:
     - `POST /api/orders`: Vytvoření nové objednávky.
     - `GET /api/orders`: Získání seznamu objednávek.
     - `PATCH /api/orders/:id`: Aktualizace stavu objednávky.
     - `DELETE /api/orders`: Smazání všech objednávek.

3. **Frontendové stránky:**
   - `index.html`: Stránka pro zadání čísla stolu a vytvoření objednávky.
   - `kitchen.html`: Kuchařské rozhraní.
     - Zobrazuje všechny objednávky a umožňuje měnit jejich stav.
   - `customer-orders.html`: Zákaznický pohled na objednávky.
     - Zobrazuje stav objednávek z pohledu zákazníka.

---

## Jak spustit projekt

### Požadavky

- Node.js (minimálně verze 14.x)

### Instalace

1. Naklonujte repozitář:

   ```bash
   git clone https://github.com/username/restaurant-ordering-system.git
   cd restaurant-ordering-system
   ```

2. Nainstalujte závislosti:

   ```bash
   npm install
   ```

### Spuštění serveru

1. Spusťte server:

   ```bash
   npm start
   ```

2. Aplikace poběží na `http://localhost:3000` (nebo na portu definovaném v proměnných prostředí).

---

## API Dokumentace

### Endpointy

1. **`POST /api/orders`**
   - **Popis:** Vytvoří novou objednávku.
   - **Tělo požadavku:**
     ```json
     {
       "tableNumber": 1,
       "items": [
         { "name": "Pizza Margherita", "qty": 2 },
         { "name": "Espresso", "qty": 1 }
       ]
     }
     ```
   - **Odpověď:**
     ```json
     {
       "id": 1,
       "tableNumber": 1,
       "items": [
         { "name": "Pizza Margherita", "qty": 2 },
         { "name": "Espresso", "qty": 1 }
       ],
       "status": "pending"
     }
     ```

2. **`GET /api/orders`**
   - **Popis:** Vrátí seznam všech objednávek.
   - **Odpověď:**
     ```json
     [
       {
         "id": 1,
         "tableNumber": 1,
         "items": [
           { "name": "Pizza Margherita", "qty": 2 },
           { "name": "Espresso", "qty": 1 }
         ],
         "status": "pending"
       }
     ]
     ```

3. **`PATCH /api/orders/:id`**
   - **Popis:** Aktualizuje stav objednávky.
   - **Tělo požadavku:**
     ```json
     {
       "status": "completed"
     }
     ```
   - **Odpověď:**
     ```json
     {
       "id": 1,
       "tableNumber": 1,
       "items": [
         { "name": "Pizza Margherita", "qty": 2 },
         { "name": "Espresso", "qty": 1 }
       ],
       "status": "completed"
     }
     ```

4. **`DELETE /api/orders`**
   - **Popis:** Vymaže všechny objednávky (pro testování).
   - **Odpověď:**
     ```text
     All orders deleted.
     ```

---

## Poznámky pro vývojáře

1. **Middleware:**
   - `body-parser` slouží pro parsování příchozích JSON dat.
   - `cors` zajišťuje, že API může být přístupné z různých domén.

2. **Frontend:**
   - Frontendové stránky jsou čistě HTML a JavaScript.
   - Interakce s API probíhá pomocí `fetch`.

3. **Testovací data:**
   - Při vývoji můžete použít endpoint `DELETE /api/orders` k rychlému vyčištění seznamu objednávek.

---

## Plánované rozšíření

- Přidání autentizace pomocí JWT.
- Možnost editace existujících objednávek.
- Notifikace pro kuchaře při přijetí nové objednávky.

