import { describe, it, expect } from "vitest";
import type { Agent, AgentConfig, AgentState, AgentStatus, Session, ResultRow } from "../types.js";

// These tests verify the type contracts are sound by constructing valid objects.
// If types change in a breaking way, these will fail to compile.

describe("Agent types", () => {
  it("accepts a valid Agent object", () => {
    const config: AgentConfig = {
      id: "test-agent",
      name: "Test",
      workspace: "/tmp/test",
      model: { primary: "gpt-4", fallbacks: ["gpt-3.5"] },
    };

    const state: AgentState = {
      id: "test-agent",
      status: "working",
      currentTask: "doing stuff",
      error: undefined,
      model: "gpt-4",
      lastActivity: new Date().toISOString(),
    };

    const agent: Agent = {
      config,
      state,
      color: "#ff6b35",
      emoji: "🤖",
    };

    expect(agent.config.id).toBe("test-agent");
    expect(agent.state.status).toBe("working");
  });

  it("accepts all valid status values", () => {
    const statuses: AgentStatus[] = ["idle", "working", "thinking", "error", "offline"];
    expect(statuses).toHaveLength(5);
  });
});

describe("Session type", () => {
  it("accepts a valid Session object", () => {
    const session: Session = {
      id: "sess-1",
      agentId: "test-agent",
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      model: "gpt-4",
      cost: 0.05,
    };

    expect(session.totalTokens).toBe(session.inputTokens + session.outputTokens);
  });
});

describe("ResultRow type", () => {
  it("accepts valid status values", () => {
    const statuses: ResultRow["status"][] = ["keep", "discard", "crash", "skip"];
    expect(statuses).toHaveLength(4);
  });

  it("accepts a valid ResultRow", () => {
    const row: ResultRow = {
      timestamp: new Date().toISOString(),
      cycle: 42,
      task: "code-review",
      agent: "Bulma",
      score: 7.8,
      status: "keep",
      description: "Reviewed auth middleware",
    };

    expect(row.score).toBeGreaterThanOrEqual(0);
    expect(row.score).toBeLessThanOrEqual(10);
  });
});
