# Plano Técnico de Piloto com Pessoas e Projetos Reais

Backlog executável para iniciar testes reais com baixo risco operacional.

## Objetivo

Validar uso real da plataforma com 5–10 equipes, garantindo:

- segurança mínima para dados de produção inicial;
- estabilidade para uso diário;
- onboarding rápido até o primeiro valor;
- coleta de feedback e métricas de produto.

## Escopo do Piloto

- **Período:** 14 dias (2 semanas)
- **Usuários alvo:** 20–50 usuários
- **Tipo de conta:** workspaces reais convidados
- **Ambiente:** produção controlada (flags e rollout gradual)

## Definição de Pronto (Go/No-Go)

- 100% dos endpoints sensíveis com validação de autorização por workspace.
- Taxa de erro crítico (P0/P1) menor que 1% das sessões.
- 80% dos novos usuários criando 1 projeto + 1 tarefa em até 15 minutos.
- Importação CSV com pelo menos 95% dos registros válidos processados.
- Feedback in-app e eventos de funil ativos em produção.

## Padrão de Labels (GitHub)

- `pilot`
- `priority:P0` | `priority:P1` | `priority:P2`
- `area:web` | `area:api` | `area:infra` | `area:product`
- `type:feature` | `type:bug` | `type:tech-debt` | `type:ops`
- `status:blocked` | `status:ready` | `status:in-progress` | `status:review`

## Milestones

- **M1 - Fundamentos de Produção (Semana 1)**
  - observabilidade, segurança, onboarding.
- **M2 - Operação de Piloto (Semana 2)**
  - importação de dados, feedback, métricas e suporte.

---

## Backlog Executável (Issues)

### EPIC 1 — Observabilidade e Confiabilidade

#### PIL-001 — Integrar captura de erros frontend e backend
- **Prioridade:** P0
- **Estimativa:** 2 dias
- **Áreas:** `area:web`, `area:api`, `area:infra`
- **Dependências:** nenhuma
- **Descrição:** integrar monitoramento de exceções e contexto de requisição (usuário, workspace, rota).
- **Checklist técnico:**
  - [x] Configurar endpoint e ambiente por app para reporte de erro (`apps/web` -> `apps/api`).
  - [x] Capturar erros não tratados, rejeições de Promise e erros de rota.
  - [x] Adicionar metadados: `userId`, `workspaceId`, `route`, `release`.
  - [x] Documentar setup e troubleshooting em `docs`.
- **Critérios de aceite:**
  - [ ] erro lançado no frontend aparece no monitoramento com rota e usuário.
  - [ ] erro lançado no backend aparece com endpoint e status HTTP.

#### PIL-002 — Padronizar logs estruturados e correlação de requests
- **Prioridade:** P0
- **Estimativa:** 1,5 dia
- **Áreas:** `area:api`, `area:infra`
- **Dependências:** PIL-001
- **Descrição:** garantir logs JSON consistentes para diagnóstico de incidentes.
- **Checklist técnico:**
  - [ ] Definir formato de log (timestamp, nível, serviço, requestId, userId, workspaceId).
  - [ ] Incluir `requestId` em middleware e propagar em respostas.
  - [ ] Ajustar logs de erro para incluir stack e contexto.
- **Critérios de aceite:**
  - [ ] 100% das rotas autenticadas com `requestId` e `workspaceId` no log.
  - [ ] é possível rastrear uma requisição ponta a ponta por `requestId`.

#### PIL-003 — Healthcheck e alertas mínimos de indisponibilidade
- **Prioridade:** P0
- **Estimativa:** 1 dia
- **Áreas:** `area:api`, `area:infra`
- **Dependências:** nenhuma
- **Descrição:** expor saúde da aplicação e alertar quedas.
- **Checklist técnico:**
  - [x] Validar endpoint de health no backend (db, cache, fila quando aplicável).
  - [x] Configurar monitor externo para uptime.
  - [ ] Configurar alerta para canal interno (e-mail/slack/discord).
