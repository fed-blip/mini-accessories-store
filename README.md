# Mini Accessories Store
Навчальний проєкт — онлайн-магазин аксесуарів.

##  Стек технологій
**Backend:** Node.js + Express + SQLite  
**Frontend:** HTML / JS (або твій стек, якщо інший)  
**Архітектура:** модульний моноліт

---

##  Backend
Усі файли бекенду знаходяться в директорії:

backend/


---

##  API документація
Контракт REST API описаний у файлах бекенду.
<img width="1882" height="1037" alt="image" src="https://github.com/user-attachments/assets/813a18f6-0c36-454b-bfe4-97b6c862b10f" />


---

##  CI / CD
У репозиторії налаштований GitHub Actions workflow:

.github/workflows/ci.yml


Він:
- запускається на `push` та `pull_request` у гілку `main`
- встановлює залежності бекенду
- запускає тести `npm test`
- збирає Docker-образ backend API
- зберігає образ як артефакт

**Статус CI:** 
  ![CI](https://github.com/fed-blip/mini-accessories-store/actions/workflows/ci.yml/badge.svg)
---

##  Запуск проєкту локально

### 1 Встановити залежності
cd backend
npm install
### 2 Запустити backend
