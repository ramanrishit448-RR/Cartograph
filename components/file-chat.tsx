"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { ChatLookups, ChatResult } from "@/app/(workspace)/analyses/[id]/actions";
import { ExplanationText } from "./explanation-text";
import type { ExplainTarget } from "./explanation-panel";

type Tracing = Extract<ChatResult, { ok: true }>["tracing"];

export type ChatEntry =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; lookups: ChatLookups; model: string; cached: boolean; tracing: Tracing }
  | { kind: "error"; error: string };

export type ChatState = { messages: ChatEntry[]; pending: boolean };

export function FileChat(props: {
  target: ExplainTarget;
  state: ChatState | undefined;
  onAsk: (target: ExplainTarget, question: string) => void;
  isPath: (path: string) => boolean;
  renderPath: (path: string) => ReactNode;
}) {
  const [draft, setDraft] = useState("");
  const state = props.state ?? { messages: [], pending: false };
  const what = props.target.kind === "file" ? "this file" : "this folder";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question || state.pending) return;
    setDraft("");
    props.onAsk(props.target, question);
  };

  return (
    <div className="mt-3 border-t border-line pt-2">
      <p className="px-3 text-[10px] text-fg-muted">Ask about {what}. Answers use only the parsed source and neighbours listed with each reply.</p>
      <div className="mt-2 space-y-3 px-3">
        {state.messages.map((m, i) =>
          m.kind === "user" ? (
            <p key={i} className="text-[12px]">
              <span className="text-[10px] text-fg-muted">You · </span>
              {m.text}
            </p>
          ) : m.kind === "error" ? (
            <p key={i} className="text-[11px]">
              Couldn&apos;t answer. <span className="text-fg-muted">{m.error}</span>
            </p>
          ) : (
            <div key={i}>
              <Lookups lookups={m.lookups} renderPath={props.renderPath} />
              <ExplanationText text={m.text} isPath={props.isPath} onPath={props.renderPath} />
              <p className="mt-1 text-[10px] text-fg-muted">
                <span className="font-mono">{m.model}</span> · {m.cached ? "from cache, no model call" : "new answer"}
                {" · "}
                {m.tracing.on ? `traced to ${m.tracing.project}` : `not traced: ${m.tracing.reason}`}
              </p>
            </div>
          ),
        )}
        {state.pending && <p className="text-[11px] text-fg-muted">Looking up {what}…</p>}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-1 border-t border-line px-3 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={4000}
          placeholder={`Question about ${what}`}
          disabled={state.pending}
          className="min-w-0 flex-1 rounded-[3px] border border-line bg-surface px-1.5 py-1 text-[11px] outline-none placeholder:text-fg-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={state.pending || !draft.trim()}
          className="rounded-[3px] border border-line px-2 py-0.5 text-[11px] hover:bg-raised disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}

export function toChatTurns(messages: ChatEntry[]): { role: "user" | "assistant"; content: string }[] {
  const turns: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.kind === "user") turns.push({ role: "user", content: m.text });
    else if (m.kind === "assistant") turns.push({ role: "assistant", content: m.text });
  }
  return turns;
}

function Lookups({ lookups, renderPath }: { lookups: ChatLookups; renderPath: (path: string) => ReactNode }) {
  return (
    <div className="mb-1.5 rounded-[3px] border border-line bg-raised px-2 py-1.5 text-[10px] text-fg-muted">
      <p className="text-fg">Looked up</p>
      {lookups.kind === "file" ? (
        <>
          <p className="mt-0.5">
            source of {renderPath(lookups.path)}
            {lookups.sourceRead ? ", read from the analysed commit" : ", not fetched this time (cache hit)"}
          </p>
          <PathGroup label="imports" paths={lookups.imports} renderPath={renderPath} />
          <PathGroup label="imported by" paths={lookups.importedBy} renderPath={renderPath} />
        </>
      ) : (
        <>
          <PathGroup label="files in folder" paths={lookups.files} renderPath={renderPath} />
          <EdgeGroup label="into it" edges={lookups.incoming} renderPath={renderPath} />
          <EdgeGroup label="out of it" edges={lookups.outgoing} renderPath={renderPath} />
        </>
      )}
    </div>
  );
}

function PathGroup({ label, paths, renderPath }: { label: string; paths: string[]; renderPath: (path: string) => ReactNode }) {
  return (
    <p className="mt-0.5">
      {label} ({paths.length})
      {paths.length > 0 && (
        <>
          :{" "}
          {paths.map((p, i) => (
            <span key={p}>
              {i > 0 && ", "}
              {renderPath(p)}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

function EdgeGroup({
  label,
  edges,
  renderPath,
}: {
  label: string;
  edges: { from: string; to: string }[];
  renderPath: (path: string) => ReactNode;
}) {
  return (
    <p className="mt-0.5">
      {label} ({edges.length})
      {edges.length > 0 && (
        <>
          :{" "}
          {edges.map((e, i) => (
            <span key={`${e.from}->${e.to}-${i}`}>
              {i > 0 && ", "}
              {renderPath(e.from)} → {renderPath(e.to)}
            </span>
          ))}
        </>
      )}
    </p>
  );
}
