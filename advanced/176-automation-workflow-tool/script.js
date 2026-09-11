/**
 * Project #176: Automation Workflow Tool
 * Category: advanced
 * Key Concepts: Triggers, Actions, Conditional Logic, Visual Editor, Scheduling
 *
 * This script provides the core data structures and execution engine for an automation workflow tool.
 * It defines how workflows, triggers, actions, and conditional logic are structured and processed.
 * It also includes conceptual APIs for workflow management (e.g., for a visual editor) and scheduling integration.
 */

// --- Data Structures ---

/**
 * Represents a single trigger for a workflow.
 * @typedef {object} Trigger
 * @property {string} id - Unique ID for the trigger (e.g., 'trig-123').
 * @property {string} type - Type of trigger (e.g., 'manual', 'schedule', 'webhook', 'dataChange').
 * @property {object} config - Configuration specific to the trigger type.
 *   - For 'schedule': { cron: string, timezone
