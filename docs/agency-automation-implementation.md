# Implementacao em modo agencia de automacao

## Direcao do produto

No primeiro momento, a ImobIA nao tera cadastro publico aberto. O acesso sera controlado pela agencia ou pelo operador da plataforma.

O cliente final nao cria conta sozinho. A agencia configura a operacao, cadastra a imobiliaria ou corretor autonomo, conecta o WhatsApp e acompanha os atendimentos.

## Fluxo inicial

1. A agencia cria uma organizacao para o cliente.
2. A agencia cadastra owner, managers e brokers.
3. Cada corretor recebe um telefone de notificacao.
4. A agencia cadastra ou importa os imoveis.
5. A agencia conecta o WhatsApp da operacao.
6. A IA recebe mensagens, qualifica o contato e sugere imoveis.
7. O sistema cria ou atualiza o lead.
8. O lead e atribuido manualmente no MVP.
9. O corretor responsavel recebe aviso no proprio WhatsApp.
10. A visita e registrada na agenda interna.

## O que fica publico

- Landing page institucional da ImobIA.
- Catalogo publico por slug quando a operacao tiver imoveis publicados.
- Botao de interesse ou WhatsApp no catalogo.

## O que fica privado

- Dashboard.
- Leads.
- Conversas.
- Agenda.
- Corretores.
- Configuracoes de WhatsApp.
- Integracoes.

## Cadastro de clientes

Sem signup publico no inicio.

A criacao de clientes deve acontecer por painel interno ou procedimento operacional:

- criar organization
- criar usuarios no Supabase Auth
- criar profiles vinculados a organization
- definir roles
- preencher notification_phone dos corretores

## Roles

Owner:
- dono da organizacao
- visualiza e gerencia tudo

Manager:
- gerencia operacao e corretores
- visualiza todos os leads da organizacao

Broker:
- recebe leads atribuidos
- visualiza seus leads, visitas e conversas

## Distribuicao de leads

MVP:
- manual

Futuro:
- round_robin
- fixed_broker
- regras por cidade, bairro, finalidade, faixa de preco ou empreendimento

## WhatsApp

A primeira integracao prevista e Evolution API.

Responsabilidades:

- receber mensagens do cliente
- manter historico da conversa
- notificar corretor responsavel
- enviar mensagens operacionais quando permitido

## IA

A IA deve atuar como triagem e atendimento inicial.

Ela deve:

- receber o cliente
- entender localizacao desejada
- entender faixa de preco
- entender quartos e tipo de imovel
- comparar com os imoveis cadastrados
- qualificar o lead
- sugerir visita
- encaminhar para corretor humano quando necessario

## Etapas recomendadas

### Etapa 1 - Demo comercial

- Ajustar textos finais da landing
- Deixar dashboard demo acessivel
- Melhorar catalogo com cards reais
- Criar apresentacao do fluxo agencia

### Etapa 2 - Base operacional

- Criar Supabase project
- Aplicar migrations
- Configurar Supabase Auth
- Criar organizacao inicial
- Criar usuarios internos
- Validar RLS

### Etapa 3 - CRM minimo

- CRUD de imoveis
- CRUD de leads
- Agenda interna
- Atribuicao manual de corretor
- Notificacoes internas

### Etapa 4 - WhatsApp

- Conectar Evolution API
- Criar webhook de entrada
- Criar instancia por organization
- Salvar conversations e messages
- Notificar corretor por notification_phone

### Etapa 5 - IA

- Criar prompt final por organization
- Conectar OpenAI ou Groq
- Implementar qualificacao de lead
- Implementar matching de imoveis
- Implementar sugestao de visita

### Etapa 6 - Produto vendavel

- Billing manual ou recorrente
- Limites por plano
- Logs de atendimento
- LGPD e politicas de privacidade
- Monitoramento e backup
