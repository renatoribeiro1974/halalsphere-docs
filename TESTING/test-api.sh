#!/bin/bash

# HalalSphere - API Test Script
# Testa os principais endpoints da API

echo "🧪 Testando API HalalSphere"
echo "================================"
echo ""

BASE_URL="http://localhost:3333"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testando Health Check...${NC}"
HEALTH=$(curl -s $BASE_URL/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✅ Health check OK${NC}"
else
  echo -e "${RED}❌ Health check falhou${NC}"
fi
echo ""

# 2. Login - Empresa
echo -e "${BLUE}2. Testando Login - Empresa...${NC}"
EMPRESA_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empresa@teste.com","password":"senha123"}')

if [[ $EMPRESA_LOGIN == *"token"* ]]; then
  echo -e "${GREEN}✅ Login empresa OK${NC}"
  EMPRESA_TOKEN=$(echo $EMPRESA_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${EMPRESA_TOKEN:0:50}..."
else
  echo -e "${RED}❌ Login empresa falhou${NC}"
fi
echo ""

# 3. Login - Analista
echo -e "${BLUE}3. Testando Login - Analista...${NC}"
ANALISTA_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analista@halalsphere.com","password":"senha123"}')

if [[ $ANALISTA_LOGIN == *"token"* ]]; then
  echo -e "${GREEN}✅ Login analista OK${NC}"
  ANALISTA_TOKEN=$(echo $ANALISTA_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${ANALISTA_TOKEN:0:50}..."
else
  echo -e "${RED}❌ Login analista falhou${NC}"
fi
echo ""

# 4. Login - Auditor
echo -e "${BLUE}4. Testando Login - Auditor...${NC}"
AUDITOR_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auditor@halalsphere.com","password":"senha123"}')

if [[ $AUDITOR_LOGIN == *"token"* ]]; then
  echo -e "${GREEN}✅ Login auditor OK${NC}"
else
  echo -e "${RED}❌ Login auditor falhou${NC}"
fi
echo ""

# 5. Login - Gestor
echo -e "${BLUE}5. Testando Login - Gestor...${NC}"
GESTOR_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gestor@halalsphere.com","password":"senha123"}')

if [[ $GESTOR_LOGIN == *"token"* ]]; then
  echo -e "${GREEN}✅ Login gestor OK${NC}"
else
  echo -e "${RED}❌ Login gestor falhou${NC}"
fi
echo ""

# 6. Listar Processos (Analista)
echo -e "${BLUE}6. Testando Listagem de Processos (Analista)...${NC}"
PROCESSES=$(curl -s -X GET $BASE_URL/api/processes \
  -H "Authorization: Bearer $ANALISTA_TOKEN")

if [[ $PROCESSES == *"processes"* ]] || [[ $PROCESSES == *"id"* ]]; then
  echo -e "${GREEN}✅ Listagem de processos OK${NC}"
  echo "Total de processos encontrados: $(echo $PROCESSES | grep -o '"id"' | wc -l)"
else
  echo -e "${RED}❌ Listagem de processos falhou${NC}"
fi
echo ""

echo "================================"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "📝 Resumo:"
echo "   - Backend: $BASE_URL"
echo "   - Frontend: http://localhost:5173"
echo "   - Prisma Studio: http://localhost:5555"
echo ""
echo "🔑 Credenciais de teste:"
echo "   - Empresa:  empresa@teste.com / senha123"
echo "   - Analista: analista@halalsphere.com / senha123"
echo "   - Auditor:  auditor@halalsphere.com / senha123"
echo "   - Gestor:   gestor@halalsphere.com / senha123"
