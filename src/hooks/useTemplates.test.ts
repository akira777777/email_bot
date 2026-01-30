import { renderHook, act } from '@testing-library/react';
import { useTemplates } from './useTemplates';
import { describe, it, expect } from 'vitest';

describe('useTemplates', () => {
  it('should initialize with default templates', () => {
    const { result } = renderHook(() => useTemplates());
    expect(result.current.templates.length).toBeGreaterThan(0);
  });

  it('should add a template', () => {
    const { result } = renderHook(() => useTemplates());
    const initialLength = result.current.templates.length;

    act(() => {
      result.current.addTemplate({
        name: 'New Template',
        subject: 'Hello',
        body: 'World',
      });
    });

    expect(result.current.templates.length).toBe(initialLength + 1);
    expect(result.current.templates[result.current.templates.length - 1].name).toBe('New Template');
  });

  it('should edit a template', () => {
    const { result } = renderHook(() => useTemplates());
    const id = result.current.templates[0].id;

    act(() => {
      result.current.editTemplate(id, { name: 'Updated Name' });
    });

    expect(result.current.templates.find(t => t.id === id)?.name).toBe('Updated Name');
  });

  it('should delete a template', () => {
    const { result } = renderHook(() => useTemplates());
    const idToDelete = result.current.templates[0].id;

    act(() => {
      result.current.deleteTemplate(idToDelete);
    });

    expect(result.current.templates.find(t => t.id === idToDelete)).toBeUndefined();
  });
});
