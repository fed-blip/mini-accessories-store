# 0002 – Layered Architecture

## Шари
api/ – контролери
service/ – бізнес-логіка
domain/ – сутності

## Правила
api → service → domain  
api НЕ звертається напряму в БД