- **Critérios de aceite:**
  - [ ] incidente de indisponibilidade gera alerta em até 5 minutos.

### EPIC 2 — Segurança e Permissões

#### PIL-004 — Auditoria de autorização em endpoints críticos
- **Prioridade:** P0
- **Estimativa:** 2 dias
- **Áreas:** `area:api`
- **Dependências:** nenhuma
- **Descrição:** revisar endpoints de tarefas, projetos, clientes e integrações para garantir escopo por workspace.
- **Checklist técnico:**
  - [ ] Mapear endpoints críticos em `apps/api/src/modules/**`.
  - [ ] Garantir verificação de vínculo `user-workspace-resource`.
  - [ ] Adicionar testes para acesso indevido entre workspaces.
- **Critérios de aceite:**
  - [ ] nenhum endpoint crítico retorna dados de workspace não autorizado.
  - [ ] testes de autorização cobrindo casos positivos e negativos.

#### PIL-005 — Endurecer sessão e políticas de autenticação
- **Prioridade:** P0
- **Estimativa:** 1 dia
- **Áreas:** `area:web`, `area:api`
- **Dependências:** nenhuma
- **Descrição:** ajustar expiração, refresh e regras mínimas de senha.
- **Checklist técnico:**
  - [x] Definir TTL de access/refresh token adequado ao piloto.
  - [x] Revisar fluxo de logout e invalidação de sessão.
  - [x] Aplicar política mínima de senha no cadastro/reset.
- **Critérios de aceite:**
  - [x] sessão expirada exige renovação correta sem estado inconsistente.

### EPIC 3 — Onboarding de Primeiro Valor

#### PIL-006 — Fluxo guiado: criar workspace + projeto inicial
- **Prioridade:** P0
- **Estimativa:** 2 dias
- **Áreas:** `area:web`, `area:api`
- **Dependências:** PIL-004
- **Descrição:** onboarding com passos objetivos para reduzir abandono inicial.
- **Checklist técnico:**
  - [ ] Wizard em `apps/web/src/app/onboarding/page.tsx` com 2–3 passos.
  - [ ] Criar workspace e projeto inicial no final do fluxo.
  - [ ] Persistir estado de progresso para retomar onboarding.
- **Critérios de aceite:**
  - [ ] novo usuário conclui fluxo sem erros e chega ao dashboard do workspace.

#### PIL-007 — Checklist de ativação no dashboard
- **Prioridade:** P1
- **Estimativa:** 1 dia
- **Áreas:** `area:web`
- **Dependências:** PIL-006
- **Descrição:** mostrar tarefas de ativação (criar 1 projeto, criar 1 tarefa, convidar 1 membro).
- **Checklist técnico:**
  - [x] Exibir cards de progresso no dashboard principal.
  - [x] Atualizar status em tempo real conforme ações do usuário.
  - [ ] Ocultar checklist ao concluir todas as etapas.
- **Critérios de aceite:**
  - [ ] progresso visível e persistente por usuário/workspace.

### EPIC 4 — Importação de Dados Reais

#### PIL-008 — Upload e validação de CSV (clientes/projetos/tarefas)
- **Prioridade:** P0
- **Estimativa:** 2 dias
- **Áreas:** `area:web`, `area:api`
- **Dependências:** PIL-004
- **Descrição:** permitir importação inicial para evitar entrada manual.
- **Checklist técnico:**
  - [x] Criar endpoint de upload com validação de esquema por tipo.
  - [x] Criar UI simples de importação com template CSV por entidade.
  - [x] Exibir erros por linha (coluna, valor inválido, motivo).
- **Critérios de aceite:**
  - [ ] pelo menos 95% dos registros válidos importados com sucesso.
  - [ ] registros inválidos retornam relatório de rejeição claro.

