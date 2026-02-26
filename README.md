# prontuario-autonomo-medico

## Overview

Project generated using Cursor Engineering Framework.

## Structure

- src/        → Application code
- docs/       → Documentation
- .cursor/    → AI governance
- infra/      → Infrastructure
- tests/      → Automated tests

## Getting Started

1. **Configurar MCP**: Executar `/setup-mcp` no Cursor e preencher credenciais em `.cursor/mcp.json` (o arquivo está no .gitignore).
2. **Conhecimento inicial**: Executar `/harvest-knowledge` baseline se o repositório tiver `.cursor/knowledge` e stack-profile.
3. **Configurar ambiente**: Criar `.env` conforme necessidade do projeto.
4. **Descobrir projeto**: Executar **/discover-project** para alinhar objetivos, usuários, escopo e integrações; em seguida usar os comandos sugeridos (ex.: /analyze-business, /model-domain, /design-architecture).

## ADR

- [0001 — Stack e bootstrap inicial](docs/adr/0001-initial-stack.md)
