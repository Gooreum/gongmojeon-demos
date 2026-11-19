// Registers Appeal Desk's operations with the agent runtime (agent-manifest.json
// "actions.module"). The actions wrap js/state.js, so the page and the assistant share
// one set of rules. Apache-2.0.
import { Page, OPTIONAL_PARAGRAPHS, DOC_IDS } from "./js/state.js";

class SiteActions {
  static registerActions(actions) {
    actions.register(SiteActions.readStateAction());
    actions.register(SiteActions.insertAction());
    actions.register(SiteActions.checkAction());
  }

  static readStateAction() {
    return {
      name: "get_appeal_state",
      description: "Read the current notice facts (plan type, notice date, reason category, urgent), the computed deadlines, which optional letter paragraphs are in the letter, and the document checklist. Contains no names or ID numbers.",
      effect: "read",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => Page.getState(),
    };
  }

  static insertAction() {
    return {
      name: "insert_letter_paragraph",
      description: "Add one standard paragraph to the visitor's appeal letter: docs (request documents), urgent (expedited decision), cont (keep coverage during appeal) or ext (external review). The browser asks the visitor to confirm first. Refuses urgent when the notice is not urgent.",
      effect: "irreversible",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["paragraph"],
        properties: { paragraph: { type: "string", enum: OPTIONAL_PARAGRAPHS, description: "Which paragraph to add." } },
      },
      execute: (args) => Page.insertParagraph(args.paragraph),
    };
  }

  static checkAction() {
    return {
      name: "check_document",
      description: "Tick or untick one document on the visitor's checklist of documents to ask the plan for. Only changes the checklist on this page. The browser asks the visitor to confirm first.",
      effect: "irreversible",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["id"],
        properties: {
          id: { type: "string", enum: DOC_IDS, description: "Document id from get_appeal_state." },
          checked: { type: "boolean", description: "True to tick (default), false to untick." },
        },
      },
      execute: (args) => Page.checkDocument(args.id, args.checked !== false),
    };
  }
}

export const registerActions = SiteActions.registerActions;
