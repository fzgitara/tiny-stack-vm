import{mkdirSync as m,readdirSync as d,readFileSync as r,writeFileSync as w}from'fs';
const{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:O='/output'}=process.env;
const T='0AQ46:;?!!!!!!!!999999959995999!999!!!!!!!!!!!!!`dd`0!!!!!!!!!!!58!!!!!!!!!!!!!!4414';
const F=[(a,b)=>a+b|0,(a,b)=>a-b|0,Math.imul,(a,b)=>a/b|0,(a,b)=>a%b|0,(a,b)=>(a>>>0)/(b>>>0)|0,(a,b)=>(a>>>0)%(b>>>0)|0,(a,b)=>-b|0,(a,b)=>a&b,(a,b)=>a|b,(a,b)=>a^b,(a,b)=>~b,(a,b)=>a<<b,(a,b)=>a>>b,(a,b)=>a>>>b|0,0,(a,b)=>+(a==b),(a,b)=>+(a<b),(a,b)=>+(a>>>0<b>>>0)];
for(const id of d(I)){
const P=r(`${I}/${id}/program.bin`),N=r(`${I}/${id}/input.bin`),D=[],C=[],M=[],o=[];
let pc=0,s=0,i=0,c,S;
try{for(;;){
if(s++==1e6)throw 10;
const op=P[pc];
if(op==null)throw 9;
const t=T.charCodeAt(op)-48,z=t>>2&3,q=t&3;
if(!(t>=0))throw 5;
pc+=1+[0,1,4,2][t>>4];
if(pc>P.length)throw 9;
if(D.length<z)throw 2;
if(D.length-z+q>256)throw 3;
const[x,y,u]=D.splice(D.length-z).reverse();
if(op>18&&op<23&&!x)throw 4;
if(op>15&&op<35)D.push(F[op-16](y,x));
switch(op){
case 0:case 83:throw x&255;
case 1:case 2:D.push(P.readIntLE(pc-op*3+2,op*3-2));break;
case 4:D.push(x,x);break;
case 5:D.push(x,y);break;
case 6:D.push(y,x,y);break;
case 7:D.push(y,x,u);break;
case 48:case 49:case 50:if(op<49||(op>49?x:!x))pc+=P.readInt16LE(pc-2);break;
case 51:if(C.length>63)throw 7;C.push(pc);pc=P.readUInt16LE(pc-2);break;
case 52:if(!C.length)throw 8;pc=C.pop();break;
case 64:case 65:if(x>>>0>255)throw 6;op<65?D.push(M[x]|0):M[x]=y;break;
case 80:case 81:S=op>80?[x&255]:[...Buffer.from(''+x)];if(o.length+S.length>65536)throw 11;o.push(...S);break;
case 82:D.push(N[i++]??-1);break;
}
}}catch(e){c=e}
const R=`${O}/${id}`;
m(R,{recursive:true});
w(R+'/stdout.bin',Buffer.from(o));
w(R+'/exit.txt',''+c);
}