#### PIL-009 — Processamento assíncrono e auditoria de importação
- **Prioridade:** P1
- **Estimativa:** 1,5 dia
- **Áreas:** `area:api`, `area:infra`
- **Dependências:** PIL-008
- **Descrição:** processar arquivos maiores sem travar requisição HTTP.
- **Checklist técnico:**
  - [ ] Implementar job assíncrono para importação.
  - [ ] Guardar status (`queued`, `processing`, `completed`, `failed`).
  - [ ] Persistir log resumido da operação para auditoria.
- **Critérios de aceite:**
  - [ ] usuário acompanha status de importação sem timeout.

### EPIC 5 — Feedback e Métricas de Produto

#### PIL-010 — Feedback in-app com contexto automático
- **Prioridade:** P1
- **Estimativa:** 1 dia
- **Áreas:** `area:web`, `area:api`
- **Dependências:** PIL-001
- **Descrição:** coletar feedback acionável sem sair da aplicação.
- **Checklist técnico:**
  - [ ] Botão persistente “Reportar problema / Sugerir melhoria”.
  - [ ] Enviar contexto automático (rota, navegador, usuário, workspace).
  - [ ] Registrar feedback em storage rastreável (DB ou ferramenta externa).
- **Critérios de aceite:**
  - [ ] cada envio possui contexto mínimo para triagem.

#### PIL-011 — Instrumentar eventos de funil de ativação
- **Prioridade:** P0
- **Estimativa:** 1 dia
- **Áreas:** `area:web`, `area:product`
- **Dependências:** PIL-006, PIL-007
- **Descrição:** medir ativação e abandono no onboarding.
- **Checklist técnico:**
  - [ ] Definir taxonomia de eventos (`signup_completed`, `workspace_created`, `project_created`, `first_task_created`).
  - [ ] Disparar eventos no frontend/backend conforme ponto de verdade.
  - [ ] Validar integridade dos eventos em ambiente de produção.
- **Critérios de aceite:**
  - [ ] dashboard mostra conversão por etapa do funil.

#### PIL-012 — Dashboard operacional do piloto (semanal)
- **Prioridade:** P1
- **Estimativa:** 1 dia
- **Áreas:** `area:product`, `area:infra`
- **Dependências:** PIL-001, PIL-011
- **Descrição:** consolidar indicadores de uso e qualidade para decisão de continuidade.
- **Checklist técnico:**
  - [ ] Expor KPIs: ativação D1, WAU, erros críticos, tempo para primeiro valor.
  - [ ] Atualização automática diária.
  - [ ] Documento de leitura semanal para time.
- **Critérios de aceite:**
  - [ ] reunião semanal do piloto usa dados atualizados automaticamente.

---

## Sequência Recomendada de Execução

### Semana 1

1. PIL-001
2. PIL-003
3. PIL-004
4. PIL-006
5. PIL-011

### Semana 2

1. PIL-002
2. PIL-005
3. PIL-008
4. PIL-010
5. PIL-007
6. PIL-009
7. PIL-012

## Riscos e Mitigações

- **Risco:** vazamento entre workspaces por falha de autorização.
  - **Mitigação:** priorizar PIL-004 antes de onboarding e importação.
- **Risco:** instabilidade sob uso real inicial.
  - **Mitigação:** PIL-001 e PIL-003 antes de liberar para todos.
- **Risco:** baixo engajamento por fricção inicial.
  - **Mitigação:** PIL-006, PIL-007 e suporte ativo nos primeiros 7 dias.

## Ritual de Operação do Piloto

- Daily de 15 min com foco em bloqueios de P0/P1.
- Triagem de feedback duas vezes por semana.
- Review semanal com decisão: manter, ajustar ou pausar rollout.

## Template de Issue (copiar e colar)

```md
## Contexto

## Objetivo

## Escopo técnico
- [ ]

## Critérios de aceite
- [ ]

## Dependências

## Riscos

## Estimativa
```
