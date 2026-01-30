import { renderHook, act } from '@testing-library/react';
import { useContacts } from './useContacts';
import { describe, it, expect } from 'vitest';

describe('useContacts', () => {
  it('should initialize with default contacts', () => {
    const { result } = renderHook(() => useContacts());
    expect(result.current.contacts.length).toBeGreaterThan(0);
  });

  it('should add a contact', () => {
    const { result } = renderHook(() => useContacts());
    const initialLength = result.current.contacts.length;

    act(() => {
      result.current.addContact({
        companyName: 'Test Corp',
        email: 'test@example.com',
        contactPerson: 'Tester',
        phone: '123',
      });
    });

    expect(result.current.contacts.length).toBe(initialLength + 1);
    expect(result.current.contacts[result.current.contacts.length - 1].companyName).toBe('Test Corp');
  });

  it('should delete a contact', () => {
    const { result } = renderHook(() => useContacts());
    const idToDelete = result.current.contacts[0].id;

    act(() => {
      result.current.deleteContact(idToDelete);
    });

    expect(result.current.contacts.find(c => c.id === idToDelete)).toBeUndefined();
  });

  it('should select a contact', () => {
    const { result } = renderHook(() => useContacts());
    const id = result.current.contacts[0].id;

    act(() => {
        result.current.selectContact(id);
    });

    expect(result.current.selectedContacts).toContain(id);

    act(() => {
        result.current.selectContact(id);
    });

    expect(result.current.selectedContacts).not.toContain(id);
  });
});
