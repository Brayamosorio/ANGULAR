import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Todo, TodoPayload, TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly todos = signal<Todo[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected newTodo = { title: '', description: '' };
  protected editingId: string | number | null = null;
  protected editForm = { title: '', description: '' };

  constructor(private readonly todoService: TodoService) {}

  ngOnInit(): void {
    void this.reload();
  }

  protected trackById = (_: number, item: Todo) => String(item.id);

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const items = await this.todoService.list();
      this.todos.set(items ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo actualizar.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(form: NgForm): Promise<void> {
    const title = (this.newTodo.title ?? '').trim();
    if (!title) {
      return;
    }

    this.error.set(null);

    const payload: TodoPayload = {
      title,
      description: this.newTodo.description?.trim() || null,
      completed: false,
    };

    try {
      const created = await this.todoService.create(payload);
      this.todos.update(items => [created, ...items]);
      form.resetForm();
      this.newTodo = { title: '', description: '' };
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo crear la tarea.');
    }
  }

  startEdit(todo: Todo): void {
    this.editingId = todo.id;
    this.editForm = {
      title: todo.title ?? '',
      description: todo.description ?? '',
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm = { title: '', description: '' };
  }

  async confirmEdit(todo: Todo): Promise<void> {
    const id = todo.id;
    const title = (this.editForm.title ?? '').trim();
    const description = (this.editForm.description ?? '').trim();

    this.error.set(null);

    const payload: TodoPayload = {
      title: title || '(Sin titulo)',
      description: description || null,
    };

    const previous = this.snapshot();
    this.todos.update(items =>
      items.map(item => (this.sameId(item.id, id) ? { ...item, ...payload } : item)),
    );
    this.cancelEdit();

    try {
      const saved = await this.todoService.update(id, payload);
      this.todos.update(items =>
        items.map(item => (this.sameId(item.id, id) ? { ...item, ...saved } : item)),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo guardar la tarea.');
      this.todos.set(previous);
    }
  }

  async toggleCompletion(todo: Todo, event: Event): Promise<void> {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }

    const checked = target.checked;
    const id = todo.id;
    const payload: TodoPayload = { completed: checked };

    this.error.set(null);

    const previous = this.snapshot();
    this.todos.update(items =>
      items.map(item => (this.sameId(item.id, id) ? { ...item, completed: checked } : item)),
    );

    try {
      const saved = await this.todoService.update(id, payload);
      this.todos.update(items =>
        items.map(item => (this.sameId(item.id, id) ? { ...item, ...saved } : item)),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo actualizar la tarea.');
      this.todos.set(previous);
    }
  }

  async remove(todo: Todo): Promise<void> {
    const id = todo.id;
    const previous = this.snapshot();
    this.todos.set(previous.filter(item => !this.sameId(item.id, id)));

    this.error.set(null);

    try {
      await this.todoService.remove(id);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo eliminar la tarea.');
      this.todos.set(previous);
    }
  }

  protected isEditing(todo: Todo): boolean {
    return this.sameId(this.editingId, todo.id);
  }

  private snapshot(): Todo[] {
    return this.todos().map(item => ({ ...item }));
  }

  private sameId(a: unknown, b: unknown): boolean {
    return String(a) === String(b);
  }
}
