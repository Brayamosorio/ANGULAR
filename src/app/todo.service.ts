import { Injectable } from '@angular/core';

export interface Todo {
  id: number;
  title: string | null;
  description: string | null;
  completed: boolean;
  priority: number | null;
  dueAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type TodoPayload = {
  title?: string | null;
  description?: string | null;
  completed?: boolean;
  priority?: number | null;
  dueAt?: string | null;
};

type ApiTodo = {
  id: number;
  title?: string | null;
  description?: string | null;
  isCompleted?: boolean;
  priority?: number | null;
  dueAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApiResponse<T> = {
  code?: number;
  data?: T;
  messages?: string[] | null;
};

type ApiPayload = {
  title?: string | null;
  description?: string | null;
  isCompleted?: boolean;
  priority?: number | null;
  dueAt?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly baseUrl = 'https://todoapitest.juansegaliz.com/Todos';

  async list(): Promise<Todo[]> {
    const entries = await this.request<ApiTodo[]>({ path: '' });
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries.filter(this.isApiTodo).map(entry => this.mapFromApi(entry));
  }

  async create(payload: TodoPayload): Promise<Todo> {
    const created = await this.request<ApiTodo>({
      method: 'POST',
      body: this.mapCreatePayload(payload),
    });
    if (!created || !this.isApiTodo(created)) {
      throw new Error('Respuesta inesperada al crear la tarea.');
    }
    return this.mapFromApi(created);
  }

  async update(id: number, payload: TodoPayload): Promise<Todo> {
    const updated = await this.request<ApiTodo>({
      path: `/${encodeURIComponent(String(id))}`,
      method: 'PUT',
      body: this.mapUpdatePayload(payload),
    });
    if (!updated || !this.isApiTodo(updated)) {
      throw new Error('Respuesta inesperada al actualizar la tarea.');
    }
    return this.mapFromApi(updated);
  }

  async remove(id: number): Promise<void> {
    await this.request<void>({
      path: `/${encodeURIComponent(String(id))}`,
      method: 'DELETE',
    });
  }

  private async request<T>(options: { path?: string; method?: string; body?: unknown }): Promise<T> {
    const { path = '', method = 'GET', body } = options;

    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, init);
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const parsed = text ? this.safeParse(text) : null;

    if (!response.ok) {
      throw new Error(this.resolveError(parsed) || response.statusText || 'Error de la API');
    }

    return this.unwrapResponse<T>(parsed);
  }

  private mapFromApi(entry: ApiTodo): Todo {
    return {
      id: Number(entry.id),
      title: entry.title ?? null,
      description: entry.description ?? null,
      completed: Boolean(entry.isCompleted),
      priority: entry.priority ?? null,
      dueAt: entry.dueAt ?? null,
      createdAt: entry.createdAt ?? null,
      updatedAt: entry.updatedAt ?? null,
    };
  }

  private mapCreatePayload(payload: TodoPayload): ApiPayload {
    return {
      title: payload.title ?? null,
      description: payload.description ?? null,
      isCompleted: payload.completed ?? false,
      priority: payload.priority ?? 1,
      dueAt: payload.dueAt ?? null,
    };
  }

  private mapUpdatePayload(payload: TodoPayload): ApiPayload {
    const body: ApiPayload = {};
    if (payload.title !== undefined) {
      body.title = payload.title ?? null;
    }
    if (payload.description !== undefined) {
      body.description = payload.description ?? null;
    }
    if (payload.completed !== undefined) {
      body.isCompleted = payload.completed ?? false;
    }
    if (payload.priority !== undefined) {
      body.priority = payload.priority ?? null;
    }
    if (payload.dueAt !== undefined) {
      body.dueAt = payload.dueAt ?? null;
    }
    return body;
  }

  private unwrapResponse<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as ApiResponse<T>).data as T;
    }
    return payload as T;
  }

  private resolveError(payload: unknown): string | null {
    if (payload && typeof payload === 'object') {
      const maybeResponse = payload as ApiResponse<unknown>;
      const messages = Array.isArray(maybeResponse.messages) ? maybeResponse.messages : null;
      if (messages && messages.length > 0) {
        return messages.join('. ');
      }
      if ('message' in payload && typeof (payload as { message?: unknown }).message === 'string') {
        return String((payload as { message: unknown }).message);
      }
    }
    return null;
  }

  private safeParse(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  private isApiTodo(value: unknown): value is ApiTodo {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof (value as { id: unknown }).id !== 'undefined',
    );
  }
}
