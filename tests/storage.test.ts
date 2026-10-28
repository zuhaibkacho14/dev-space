import { describe, it, expect } from 'vitest';
import {
  createInitialDemoData,
  exportWorkspaceJson,
  validateImportJson,
  generateId,
  SCHEMA_VERSION,
} from '../src/services/storage';

describe('storage service', () => {
  it('generates unique prefixed IDs', () => {
    const id1 = generateId('proj');
    const id2 = generateId('proj');
    expect(id1.startsWith('proj_')).toBe(true);
    expect(id2.startsWith('proj_')).toBe(true);
    expect(id1).not.toBe(id2);
  });

  it('generates complete realistic demo data structure', () => {
    const demoData = createInitialDemoData();
    expect(demoData.isDemoData).toBe(true);
    expect(demoData.projects.length).toBeGreaterThan(0);
    expect(demoData.tasks.length).toBeGreaterThan(0);
    expect(demoData.snippets.length).toBeGreaterThan(0);
    expect(demoData.notes.length).toBeGreaterThan(0);
    expect(demoData.bookmarks.length).toBeGreaterThan(0);
    expect(demoData.settings.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('exports and validates workspace roundtrip JSON successfully', () => {
    const original = createInitialDemoData();
    const jsonString = exportWorkspaceJson(original);
    expect(typeof jsonString).toBe('string');

    const result = validateImportJson(jsonString);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.parsedData?.projects.length).toBe(original.projects.length);
    expect(result.parsedData?.tasks.length).toBe(original.tasks.length);
    expect(result.parsedData?.snippets.length).toBe(original.snippets.length);
    expect(result.summary?.projectsCount).toBe(original.projects.length);
  });

  it('rejects invalid JSON syntax', () => {
    const malformed = '{ "projects": [ incomplete json...';
    const result = validateImportJson(malformed);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Invalid JSON syntax');
  });

  it('rejects JSON payloads missing core schema collections', () => {
    const missingTasks = JSON.stringify({
      projects: [],
      // missing tasks, snippets, notes, bookmarks
    });
    const result = validateImportJson(missingTasks);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('tasks'))).toBe(true);
  });

  it('filters out non-conforming items during import', () => {
    const payloadWithCorruptedItems = JSON.stringify({
      projects: [
        { id: 'p1', name: 'Valid Project' },
        { id: 123 }, // Invalid: missing name and id is not string
        null,
      ],
      tasks: [{ id: 't1', title: 'Valid Task' }, { wrongField: true }],
      snippets: [],
      notes: [],
      bookmarks: [],
      focusSessions: [],
      activities: [],
      settings: {
        theme: 'dark',
        weekStartsOn: 'monday',
        pomodoro: { focusDuration: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4, soundEnabled: true, autoStartBreaks: false },
        schemaVersion: 1,
      },
    });

    const result = validateImportJson(payloadWithCorruptedItems);
    expect(result.isValid).toBe(true);
    expect(result.parsedData?.projects.length).toBe(1);
    expect(result.parsedData?.tasks.length).toBe(1);
  });
});
