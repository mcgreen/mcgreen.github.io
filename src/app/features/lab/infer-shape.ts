/**
 * Infers a TypeScript-style type from a parsed JSON value. Keeps field names and
 * types only, never values, so the output can be committed safely.
 * Arrays are merged: a key missing from some items becomes optional (`?`).
 */
export function inferShape(value: unknown): string {
  return render(describe(value), 0);
}

type Node =
  | { k: 'prim'; names: Set<string> }
  | { k: 'obj'; fields: Map<string, { node: Node; optional: boolean }> }
  | { k: 'arr'; item: Node | null }
  | { k: 'union'; parts: Node[] };

function describe(v: unknown): Node {
  if (v === null) return { k: 'prim', names: new Set(['null']) };
  if (Array.isArray(v)) return { k: 'arr', item: v.length ? v.map(describe).reduce(merge) : null };
  if (typeof v === 'object') {
    const fields = new Map<string, { node: Node; optional: boolean }>();
    for (const [key, val] of Object.entries(v as object)) fields.set(key, { node: describe(val), optional: false });
    return { k: 'obj', fields };
  }
  return { k: 'prim', names: new Set([typeof v]) };
}

function merge(a: Node, b: Node): Node {
  if (a.k === 'prim' && b.k === 'prim') return { k: 'prim', names: new Set([...a.names, ...b.names]) };
  if (a.k === 'obj' && b.k === 'obj') {
    const fields = new Map<string, { node: Node; optional: boolean }>();
    for (const key of new Set([...a.fields.keys(), ...b.fields.keys()])) {
      const fa = a.fields.get(key);
      const fb = b.fields.get(key);
      fields.set(key, {
        node: fa && fb ? merge(fa.node, fb.node) : (fa ?? fb)!.node,
        optional: !fa || !fb || fa.optional || fb.optional,
      });
    }
    return { k: 'obj', fields };
  }
  if (a.k === 'arr' && b.k === 'arr') return { k: 'arr', item: a.item && b.item ? merge(a.item, b.item) : (a.item ?? b.item) };
  return { k: 'union', parts: [a, b] };
}

function render(n: Node, depth: number): string {
  const pad = '  '.repeat(depth + 1);
  switch (n.k) {
    case 'prim':
      return [...n.names].sort().join(' | ');
    case 'arr': {
      if (!n.item) return 'unknown[]';
      const inner = render(n.item, depth);
      return n.item.k === 'prim' && n.item.names.size > 1 ? `(${inner})[]` : `${inner}[]`;
    }
    case 'union':
      return n.parts.map((p) => render(p, depth)).join(' | ');
    case 'obj': {
      if (!n.fields.size) return '{}';
      const lines = [...n.fields].map(([k, f]) => `${pad}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}${f.optional ? '?' : ''}: ${render(f.node, depth + 1)};`);
      return `{\n${lines.join('\n')}\n${'  '.repeat(depth)}}`;
    }
  }
}
