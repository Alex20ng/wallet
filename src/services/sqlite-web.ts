// Mini-moteur SQL en mémoire, sans dépendance, répliquant le sous-ensemble
// du dialecte SQLite réellement utilisé par `src/repositories`.
// Il opère sur des tableaux d'objets (lignes) aux clés snake_case, identiques
// au schéma SQLite, afin que `mapRowToCategory`/`mapRowToTransaction`/... fonctionnent à l'identique sur web.
// Les agrégations et fonctions de date sont exécutées en JavaScript pour reproduire le comportement SQLite (UTC).

export type SqlValue = string | number | null | Uint8Array | boolean;
export type SqlRow = Record<string, SqlValue>;
export type SqlTable = SqlRow[];
export type SqlTables = Record<string, SqlTable>;

export type SqlResult =
  | { kind: "select"; rows: SqlRow[] }
  | { kind: "insert"; table: string; rows: SqlRow[] }
  | { kind: "update"; table: string; rows: SqlRow[] }
  | { kind: "delete"; table: string; ids: string[] }
  | { kind: "void" };

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { type: "ident"; value: string }
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "param" }
  | { type: "op"; value: string };

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      let out = "";
      while (j < n && sql[j] !== "'") {
        if (sql[j] === "\\" && sql[j + 1] === "'") {
          out += "'";
          j += 2;
          continue;
        }
        if (sql[j] === "'" && sql[j + 1] === "'") {
          out += "'";
          j += 2;
          continue;
        }
        out += sql[j];
        j++;
      }
      tokens.push({ type: "string", value: out });
      i = j + 1;
      continue;
    }
    if (c === "?" || (c === ":" && sql[i + 1] === "?")) {
      tokens.push({ type: "param" });
      i += c === "?" ? 1 : 2;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(sql[i + 1] ?? ""))) {
      const m = sql.slice(i).match(/^(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/);
      if (m) {
        tokens.push({ type: "number", value: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = sql.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (m) {
        tokens.push({ type: "ident", value: m[0] });
        i += m[0].length;
        continue;
      }
    }
    const two = sql.slice(i, i + 2);
    if (two === ">=" || two === "<=" || two === "<>" || two === "!=") {
      tokens.push({ type: "op", value: two });
      i += 2;
      continue;
    }
    if ("=()<>+-*/.,".includes(c)) {
      if (c === "." && /[0-9]/.test(sql[i + 1] ?? "")) {
        const m = sql.slice(i).match(/^\.(\d+)/);
        if (m) {
          tokens.push({ type: "number", value: parseFloat("0." + m[1]) });
          i += m[0].length;
          continue;
        }
      }
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    throw new SqlUnsupportedError(`Token inattendu "${c}" (position ${i})`);
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

interface ExprCol {
  t: "col";
  table?: string;
  name: string;
}
interface ExprLit {
  t: "lit";
  value: SqlValue;
}
interface ExprParam {
  t: "param";
}
interface ExprBin {
  t: "bin";
  op: string;
  l: Expr;
  r: Expr;
}
interface ExprUn {
  t: "un";
  op: "-";
  e: Expr;
}
interface ExprFunc {
  t: "func";
  name: string;
  args: Expr[];
  star: boolean;
}
interface ExprCase {
  t: "case";
  whens: { cond: Expr; then: Expr }[];
  els: Expr;
}
type Expr =
  | ExprCol
  | ExprLit
  | ExprParam
  | ExprBin
  | ExprUn
  | ExprFunc
  | ExprCase;

interface SelectItem {
  star: boolean;
  alias?: string; // table alias pour "t.*"
  expr?: Expr;
  outName?: string;
}
interface FromTable {
  name: string;
  alias?: string;
  join?: "inner" | "left";
  on?: Expr;
}
interface OrderItem {
  expr: Expr;
  desc: boolean;
}

interface SelectQuery {
  kind: "select";
  items: SelectItem[];
  from: FromTable[];
  where?: Expr;
  groupBy?: Expr[];
  orderBy?: OrderItem[];
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

class SqlUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SqlUnsupportedError";
  }
}

class Parser {
  private pos = 0;
  constructor(
    private tokens: Token[],
    private bindings: SqlValue[],
  ) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }
  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }
  private isKeyword(kw: string): boolean {
    const t = this.peek();
    return !!t && t.type === "ident" && t.value.toUpperCase() === kw;
  }
  private expectKeyword(kw: string) {
    const t = this.next();
    if (!t || t.type !== "ident" || t.value.toUpperCase() !== kw) {
      throw new SqlUnsupportedError(`Mot-clé ${kw} attendu`);
    }
  }
  private isOp(op: string): boolean {
    const t = this.peek();
    return !!t && t.type === "op" && t.value === op;
  }
  private eatOp(op: string): boolean {
    if (this.isOp(op)) {
      this.next();
      return true;
    }
    return false;
  }

  parseSelect(): SelectQuery {
    this.expectKeyword("SELECT");
    const items = this.parseSelectList();
    this.expectKeyword("FROM");
    const from = this.parseFrom();
    let where: Expr | undefined;
    if (this.isKeyword("WHERE")) {
      this.next();
      where = this.parseExpr();
    }
    let groupBy: Expr[] | undefined;
    if (this.isKeyword("GROUP")) {
      this.expectKeyword("GROUP");
      this.expectKeyword("BY");
      groupBy = this.parseExprList();
    }
    if (this.isKeyword("HAVING")) {
      throw new SqlUnsupportedError("HAVING non supporté");
    }
    let orderBy: OrderItem[] | undefined;
    if (this.isKeyword("ORDER")) {
      this.expectKeyword("ORDER");
      this.expectKeyword("BY");
      orderBy = this.parseOrderList();
    }
    if (this.peek()) {
      throw new SqlUnsupportedError("Syntaxe SQL en surplus après SELECT");
    }
    return { kind: "select", items, from, where, groupBy, orderBy };
  }

  private parseSelectList(): SelectItem[] {
    const items: SelectItem[] = [];
    for (;;) {
      if (this.isOp("*")) {
        this.next();
        items.push({ star: true });
      } else {
        const expr = this.parseExpr();
        let outName = this.astOutName(expr);
        if (this.isKeyword("AS")) {
          this.next();
          const t = this.next();
          if (!t || t.type !== "ident")
            throw new SqlUnsupportedError("Alias invalide");
          outName = t.value;
        }
        // "t.*" : colref étoilé avec alias de table
        const item: SelectItem =
          expr.t === "col" && expr.name === "*"
            ? { star: true, alias: expr.table }
            : { star: false, expr, outName };
        items.push(item);
      }
      if (!this.eatOp(",")) break;
    }
    return items;
  }

  private astOutName(expr: Expr): string | undefined {
    if (expr.t === "col") return expr.name;
    if (expr.t === "func") return expr.name.toLowerCase();
    return undefined;
  }

  private parseFrom(): FromTable[] {
    const tables: FromTable[] = [];
    const readTable = (): FromTable => {
      const t = this.next();
      if (!t || t.type !== "ident")
        throw new SqlUnsupportedError("Table invalide");
      const table: FromTable = { name: t.value };
      const aliasTok = this.peek();
      // alias si ident et non mot-clé réservé
      if (
        aliasTok &&
        aliasTok.type === "ident" &&
        ![
          "WHERE",
          "GROUP",
          "ORDER",
          "JOIN",
          "LEFT",
          "INNER",
          "ON",
          "HAVING",
          "LIMIT",
        ].includes(aliasTok.value.toUpperCase())
      ) {
        this.next();
        table.alias = aliasTok.value;
      }
      return table;
    };
    tables.push(readTable());
    for (;;) {
      // la jointure est portée par la table de gauche (records[prev])
      let isLeft = false;
      if (this.isKeyword("LEFT")) {
        this.next();
        isLeft = true;
      }
      if (this.isKeyword("INNER")) this.next();
      if (!this.isKeyword("JOIN")) break;
      this.next();
      const table = readTable();
      const last = tables[tables.length - 1];
      last.join = isLeft ? "left" : "inner";
      last.on = this.parseOn();
      tables.push(table);
    }
    return tables;
  }

  private parseOn(): Expr {
    this.expectKeyword("ON");
    return this.parseExpr();
  }

  private parseExprList(): Expr[] {
    const list: Expr[] = [];
    for (;;) {
      list.push(this.parseExpr());
      if (!this.eatOp(",")) break;
    }
    return list;
  }

  private parseOrderList(): OrderItem[] {
    const list: OrderItem[] = [];
    for (;;) {
      const expr = this.parseExpr();
      let desc = false;
      if (this.isKeyword("DESC")) {
        this.next();
        desc = true;
      } else if (this.isKeyword("ASC")) {
        this.next();
      }
      list.push({ expr, desc });
      if (!this.eatOp(",")) break;
    }
    return list;
  }

  // precedence-climbing
  private parseExpr(): Expr {
    return this.parseOr();
  }
  private parseOr(): Expr {
    let l = this.parseAnd();
    while (this.isKeyword("OR")) {
      this.next();
      l = { t: "bin", op: "OR", l, r: this.parseAnd() };
    }
    return l;
  }
  private parseAnd(): Expr {
    let l = this.parseComparison();
    while (this.isKeyword("AND")) {
      this.next();
      l = { t: "bin", op: "AND", l, r: this.parseComparison() };
    }
    return l;
  }
  private parseComparison(): Expr {
    const l = this.parseAdditive();
    if (this.isKeyword("IN")) {
      this.next();
      if (!this.eatOp("(")) throw new SqlUnsupportedError("IN ( attendu");
      const values = this.parseExprList();
      if (!this.eatOp(")")) throw new SqlUnsupportedError(") attendu");
      return { t: "func", name: "__in", args: [l, ...values], star: false };
    }
    if (this.isKeyword("IS")) {
      this.next();
      const neg = this.isKeyword("NOT");
      if (neg) this.next();
      if (!this.isKeyword("NULL"))
        throw new SqlUnsupportedError("IS NULL attendu");
      this.next();
      return {
        t: "func",
        name: neg ? "__isnotnull" : "__isnull",
        args: [l],
        star: false,
      };
    }
    if (
      this.isOp("=") ||
      this.isOp("!=") ||
      this.isOp("<>") ||
      this.isOp(">") ||
      this.isOp("<") ||
      this.isOp(">=") ||
      this.isOp("<=")
    ) {
      const opTok = this.next();
      if (!opTok || opTok.type !== "op")
        throw new SqlUnsupportedError("Opérateur invalide");
      const r = this.parseAdditive();
      return { t: "bin", op: opTok.value, l, r };
    }
    return l;
  }
  private parseAdditive(): Expr {
    let l = this.parseMultiplicative();
    for (;;) {
      if (this.isOp("+")) {
        this.next();
        l = { t: "bin", op: "+", l, r: this.parseMultiplicative() };
      } else if (this.isOp("-")) {
        this.next();
        l = { t: "bin", op: "-", l, r: this.parseMultiplicative() };
      } else {
        return l;
      }
    }
  }
  private parseMultiplicative(): Expr {
    let l = this.parseUnary();
    for (;;) {
      if (this.isOp("*")) {
        this.next();
        l = { t: "bin", op: "*", l, r: this.parseUnary() };
      } else if (this.isOp("/")) {
        this.next();
        l = { t: "bin", op: "/", l, r: this.parseUnary() };
      } else {
        return l;
      }
    }
  }
  private parseUnary(): Expr {
    if (this.isOp("-")) {
      this.next();
      return { t: "un", op: "-", e: this.parseUnary() };
    }
    if (this.isKeyword("NOT")) {
      this.next();
      return {
        t: "func",
        name: "__not",
        args: [this.parseUnary()],
        star: false,
      };
    }
    return this.parsePrimary();
  }
  private parsePrimary(): Expr {
    const t = this.peek();
    if (!t) throw new SqlUnsupportedError("Expression invalide");
    if (t.type === "number") {
      this.next();
      return { t: "lit", value: t.value };
    }
    if (t.type === "string") {
      this.next();
      return { t: "lit", value: t.value };
    }
    if (t.type === "param") {
      this.next();
      const value = this.bindings.length > 0 ? this.bindings.shift()! : null;
      return { t: "lit", value };
    }
    if (t.type === "op" && t.value === "(") {
      this.next();
      const e = this.parseExpr();
      if (!this.eatOp(")")) throw new SqlUnsupportedError(") attendu");
      return e;
    }
    if (t.type === "ident") {
      const kw = t.value.toUpperCase();
      if (kw === "CASE") {
        return this.parseCase();
      }
      if (kw === "NULL") {
        this.next();
        return { t: "lit", value: null };
      }
      this.next();
      let name = t.value;
      let table: string | undefined;
      if (this.isOp(".")) {
        this.next();
        const star = this.isOp("*");
        if (star) {
          this.next();
          return { t: "col", table: name, name: "*" };
        }
        const colTok = this.next();
        if (!colTok || colTok.type !== "ident") {
          throw new SqlUnsupportedError("Colonne invalide");
        }
        table = name;
        name = colTok.value;
      }
      if (this.isOp("(")) {
        this.next();
        let args: Expr[] = [];
        let star = false;
        if (this.isOp("*")) {
          this.next();
          star = true;
        } else if (!this.isOp(")")) {
          args = this.parseExprList();
        }
        if (!this.eatOp(")")) throw new SqlUnsupportedError(") attendu");
        return { t: "func", name: name.toUpperCase(), args, star };
      }
      return { t: "col", table, name };
    }
    throw new SqlUnsupportedError(`Expression invalide (${t.value})`);
  }

  private parseCase(): Expr {
    this.next(); // CASE
    const whens: { cond: Expr; then: Expr }[] = [];
    while (this.isKeyword("WHEN")) {
      this.next();
      const cond = this.parseExpr();
      this.expectKeyword("THEN");
      const then = this.parseExpr();
      whens.push({ cond, then });
    }
    let els: Expr = { t: "lit", value: null };
    if (this.isKeyword("ELSE")) {
      this.next();
      els = this.parseExpr();
    }
    this.expectKeyword("END");
    return { t: "case", whens, els };
  }
}

// ---------------------------------------------------------------------------
// Évaluation
// ---------------------------------------------------------------------------

const AGGREGATES = new Set(["SUM", "COUNT", "MIN", "MAX", "AVG"]);

// Ligne jointe : alias -> { colonnes }
type JoinedRow = Record<string, SqlRow>;

function makeCtx(row: JoinedRow): JoinedRow {
  return row;
}

function resolveCol(
  name: string,
  table: string | undefined,
  ctx: JoinedRow,
): SqlValue {
  if (table) {
    const r = ctx[table];
    if (!r) throw new SqlUnsupportedError(`Table/alias inconnu : ${table}`);
    // extension NULL des lignes LEFT JOIN sans correspondance
    if (!(name in r)) return null;
    return r[name];
  }
  for (const key of Object.keys(ctx)) {
    if (name in ctx[key]) return ctx[key][name];
  }
  throw new SqlUnsupportedError(`Colonne inconnue : ${name}`);
}

function toNumber(v: SqlValue): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") {
    const m = v.match(/^\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/);
    if (m) {
      const num = parseFloat(m[1]);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  }
  return 0;
}

function compareValues(a: SqlValue, b: SqlValue): number {
  if (typeof a === "number" || typeof b === "number") {
    const x = toNumber(a);
    const y = toNumber(b);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (a === null || a === undefined)
    return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  const x = String(a);
  const y = String(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

function truthy(v: SqlValue): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0;
  return true;
}

// Résolution de temps type SQLite (UTC). Modifieurs supportés :
// 'unixepoch', 'start of month', 'start of day', '+N units' / '-N units'.
function resolveTime(value: SqlValue, modifiers: string[]): number {
  let t: number;
  if (value === "now") t = Date.now();
  else if (typeof value === "number") t = value;
  else if (typeof value === "string" && !Number.isNaN(toNumber(value)))
    t = toNumber(value);
  else throw new SqlUnsupportedError("date(): valeur inattendue");

  for (const mod of modifiers) {
    if (mod === "unixepoch") {
      t = t * 1000;
    } else if (mod === "start of month") {
      const d = new Date(t);
      t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
    } else if (mod === "start of day") {
      const d = new Date(t);
      t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    } else {
      const m = mod.match(
        /^([-+])(\d+)\s+(seconds?|minutes?|hours?|days?|months?|years?)$/,
      );
      if (m) {
        const sign = m[1] === "-" ? -1 : 1;
        const amount = parseInt(m[2], 10) * sign;
        const unit = m[3];
        const d = new Date(t);
        if (unit.startsWith("year"))
          d.setUTCFullYear(d.getUTCFullYear() + amount);
        else if (unit.startsWith("month"))
          d.setUTCMonth(d.getUTCMonth() + amount);
        else if (unit.startsWith("day")) d.setUTCDate(d.getUTCDate() + amount);
        else if (unit.startsWith("hour"))
          d.setUTCHours(d.getUTCHours() + amount);
        else if (unit.startsWith("minute"))
          d.setUTCMinutes(d.getUTCMinutes() + amount);
        else d.setUTCSeconds(d.getUTCSeconds() + amount);
        t = d.getTime();
      }
      // autres modifieurs : ignorés (non utilisés par l'app)
    }
  }
  return t;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function sqlDate(value: SqlValue, modifiers: string[]): string {
  const t = resolveTime(value, modifiers);
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function sqlStrftime(
  format: string,
  value: SqlValue,
  modifiers: string[],
): string {
  const t = resolveTime(value, modifiers);
  const d = new Date(t);
  return format
    .replace(/%Y/g, String(d.getUTCFullYear()))
    .replace(/%m/g, pad2(d.getUTCMonth() + 1))
    .replace(/%d/g, pad2(d.getUTCDate()))
    .replace(/%H/g, pad2(d.getUTCHours()))
    .replace(/%M/g, pad2(d.getUTCMinutes()))
    .replace(/%S/g, pad2(d.getUTCSeconds()))
    .replace(/%s/g, String(Math.floor(t / 1000)));
}

function containsAggregate(expr: Expr): boolean {
  if (expr.t === "func") {
    if (AGGREGATES.has(expr.name)) return true;
    return expr.args.some(containsAggregate);
  }
  if (expr.t === "bin")
    return containsAggregate(expr.l) || containsAggregate(expr.r);
  if (expr.t === "un") return containsAggregate(expr.e);
  if (expr.t === "case")
    return (
      expr.whens.some(
        (w) => containsAggregate(w.cond) || containsAggregate(w.then),
      ) || containsAggregate(expr.els)
    );
  return false;
}

function evalExprScalar(
  expr: Expr,
  ctx: JoinedRow,
  params: SqlValue[],
): SqlValue {
  switch (expr.t) {
    case "lit":
      return expr.value;
    case "param":
      throw new SqlUnsupportedError("Paramètre non lié (bug moteur SQL)");
    case "col":
      return resolveCol(expr.name, expr.table, ctx);
    case "un":
      return -toNumber(evalExprScalar(expr.e, ctx, params));
    case "bin": {
      if (expr.op === "AND") {
        const l = evalExprScalar(expr.l, ctx, params);
        if (!truthy(l)) return l;
        return evalExprScalar(expr.r, ctx, params);
      }
      if (expr.op === "OR") {
        const l = evalExprScalar(expr.l, ctx, params);
        if (truthy(l)) return l;
        return evalExprScalar(expr.r, ctx, params);
      }
      const a = evalExprScalar(expr.l, ctx, params);
      const b = evalExprScalar(expr.r, ctx, params);
      switch (expr.op) {
        case "=":
          return compareValues(a, b) === 0;
        case "!=":
        case "<>":
          return compareValues(a, b) !== 0;
        case ">":
          return compareValues(a, b) > 0;
        case "<":
          return compareValues(a, b) < 0;
        case ">=":
          return compareValues(a, b) >= 0;
        case "<=":
          return compareValues(a, b) <= 0;
        case "+":
          return toNumber(a) + toNumber(b);
        case "-":
          return toNumber(a) - toNumber(b);
        case "*":
          return toNumber(a) * toNumber(b);
        case "/":
          return toNumber(a) / toNumber(b);
        default:
          throw new SqlUnsupportedError(`Opérateur non supporté : ${expr.op}`);
      }
    }
    case "func": {
      switch (expr.name) {
        case "__in": {
          const v = evalExprScalar(expr.args[0], ctx, params);
          return expr.args
            .slice(1)
            .some(
              (arg) => compareValues(v, evalExprScalar(arg, ctx, params)) === 0,
            );
        }
        case "__isnull": {
          const v = evalExprScalar(expr.args[0], ctx, params);
          return v === null || v === undefined;
        }
        case "__isnotnull": {
          const v = evalExprScalar(expr.args[0], ctx, params);
          return !(v === null || v === undefined);
        }
        case "__not": {
          const v = evalExprScalar(expr.args[0], ctx, params);
          return !truthy(v);
        }
        case "DATE": {
          if (expr.args.length < 1)
            throw new SqlUnsupportedError("date(): argument manquant");
          const mods = expr.args.slice(1).map((a) => {
            const v = evalExprScalar(a, ctx, params);
            return typeof v === "string" ? v : String(v);
          });
          const first =
            expr.args[0].t === "lit" ? (expr.args[0] as ExprLit).value : null;
          const val =
            first !== null && first !== undefined
              ? first
              : evalExprScalar(expr.args[0], ctx, params);
          return sqlDate(val, mods);
        }
        case "STRFTIME": {
          if (expr.args.length < 2)
            throw new SqlUnsupportedError("strftime(): arguments manquants");
          const fmtVal = evalExprScalar(expr.args[0], ctx, params);
          const mods = expr.args.slice(2).map((a) => {
            const v = evalExprScalar(a, ctx, params);
            return typeof v === "string" ? v : String(v);
          });
          const val = evalExprScalar(expr.args[1], ctx, params);
          return sqlStrftime(String(fmtVal), val, mods);
        }
        default:
          throw new SqlUnsupportedError(
            `Fonction non supportée : ${expr.name}`,
          );
      }
    }
    case "case": {
      for (const w of expr.whens) {
        if (truthy(evalExprScalar(w.cond, ctx, params))) {
          return evalExprScalar(w.then, ctx, params);
        }
      }
      return evalExprScalar(expr.els, ctx, params);
    }
    default:
      throw new SqlUnsupportedError("Expression inconnue");
  }
}

function evalAggregate(
  item: SelectItem,
  groupRows: JoinedRow[],
  params: SqlValue[],
): SqlValue {
  const expr = item.expr!;
  // Racine : une seule fonction agrégeante
  if (expr.t !== "func" || !AGGREGATES.has(expr.name)) {
    throw new SqlUnsupportedError("Aggrégat inattendu dans la liste SELECT");
  }
  const fn = expr.name;
  if (fn === "COUNT" && expr.star) return groupRows.length;
  // CAS particulier supporté : SUM(CASE ...)
  const args = expr.args;
  const values = groupRows.map((row) => {
    const ctx = makeCtx(row);
    if (args.length === 0) return null;
    const v = evalExprScalar(args[0], ctx, params);
    return v;
  });
  if (fn === "COUNT")
    return values.filter((v) => v !== null && v !== undefined).length;
  if (groupRows.length === 0) return null;
  if (fn === "MIN") {
    let best = values[0] as SqlValue;
    for (const v of values) if (compareValues(v, best) < 0) best = v;
    return best;
  }
  if (fn === "MAX") {
    let best = values[0] as SqlValue;
    for (const v of values) if (compareValues(v, best) > 0) best = v;
    return best;
  }
  let total = 0;
  for (const v of values) total += toNumber(v);
  if (fn === "AVG") return total / values.length;
  return total; // SUM
}

function buildJoinedRow(baseAlias: string, baseRow: SqlRow): JoinedRow {
  return { [baseAlias]: baseRow };
}

// ---------------------------------------------------------------------------
// Exécution SELECT
// ---------------------------------------------------------------------------

function runSelect(
  q: SelectQuery,
  tables: SqlTables,
  params: SqlValue[],
): SqlRow[] {
  // 1. Construire les lignes jointes
  let joined: JoinedRow[] = [];
  const first = q.from[0];
  const firstAlias = first.alias ?? first.name;
  const baseRows = tables[first.name];
  if (!baseRows)
    throw new SqlUnsupportedError(`Table inconnue : ${first.name}`);
  for (const row of baseRows) {
    joined.push(buildJoinedRow(firstAlias, row));
  }

  for (let i = 1; i < q.from.length; i++) {
    const f = q.from[i];
    const left = q.from[i - 1];
    const alias = f.alias ?? f.name;
    const rows = tables[f.name];
    if (!rows) throw new SqlUnsupportedError(`Table inconnue : ${f.name}`);
    const next: JoinedRow[] = [];
    for (const jr of joined) {
      let matched = false;
      for (const row of rows) {
        const ctx = { ...jr, [alias]: row };
        if (!left.on || truthy(evalExprScalar(left.on, ctx, params))) {
          next.push(ctx);
          matched = true;
        }
      }
      if (!matched && left.join === "left") {
        next.push({ ...jr, [alias]: {} as SqlRow });
      }
    }
    joined = next;
  }

  // 2. WHERE (sur l'union complète)
  if (q.where) {
    joined = joined.filter((jr) =>
      truthy(evalExprScalar(q.where!, makeCtx(jr), params)),
    );
  }

  // 3. Sélection
  // Grouper d'abord éventuellement en calculant les scalaires sélectionnés par ligne.
  const scalarSelectIndexes: number[] = [];
  q.items.forEach((it, idx) => {
    if (!it.star && it.expr && !containsAggregate(it.expr))
      scalarSelectIndexes.push(idx);
  });
  const scalarValuesByRow: SqlValue[][] = joined.map((jr) =>
    scalarSelectIndexes.map((idx) =>
      evalExprScalar(q.items[idx].expr!, makeCtx(jr), params),
    ),
  );

  // clé de groupe -> lignes
  const groups: { joined: JoinedRow[] }[] = [];
  if (q.groupBy && q.groupBy.length > 0) {
    const map = new Map<string, { joined: JoinedRow[] }>();
    joined.forEach((jr, rowIndex) => {
      const keys = q.groupBy!.map((expr) => {
        try {
          return JSON.stringify([evalExprScalar(expr, makeCtx(jr), params)]);
        } catch {
          // fallback : alias de sélection scalaire (GROUP BY day / month)
          const name = expr.t === "col" ? expr.name : null;
          if (name) {
            const itemIdx = q.items.findIndex((it) => it.outName === name);
            const posInScalars = scalarSelectIndexes.indexOf(itemIdx);
            if (posInScalars >= 0) {
              return JSON.stringify([
                scalarValuesByRow[rowIndex][posInScalars],
              ]);
            }
          }
          throw new SqlUnsupportedError("GROUP BY non résolu");
        }
      });
      const k = keys.join("|");
      let g = map.get(k);
      if (!g) {
        g = { joined: [] };
        map.set(k, g);
      }
      g.joined.push(jr);
    });
    groups.push(...map.values());
  } else if (
    q.items.some((it) => !it.star && it.expr && containsAggregate(it.expr))
  ) {
    groups.push({ joined });
  } else {
    // requête non agrégeante : une "ligne" par ligne source
    for (const jr of joined) groups.push({ joined: [jr] });
  }

  // 4. Calcul des valeurs de sortie par groupe
  const hasAggregates = q.items.some(
    (it) => !it.star && it.expr && containsAggregate(it.expr),
  );
  const resultRows: { out: SqlRow; src: JoinedRow | null }[] = [];
  for (const g of groups) {
    const out: SqlRow = {};
    const src = g.joined.length > 0 ? g.joined[0] : null;
    for (const it of q.items) {
      if (it.star) {
        if (!src) continue;
        if (it.alias) {
          const cols = src[it.alias];
          if (cols) Object.assign(out, cols);
        } else if (Object.keys(src).length === 1) {
          Object.assign(out, src[Object.keys(src)[0]]);
        }
        continue;
      }
      const name = it.outName;
      if (!name || !it.expr) continue;
      if (containsAggregate(it.expr)) {
        out[name] = evalAggregate(it, g.joined, params);
      } else {
        out[name] = src ? evalExprScalar(it.expr, makeCtx(src), params) : null;
      }
    }
    // les agrégats sur une source vide produisent quand même une ligne (NULL/0), comme SQLite
    if (g.joined.length > 0 || hasAggregates) resultRows.push({ out, src });
  }

  // 5. ORDER BY
  const orderBy = q.orderBy;
  if (orderBy && orderBy.length > 0) {
    resultRows.sort((ra, rb) => {
      for (const item of orderBy) {
        const ka = orderKey(item.expr, ra.out, ra.src);
        const kb = orderKey(item.expr, rb.out, rb.src);
        const c = compareValues(ka, kb);
        if (c !== 0) return item.desc ? -c : c;
      }
      return 0;
    });
  }

  return resultRows.map((r) => r.out);
}

function orderKey(
  expr: Expr,
  outRow: SqlRow | null,
  src: JoinedRow | null,
): SqlValue {
  // alias/colonne de sortie (ORDER BY amount, day, month, …)
  if (expr.t === "col" && !expr.table && outRow && expr.name in outRow) {
    return outRow[expr.name];
  }
  // colonne de la table source (ORDER BY t.date, t.created_at, …)
  if (src) {
    try {
      return evalExprScalar(expr, makeCtx(src), []);
    } catch {
      // repli : contexte vide
      return evalExprScalar(expr, { "": {} as SqlRow }, []);
    }
  }
  return evalExprScalar(expr, { "": {} as SqlRow }, []);
}

// ---------------------------------------------------------------------------
// Exécution des écritures (INSERT / UPDATE / DELETE)
// ---------------------------------------------------------------------------

function parseInsert(source: string, params: SqlValue[]): SqlResult {
  const normalized = source.replace(/\s+OR\s+IGNORE/i, " ").trim();
  const match = normalized.match(
    /^INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)\s*$/i,
  );
  if (!match) throw new SqlUnsupportedError("INSERT non supporté : " + source);
  const table = match[1];
  const cols = match[2].split(",").map((c) => c.trim());
  const valueTokens = match[3].split(",").map((c) => c.trim());
  if (cols.length !== valueTokens.length) {
    throw new SqlUnsupportedError(
      "INSERT: nombre de colonnes/valeurs incohérent",
    );
  }
  const rows: SqlRow[] = [];
  const row: SqlRow = {};
  cols.forEach((col, idx) => {
    const raw = valueTokens[idx];
    if (raw === "?") {
      row[col] = params.length > 0 ? params.splice(0, 1)[0] : null;
    } else if (raw.toUpperCase() === "NULL") {
      row[col] = null;
    } else if (/^[-+]?\d+(\.\d+)?$/.test(raw)) {
      row[col] = parseFloat(raw);
    } else if (raw.startsWith("'")) {
      row[col] = raw.replace(/^'|'$/g, "");
    } else {
      throw new SqlUnsupportedError(`INSERT: valeur non supportée : ${raw}`);
    }
  });
  rows.push(row);
  return { kind: "insert", table, rows };
}

function parseWrite(
  source: string,
  tables: SqlTables,
  params: SqlValue[],
): SqlResult {
  const trimmed = source.trim();
  const mInsert = trimmed.match(/^INSERT\s/i);
  if (mInsert) return parseInsert(source, params);

  const mUpdate = trimmed.match(
    /^UPDATE\s+([A-Za-z_][A-Za-z0-9_]*)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i,
  );
  if (mUpdate) {
    const table = mUpdate[1];
    let current = tables[table] ?? [];
    const bindings = [...params];
    const setPairs = mUpdate[2].split(",").map((s) => s.trim());
    const setMap: Record<string, SqlValue> = {};
    for (const pair of setPairs) {
      const eq = pair.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*=\s*(.*)$/i);
      if (!eq)
        throw new SqlUnsupportedError(`UPDATE: paire SET invalide : ${pair}`);
      let v: SqlValue;
      const raw = eq[2].trim();
      if (raw === "?") v = bindings.length > 0 ? bindings.splice(0, 1)[0] : null;
      else if (raw.toUpperCase() === "NULL") v = null;
      else if (/^[-+]?\d+(\.\d+)?$/.test(raw)) v = parseFloat(raw);
      else if (raw.startsWith("'")) v = raw.replace(/^'|'$/g, "");
      else
        throw new SqlUnsupportedError(`UPDATE: valeur non supportée : ${raw}`);
      setMap[eq[1]] = v;
    }
    const conds = resolveConds(splitAnd(mUpdate[3]), bindings);
    const updated: SqlRow[] = [];
    for (const row of current) {
      if (matchWhere(row, conds)) {
        updated.push({ ...row, ...setMap });
      }
    }
    return { kind: "update", table, rows: updated };
  }

  const mDelete = trimmed.match(
    /^DELETE\s+FROM\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+WHERE\s+(.+))?$/i,
  );
  if (mDelete) {
    const table = mDelete[1];
    const conds = mDelete[2]
      ? resolveConds(splitAnd(mDelete[2]), [...params])
      : null;
    let current = tables[table] ?? [];
    const ids: string[] = [];
    for (const row of current) {
      if (!conds || matchWhere(row, conds)) {
        const id = row.id;
        if (typeof id === "string") ids.push(id);
      }
    }
    return { kind: "delete", table, ids };
  }

  throw new SqlUnsupportedError("Écriture SQL non supportée : " + source);
}

function splitAnd(where: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < where.length; i++) {
    const c = where[i];
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (depth === 0 && where.slice(i, i + 3).toUpperCase() === "AND") {
      parts.push(cur.trim());
      cur = "";
      i += 2;
      continue;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

type ResolvedCond = { col: string; op: string; expected: SqlValue };

function resolveConds(conds: string[], bindings: SqlValue[]): ResolvedCond[] {
  return conds.map((cond) => {
    const eq = cond.match(
      /^([A-Za-z_][A-Za-z0-9_.]*)\s*(=|>=|<=|<>|!=|>|<)\s*(.*)$/i,
    );
    if (!eq)
      throw new SqlUnsupportedError(`Condition WHERE non supportée : ${cond}`);
    const raw = eq[3].trim();
    let expected: SqlValue;
    if (raw === "?")
      expected = bindings.length > 0 ? bindings.shift()! : null;
    else if (raw.toUpperCase() === "NULL") expected = null;
    else if (/^[-+]?\d+(\.\d+)?$/.test(raw)) expected = parseFloat(raw);
    else if (raw.startsWith("'")) expected = raw.replace(/^'|'$/g, "");
    else throw new SqlUnsupportedError(`WHERE: valeur non supportée : ${raw}`);
    return { col: eq[1], op: eq[2], expected };
  });
}

function matchWhere(row: SqlRow, resolved: ResolvedCond[]): boolean {
  for (const { col, op, expected } of resolved) {
    const actual = row[col];
    const c = compareValues(actual, expected);
    switch (op) {
      case "=":
        if (c !== 0) return false;
        break;
      case "!=":
      case "<>":
        if (c === 0) return false;
        break;
      case ">":
        if (!(c > 0)) return false;
        break;
      case "<":
        if (!(c < 0)) return false;
        break;
      case ">=":
        if (!(c >= 0)) return false;
        break;
      case "<=":
        if (!(c <= 0)) return false;
        break;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Point d'entrée : exécute une requête et retourne le résultat
// ---------------------------------------------------------------------------

export function executeStatement(
  source: string,
  tables: SqlTables,
  params: SqlValue[],
): SqlResult {
  const trimmed = source.trim();
  const head = trimmed.match(/^([A-Za-z]+)/)?.[0].toUpperCase();
  if (head === "SELECT") {
    const bindings = [...params];
    const parser = new Parser(tokenize(source), bindings);
    const q = parser.parseSelect();
    const rows = runSelect(q, tables, []);
    return { kind: "select", rows };
  }
  if (head === "INSERT" || head === "UPDATE" || head === "DELETE") {
    return parseWrite(source, tables, params);
  }
  // CREATE TABLE / PRAGMA / etc. : non applicables au moteur en mémoire.
  return { kind: "void" };
}
