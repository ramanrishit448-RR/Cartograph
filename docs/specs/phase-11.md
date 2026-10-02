# Phase 11 — Ask about the selected file

**Goal.** On the explanation tab, a conversation about the thing that's selected, answered from facts the parser already has.

## Build

- A chat under the explanation of a selected file or folded folder. The user
  types a question; the answer is written from that file's source and its real
  neighbours, or from the folder's files and the imports that cross its
  boundary — the same facts Explain is given, never a walk the model chose.
- **Show the lookup before the answer.** Each reply lists what was read: the
  selected path, its imports, its importers; for a folder, the files inside it
  and the edges crossing in or out. An answer with nothing listed is the
  failure this product exists to prevent.
- The conversation stays in the pane. Move the selection away, come back, and
  the thread is still there without asking again.
- Answers go through the one traced AI client, and the cache read sits inside
  the traced call. The same question against the same file and the same prior
  turns is a recorded run with no model call.

## Constraints

- The model may not decide that two files are connected, and it may not walk
  the graph. Every path it sees was handed to it.
- Don't persist the thread as rows. The cache is for identical questions, not
  a chat log.
- Don't install a new SDK. Gemini is already reached through the existing
  client.
- Formatting is the same three pieces Explain permits, rendered the same way,
  with repository paths in the answer acting as links on the map.
- Don't grade the code.

## Acceptance check

1. Open a file, switch to Explanation, type a question about it. The reply
   names only files that are this file or its parsed neighbours, and a list
   above the reply shows those paths as what was looked up. Clicking a path
   in the prose moves the map.
2. Ask a second question that refers to the first. The answer still knows the
   first turn.
3. Leave the file and come back. The thread is still there. Ask the first
   question again on a fresh thread for the same file: instant, and the trace
   records zero tokens.
4. Ask about a folded folder. The answer is about the folder, and the lookup
   list is the folder's files and crossing imports, not one file's source.

## Not in this phase

Letting the model pick a starting point and walk. A repo-wide agent. Storing
threads. Measuring answer quality.
