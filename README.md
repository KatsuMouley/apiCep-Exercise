# Exer_Consumo

Exercício de consumo de APIs externas usando **Node.js + Express**.

## Endpoints

| Método | Rota              | Descrição                                       |
|--------|-------------------|-------------------------------------------------|
| GET    | `/cep/:cep`       | Retorna o endereço formatado via API ViaCEP     |
| GET    | `/clima/:cidade`  | Retorna o clima atual via API wttr.in           |

## Como rodar

```bash
npm install
npm start
```

Servidor em `http://localhost:3000`.

## Exemplos

```
GET http://localhost:3000/cep/01001000      → 200 OK
GET http://localhost:3000/cep/00000000      → 404 Not Found
GET http://localhost:3000/cep/abc           → 400 Bad Request
GET http://localhost:3000/clima/Curitiba    → 200 OK
GET http://localhost:3000/clima/x           → 400 Bad Request
GET http://localhost:3000/clima/qwertyzzz   → 404 Not Found
```

## Testes

A pasta `thunder-tests/` contém a Collection do Thunder Client com assertions
para todos os endpoints. Importe no Thunder Client (botão **Import**) e execute.
