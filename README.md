# Async Report Generator

Gerador assíncrono de relatórios CSV em larga escala, construído com **AWS Lambda**, **SQS** e **S3**. Ele percorre os leads do DynamoDB em chunks, envia o relatório para o S3 via **multipart upload** e o entrega ao usuário por e-mail com uma **URL pré-assinada** de curta duração usando o **Resend**.

<p align="left">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Serverless" src="https://img.shields.io/badge/Serverless-Framework%20v4-FD5750?logo=serverless&logoColor=white" />
  <img alt="AWS" src="https://img.shields.io/badge/AWS-Lambda%20%7C%20SQS%20%7C%20S3%20%7C%20DynamoDB-FF9900?logo=amazonwebservices&logoColor=white" />
  <img alt="Resend" src="https://img.shields.io/badge/Resend-email-000000?logo=resend&logoColor=white" />
  <img alt="Biome" src="https://img.shields.io/badge/Biome-lint%20%2B%20format-60A5FA?logo=biome&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white" />
</p>

## Como funciona

```mermaid
flowchart LR
    Client([Cliente]) -->|POST /generate-report| API[API Gateway]
    API --> Queue[[SQS: generate_report_queue]]
    Queue --> Lambda[Lambda: processReport]
    Lambda -->|Scan paginado| Dynamo[(DynamoDB)]
    Lambda -->|Multipart upload| S3[(S3: reports bucket)]
    Lambda -->|URL pré-assinada 24h + e-mail| Resend{{Resend}}
    Resend -->|Link de download| Client
    Queue -.->|falha após 2 tentativas| DLQ[[SQS: DLQ]]
```

O fluxo é totalmente assíncrono — a requisição HTTP retorna imediatamente e o trabalho pesado acontece em background:

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as generateReport (HTTP)
    participant Q as SQS
    participant P as processReport (Lambda)
    participant D as DynamoDB
    participant S as S3
    participant R as Resend

    C->>A: POST /generate-report { userId, filters? }
    A->>Q: SendMessage
    A-->>C: 200 "O relatório está sendo gerado"
    Q->>P: Entrega a mensagem
    loop Para cada página de leads
        P->>D: Scan paginado
        P->>P: Monta CSV até o chunk atingir 6 MB
        P->>S: UploadPart
    end
    P->>S: CompleteMultipartUpload
    P->>S: Gera URL pré-assinada (24h)
    P->>R: Envia e-mail com o link
    R-->>C: E-mail com link de download
```

**Pontos-chave:**

| Aspecto            | Descrição                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Desacoplamento     | A requisição é desacoplada do processamento via **SQS**, mantendo a resposta rápida.                               |
| Uso de memória     | O CSV é montado de forma incremental e enviado em partes de no mínimo **6 MB** (mínimo do multipart do S3 é 5 MB). |
| Download seguro    | A URL de download é **pré-assinada e válida por 24 horas**.                                                        |
| Lifecycle do S3    | O bucket **apaga os objetos após 1 dia** e aborta multipart uploads incompletos após 1 dia.                        |
| Tolerância a falha | A fila possui uma **dead-letter queue** (`maxReceiveCount: 2`, retenção de 14 dias) para mensagens com falha.      |

## Tech stack

| Categoria     | Tecnologias                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| **Runtime**   | Node.js 24 (ARM64), TypeScript (strict)                                     |
| **Infra**     | Serverless Framework v4, esbuild                                            |
| **AWS**       | Lambda, API Gateway (HTTP API), SQS (+ DLQ), DynamoDB, S3                   |
| **Libraries** | AWS SDK v3, [Zod](https://zod.dev), [Resend](https://resend.com), [faker](https://fakerjs.dev) |
| **Tooling**   | pnpm, Biome, Husky + lint-staged, Commitlint (conventional + gitmoji)       |

## Setup

### Pré-requisitos

- **Node.js** 24+
- **pnpm** 11+
- Conta **AWS** com credenciais configuradas (ex.: `aws configure`)
- Uma **API key** do [Resend](https://resend.com)

### 1. Instale as dependências

```bash
pnpm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o arquivo `.env`:

| Variável         | Descrição                            |
| ---------------- | ------------------------------------ |
| `RESEND_API_KEY` | API key usada para enviar o e-mail.  |

> As demais variáveis (`LEADS_TABLE`, `GENERATE_REPORT_QUEUE_URL`, `REPORTS_BUCKET_NAME`) são injetadas no deploy a partir dos recursos provisionados.

### 3. Faça o deploy

```bash
pnpm dlx serverless deploy
```

> O deploy é feito na região `sa-east-1` por padrão (configurável no `serverless.yml`).
