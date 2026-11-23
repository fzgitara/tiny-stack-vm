import{mkdirSync as m,readdirSync as d,readFileSync as r,writeFileSync as w}from'fs';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
// opcode -> [immediate bytes, pops, pushes]; no entry means unknown opcode
const T=[];
const def=(ops,i,p,q)=>ops.forEach(o=>T[o]=[i,p,q]);
def([0,0x34],0,0,0);def([1],1,0,1);def([2],4,0,1);def([3,0x53,0x50,0x51],0,1,0);def([4],0,1,2);
def([5],0,2,2);def([6],0,2,3);def([7],0,3,3);def([0x17,0x1b,0x40],0,1,1);
def([0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x18,0x19,0x1a,0x1c,0x1d,0x1e,0x20,0x21,0x22],0,2,1);
def([0x30,0x33],2,0,0);def([0x31,0x32],2,1,0);def([0x41],0,2,0);def([0x52],0,0,1);

function run(prog, inp) {
  const n = prog.length;
  const D = new Int32Array(256);
  const C = new Int32Array(64);
  const M = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, csp = 0, olen = 0, ip = 0, pc = 0, steps = 0;
  const end = (code) => [out.subarray(0, olen), code];
  const J = () => ((prog[pc - 2] | (prog[pc - 1] << 8)) << 16) >> 16;
  for (;;) {
    if (steps === 1000000) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = prog[pc];
    const t = T[op];
    if (t === undefined) return end(5);
    if (pc + t[0] >= n) return end(9);
    steps++;
    const next = pc + 1 + t[0];
    if (sp < t[1]) return end(2);
    if (sp - t[1] + t[2] > 256) return end(3);
    pc = next;
    switch (op) {
      case 0x00: return end(0);
      case 0x01: D[sp++] = (prog[next - 1] << 24) >> 24; break;
      case 0x02: D[sp++] = prog[next - 4] | (prog[next - 3] << 8) | (prog[next - 2] << 16) | (prog[next - 1] << 24); break;
      case 0x03: sp--; break;
      case 0x04: D[sp] = D[sp - 1]; sp++; break;
      case 0x05: { const x = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = x; break; }
      case 0x06: D[sp] = D[sp - 2]; sp++; break;
      case 0x07: { const x = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = x; break; }
      case 0x17: D[sp - 1] = -D[sp - 1] | 0; break;
      case 0x1b: D[sp - 1] = ~D[sp - 1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x18: case 0x19:
      case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
        const b = D[sp - 1], a = D[sp - 2];
        let r;
        if (op >= 0x13 && op <= 0x16 && b === 0) return end(4);
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
        else if (op === 0x14) r = b === -1 ? 0 : a % b | 0;
        else if (op === 0x15) r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
        else if (op === 0x16) r = (a >>> 0) % (b >>> 0) | 0;
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = a >>> 0 < b >>> 0 ? 1 : 0;
        D[--sp - 1] = r;
        break;
      }
      case 0x30: pc = next + J(); break;
      case 0x31: if (D[--sp] === 0) pc = next + J(); break;
      case 0x32: if (D[--sp] !== 0) pc = next + J(); break;
      case 0x33:
        if (csp === 64) return end(7);
        C[csp++] = next;
        pc = prog[next - 2] | (prog[next - 1] << 8);
        break;
      case 0x34:
        if (csp === 0) return end(8);
        pc = C[--csp];
        break;
      case 0x40: {
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        D[sp - 1] = M[a];
        break;
      }
      case 0x41: {
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        M[a] = D[sp - 2];
        sp -= 2;
        break;
      }
      case 0x50: {
        const s = String(D[sp - 1]);
        if (olen + s.length > 65536) return end(11);
        sp--;
        for (let i = 0; i < s.length; i++) out[olen++] = s.charCodeAt(i);
        break;
      }
      case 0x51:
        if (olen === 65536) return end(11);
        out[olen++] = D[--sp] & 255;
        break;
      case 0x52: D[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 0x53: return end(D[--sp] & 255);
    }
  }
}

for(const id of d(I).sort()){
  const [s, code] = run(r(`${I}/${id}/program.bin`), r(`${I}/${id}/input.bin`));
  m(`${O}/${id}`, {recursive: true});
  w(`${O}/${id}/stdout.bin`, s);
  w(`${O}/${id}/exit.txt`, code + '\n');
}
