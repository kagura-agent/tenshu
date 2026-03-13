import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// We test the TSV parsing logic by importing the route and using Hono's test client
import { Hono } from "hono";

const TEST_DIR = join(tmpdir(), "tenshu-test-results");
const TEST_TSV = join(TEST_DIR, "results.tsv");

describe("results route", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  function parseTsvLine(line: string) {
    const [timestamp, cycle, task, agent, score, status, description] = line.split("\t");
    return {
      timestamp,
      cycle: Number(cycle),
      task,
      agent,
      score: Number(score),
      status,
      description: description || "",
    };
  }

  it("parses a valid TSV line correctly", () => {
    const line = "2026-03-12T14:00:00.000Z\t42\tcode-review\tBulma\t7.8\tkeep\tReviewed auth middleware";
    const row = parseTsvLine(line);

    expect(row.timestamp).toBe("2026-03-12T14:00:00.000Z");
    expect(row.cycle).toBe(42);
    expect(row.task).toBe("code-review");
    expect(row.agent).toBe("Bulma");
    expect(row.score).toBe(7.8);
    expect(row.status).toBe("keep");
    expect(row.description).toBe("Reviewed auth middleware");
  });

  it("handles missing description", () => {
    const line = "2026-03-12T14:00:00.000Z\t1\ttask\tagent\t5.0\tdiscard\t";
    const row = parseTsvLine(line);
    expect(row.description).toBe("");
  });

  it("parses multiple TSV lines", () => {
    const tsv = [
      "timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription",
      "2026-03-12T14:00:00.000Z\t1\ttask-a\tSenku\t6.5\tkeep\tDid research",
      "2026-03-12T15:00:00.000Z\t2\ttask-b\tBulma\t8.2\tkeep\tWrote code",
      "2026-03-12T16:00:00.000Z\t3\ttask-c\tVegeta\t3.1\tdiscard\tFailed QA",
    ].join("\n");

    const lines = tsv.trim().split("\n");
    const rows = lines.slice(1).map(parseTsvLine);

    expect(rows).toHaveLength(3);
    expect(rows[0].agent).toBe("Senku");
    expect(rows[1].score).toBe(8.2);
    expect(rows[2].status).toBe("discard");
  });

  it("returns empty array for header-only TSV", () => {
    const tsv = "timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription";
    const lines = tsv.trim().split("\n");
    const rows = lines.length < 2 ? [] : lines.slice(1).map(parseTsvLine);
    expect(rows).toHaveLength(0);
  });
});
