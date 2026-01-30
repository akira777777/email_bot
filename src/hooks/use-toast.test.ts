import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from './use-toast';

describe('use-toast', () => {
  describe('toast function', () => {
    it('should create a toast and return id', () => {
      let toastResult: ReturnType<typeof toast>;
      
      act(() => {
        toastResult = toast({ title: 'Test Toast' });
      });
      
      expect(toastResult!.id).toBeDefined();
      expect(typeof toastResult!.dismiss).toBe('function');
      expect(typeof toastResult!.update).toBe('function');
    });

    it('should generate unique ids', () => {
      let id1: string;
      let id2: string;
      
      act(() => {
        id1 = toast({ title: 'Toast 1' }).id;
        id2 = toast({ title: 'Toast 2' }).id;
      });
      
      expect(id1!).not.toBe(id2!);
    });
  });

  describe('useToast hook', () => {
    it('should return toast function', () => {
      const { result } = renderHook(() => useToast());
      
      expect(typeof result.current.toast).toBe('function');
    });

    it('should return dismiss function', () => {
      const { result } = renderHook(() => useToast());
      
      expect(typeof result.current.dismiss).toBe('function');
    });

    it('should return toasts array', () => {
      const { result } = renderHook(() => useToast());
      
      expect(Array.isArray(result.current.toasts)).toBe(true);
    });

    it('should add toast to state when toast function called', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'New Toast' });
      });
      
      expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('toast dismissal', () => {
    it('should dismiss toast via returned dismiss function', () => {
      const { result } = renderHook(() => useToast());
      
      let toastRef: ReturnType<typeof toast>;
      act(() => {
        toastRef = result.current.toast({ title: 'Test' });
      });
      
      act(() => {
        toastRef.dismiss();
      });
      
      // After dismiss, toast should be marked as closed
      const dismissedToast = result.current.toasts.find(t => t.id === toastRef.id);
      expect(dismissedToast?.open).toBe(false);
    });
  });

  describe('toast update', () => {
    it('should update existing toast', () => {
      const { result } = renderHook(() => useToast());
      
      let toastRef: ReturnType<typeof toast>;
      act(() => {
        toastRef = result.current.toast({ title: 'Original' });
      });
      
      const originalToast = result.current.toasts.find(t => t.id === toastRef.id);
      expect(originalToast?.title).toBe('Original');
      
      act(() => {
        toastRef.update({ title: 'Updated', id: toastRef.id });
      });
      
      const updatedToast = result.current.toasts.find(t => t.id === toastRef.id);
      expect(updatedToast?.title).toBe('Updated');
    });
  });
});
