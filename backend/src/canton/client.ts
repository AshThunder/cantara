import { v4 as uuid } from 'uuid';
import { getCantonToken } from './auth.js';
import type { CantonConfig } from './config.js';

type Json = Record<string, unknown>;

export class CantonClient {
  constructor(private readonly config: CantonConfig) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getCantonToken(this.config);
    const res = await fetch(`${this.config.ledgerUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Canton API ${path} (${res.status}): ${text}`);
    }
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  async getLedgerEnd(): Promise<number> {
    const data = await this.request<{ offset?: number }>('/v2/state/ledger-end');
    return Number(data.offset ?? 0);
  }

  async submitAndWait(
    actAs: string[],
    commands: Json[],
    readAs: string[] = []
  ): Promise<Json> {
    const party = actAs[0] ?? this.config.operatorParty;
    return this.request('/v2/commands/submit-and-wait-for-transaction', {
      method: 'POST',
      body: JSON.stringify({
        commands: {
          commandId: `cantara-${uuid()}`,
          actAs,
          readAs,
          commands,
        },
        transactionFormat: {
          transactionShape: 'TRANSACTION_SHAPE_LEDGER_EFFECTS',
          eventFormat: {
            filtersByParty: { [party]: {} },
            verbose: true,
          },
        },
      }),
    });
  }

  async queryActiveContracts(party: string, templateIds?: string[]): Promise<Json[]> {
    const offset = await this.getLedgerEnd();

    const cumulative =
      templateIds?.map((templateId) => ({
        identifierFilter: {
          TemplateFilter: {
            value: {
              templateId,
              includeCreatedEventBlob: false,
            },
          },
        },
      })) ?? [];

    const filterBody: Json = {
      activeAtOffset: offset,
      eventFormat: {
        filtersByParty: {
          [party]: cumulative.length ? { cumulative } : {},
        },
        verbose: true,
      },
    };

    const pages = await this.request<Json[]>('/v2/state/active-contracts', {
      method: 'POST',
      body: JSON.stringify(filterBody),
    });

    const contracts: Json[] = [];
    for (const page of pages) {
      const entry = page.contractEntry as Json | undefined;
      if (!entry) continue;
      const jsActive = entry.JsActiveContract as Json | undefined;
      const created = jsActive?.createdEvent as Json | undefined;
      if (created?.contractId) {
        contracts.push({
          contractId: created.contractId,
          templateId: created.templateId,
          createArgument: created.createArgument,
          createdAt: created.createdAt,
        });
      }
    }
    return contracts;
  }

  createCommand(templateId: string, args: Json): Json {
    return { CreateCommand: { templateId, createArguments: args } };
  }

  exerciseCommand(
    templateId: string,
    contractId: string,
    choice: string,
    choiceArgument: Json = {}
  ): Json {
    return { ExerciseCommand: { templateId, contractId, choice, choiceArgument } };
  }
}
