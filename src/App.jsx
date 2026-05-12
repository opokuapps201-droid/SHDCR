import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// PERSISTENT STORAGE
// ═══════════════════════════════════════════════════════════════
const useStore = (key, init) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const nv = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(nv)); } catch {}
      return nv;
    });
  }, [key]);
  return [val, set];
};

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════
const USERS = [
  { id:"d1", role:"director",   name:"Dr. Ahmed Hosny",   username:"director",   password:"director123", avatar:"DH", email:"director@shdcr.edu" },
  { id:"h1", role:"headmaster", name:"Mr. Kamal Sayed",   username:"headmaster", password:"head123",     avatar:"KS", email:"headmaster@shdcr.edu" },
  { id:"t1", role:"teacher",    name:"Ms. Fatima Nasser", username:"teacher1",   password:"teach123",    avatar:"FN", email:"fatima@shdcr.edu", class:"Grade 5A" },
  { id:"t2", role:"teacher",    name:"Mr. Youssef Adel",  username:"teacher2",   password:"teach456",    avatar:"YA", email:"youssef@shdcr.edu", class:"Grade 6B" },
  { id:"t3", role:"teacher",    name:"Ms. Hana Mostafa",  username:"teacher3",   password:"teach789",    avatar:"HM", email:"hana@shdcr.edu", class:"Grade 4C" },
];
const SEED_STUDENTS = [
  { id:"S001", full_name:"Ahmed Ali Hassan",    class:"Grade 5A", dob:"2013-04-12", gender:"male",   guardian_name:"Ali Hassan",     guardian_phone:"+20123456789", photo:null, approved:true },
  { id:"S002", full_name:"Nour Mohamed Saad",   class:"Grade 5A", dob:"2013-08-23", gender:"female", guardian_name:"Mohamed Saad",   guardian_phone:"+20198765432", photo:null, approved:true },
  { id:"S003", full_name:"Sara Khalid Amin",    class:"Grade 5A", dob:"2013-02-14", gender:"female", guardian_name:"Khalid Amin",    guardian_phone:"+20111234567", photo:null, approved:true },
  { id:"S004", full_name:"Yara Ibrahim Khalil", class:"Grade 6B", dob:"2012-01-05", gender:"female", guardian_name:"Ibrahim Khalil", guardian_phone:"+20112345678", photo:null, approved:true },
  { id:"S005", full_name:"Omar Samir Nour",     class:"Grade 6B", dob:"2012-11-17", gender:"male",   guardian_name:"Samir Nour",     guardian_phone:"+20187654321", photo:null, approved:true },
  { id:"S006", full_name:"Laila Hossam Wafi",   class:"Grade 4C", dob:"2014-06-30", gender:"female", guardian_name:"Hossam Wafi",   guardian_phone:"+20155566677", photo:null, approved:true },
  { id:"S007", full_name:"Kareem Tarek Zaki",   class:"Grade 4C", dob:"2014-03-19", gender:"male",   guardian_name:"Tarek Zaki",    guardian_phone:"+20144433322", photo:null, approved:true },
  { id:"S008", full_name:"Dina Amr Farouk",     class:"Grade 5A", dob:"2013-07-08", gender:"female", guardian_name:"Amr Farouk",    guardian_phone:"+20166677788", photo:null, approved:true },
  { id:"S009", full_name:"Ziad Hassan Younis",  class:"Grade 6B", dob:"2012-05-22", gender:"male",   guardian_name:"Hassan Younis", guardian_phone:"+20177788899", photo:null, approved:true },
  { id:"S010", full_name:"Mariam Tarek Sobhi",  class:"Grade 4C", dob:"2014-09-11", gender:"female", guardian_name:"Tarek Sobhi",   guardian_phone:"+20188899900", photo:null, approved:true },
];
const CLASSES = ["Grade 4C","Grade 5A","Grade 6B"];
const RC = { director:"#c084fc", headmaster:"#38bdf8", teacher:"#34d399" };
const SC = { present:"#4ade80", late:"#fbbf24", absent:"#f87171" };
const SBG = { present:"rgba(74,222,128,0.1)", late:"rgba(251,191,36,0.1)", absent:"rgba(248,113,113,0.1)" };
const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const today = () => new Date().toISOString().split("T")[0];
const calcAge = dob => { if(!dob)return"—"; const d=new Date(dob),n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--; return a; };
const fmtDate = d => { if(!d)return"—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const fmtTime = ts => { if(!ts)return""; return new Date(ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}); };
const smsMsg = (name,status) => ({present:`Your child ${name} is present in school today. ✅`,late:`Your child ${name} arrived late today. ⚠️`,absent:`Your child ${name} is absent today. ❌`}[status]);
const attRate = (records, studentId) => { const s=records.filter(a=>a.student_id===studentId); if(!s.length)return null; return Math.round(((s.filter(a=>a.status==="present").length+s.filter(a=>a.status==="late").length)/s.length)*100); };

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{font-family:'DM Sans',sans-serif;background:#06090f;color:#cbd5e1;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
    input,select,textarea,button{font-family:'DM Sans',sans-serif}
    button{cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
    @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
    .fu{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fi{animation:fadeIn .3s ease both}
    .blink{animation:pulse 2s infinite}
    .spin{animation:spin 1s linear infinite}
    .card-hover{transition:transform .2s,box-shadow .2s,border-color .2s}
    .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.4);border-color:#1e3a5f !important}
    @media print{
      .no-print{display:none!important}
      body{background:white;color:black}
      .print-area{background:white;color:black;padding:20px}
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Av = ({label,color="#38bdf8",size=36,img=null,style={}}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:img?"#0f172a":color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.32,fontWeight:700,color,flexShrink:0,overflow:"hidden",border:`1.5px solid ${color}44`,...style}}>
    {img?<img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:label}
  </div>
);

const Badge = ({status}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:SBG[status],color:SC[status],border:`1px solid ${SC[status]}33`,textTransform:"capitalize",letterSpacing:.3,whiteSpace:"nowrap"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:SC[status],display:"inline-block"}}/>
    {status}
  </span>
);

const RolePill = ({role}) => (
  <span style={{padding:"2px 9px",borderRadius:99,fontSize:9,fontWeight:700,background:RC[role]+"18",color:RC[role],textTransform:"uppercase",letterSpacing:1}}>{role}</span>
);

const Card = ({children,style={},className="",onClick}) => (
  <div className={`${className}${onClick?" card-hover":""}`} onClick={onClick}
    style={{background:"linear-gradient(145deg,#0d1829,#0a1220)",borderRadius:16,padding:"20px 22px",border:"1px solid #0f2040",...style,cursor:onClick?"pointer":"default"}}>
    {children}
  </div>
);

const Btn = ({children,onClick,variant="primary",style={},disabled=false,size="md",icon=""}) => {
  const sz = size==="sm"?{padding:"6px 14px",fontSize:12}:size==="lg"?{padding:"13px 28px",fontSize:15}:{padding:"9px 20px",fontSize:13};
  const vs = {
    primary:{background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(14,165,233,.25)"},
    success:{background:"linear-gradient(135deg,#22c55e,#15803d)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(34,197,94,.2)"},
    danger: {background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(239,68,68,.2)"},
    warning:{background:"linear-gradient(135deg,#f59e0b,#b45309)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(245,158,11,.2)"},
    ghost:  {background:"transparent",color:"#64748b",border:"1px solid #1e293b",boxShadow:"none"},
    purple: {background:"linear-gradient(135deg,#a855f7,#7c3aed)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(168,85,247,.25)"},
    teal:   {background:"linear-gradient(135deg,#14b8a6,#0f766e)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(20,184,166,.2)"},
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{...sz,borderRadius:10,fontWeight:600,transition:"all .2s",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,...vs[variant],display:"inline-flex",alignItems:"center",gap:6,...style}}>
      {icon&&<span>{icon}</span>}{children}
    </button>
  );
};

const Inp = ({label,hint,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <input {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",transition:"border-color .2s,box-shadow .2s",...p.style}}
      onFocus={e=>{e.target.style.borderColor="#0ea5e9";e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,.15)";}}
      onBlur={e=>{e.target.style.borderColor="#1e293b";e.target.style.boxShadow="none";}}/>
    {hint&&<span style={{fontSize:11,color:"#334155"}}>{hint}</span>}
  </div>
);

const Sel = ({label,children,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <select {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",...p.style}}>{children}</select>
  </div>
);

const Textarea = ({label,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <textarea {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",resize:"vertical",lineHeight:1.5,...p.style}}
      onFocus={e=>{e.target.style.borderColor="#0ea5e9";e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,.15)";}}
      onBlur={e=>{e.target.style.borderColor="#1e293b";e.target.style.boxShadow="none";}}/>
  </div>
);

const Modal = ({open,onClose,title,children,width=520}) => {
  if(!open)return null;
  return (
    <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}} onClick={onClose}>
      <div className="fu" style={{background:"linear-gradient(145deg,#0d1829,#0a1220)",borderRadius:20,padding:28,width:"100%",maxWidth:width,maxHeight:"92vh",overflowY:"auto",border:"1px solid #1e293b",boxShadow:"0 32px 80px rgba(0,0,0,.7)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:18,color:"#f1f5f9"}}>{title}</h3>
          <button onClick={onClose} style={{background:"#0f2040",border:"none",color:"#64748b",width:32,height:32,borderRadius:"50%",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({msg,type,onClose}) => {
  useEffect(()=>{if(msg){const t=setTimeout(onClose,4000);return()=>clearTimeout(t);}}, [msg]);
  if(!msg)return null;
  const colors={success:"#22c55e",error:"#ef4444",info:"#38bdf8",warning:"#f59e0b"};
  const c=colors[type]||colors.info;
  return (
    <div className="fu" style={{position:"fixed",bottom:28,right:28,background:`linear-gradient(135deg,#0d1829,#0a1220)`,color:c,border:`1px solid ${c}44`,padding:"13px 20px",borderRadius:14,fontWeight:600,fontSize:13,zIndex:9999,boxShadow:"0 8px 40px rgba(0,0,0,.6)",maxWidth:380,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>{type==="success"?"✅":type==="error"?"❌":type==="warning"?"⚠️":"ℹ️"}</span>
      <span>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:c,opacity:.6,cursor:"pointer",marginLeft:4}}>✕</button>
    </div>
  );
};

const useToast = () => {
  const [t,setT]=useState({msg:"",type:"info"});
  const show=(msg,type="info")=>setT({msg,type});
  const hide=()=>setT({msg:"",type:"info"});
  return {toast:t,show,hide};
};

// ═══════════════════════════════════════════════════════════════
// MINI BAR CHART
// ═══════════════════════════════════════════════════════════════
const MiniBar = ({present,late,absent,total,height=32}) => {
  if(!total)return <div style={{height,borderRadius:6,background:"#0f172a",fontSize:10,color:"#334155",display:"flex",alignItems:"center",justifyContent:"center"}}>No data</div>;
  const pPct=Math.round((present/total)*100);
  const lPct=Math.round((late/total)*100);
  const aPct=100-pPct-lPct;
  return (
    <div style={{display:"flex",gap:2,height,borderRadius:6,overflow:"hidden"}}>
      {pPct>0&&<div style={{flex:pPct,background:"#22c55e",minWidth:2,transition:"flex .5s"}} title={`Present: ${present}`}/>}
      {lPct>0&&<div style={{flex:lPct,background:"#f59e0b",minWidth:2,transition:"flex .5s"}} title={`Late: ${late}`}/>}
      {aPct>0&&<div style={{flex:aPct,background:"#1e293b",minWidth:2,transition:"flex .5s"}} title={`Absent: ${absent}`}/>}
    </div>
  );
};

// Rate circle
const RateCircle = ({rate,size=52}) => {
  const color = rate===null?"#1e293b":rate>=80?"#22c55e":rate>=60?"#f59e0b":"#ef4444";
  const r=18,circ=2*Math.PI*r;
  const dash=rate?circ*(rate/100):0;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0f172a" strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .6s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.22,fontWeight:800,color,fontFamily:"'Syne',sans-serif"}}>
        {rate===null?"—":`${rate}`}
      </div>
    </div>
  );
};

// Section heading
const H = ({children,sub=""}) => (
  <div style={{marginBottom:22}}>
    <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"#f1f5f9",letterSpacing:-.3}}>{children}</h2>
    {sub&&<p style={{color:"#475569",fontSize:13,marginTop:4}}>{sub}</p>}
  </div>
);

const TabBar = ({tabs,active,onChange}) => (
  <div style={{display:"flex",gap:4,marginBottom:20,background:"#060d1a",borderRadius:12,padding:4,border:"1px solid #0f2040",flexWrap:"wrap"}}>
    {tabs.map(([id,label,icon])=>(
      <button key={id} onClick={()=>onChange(id)}
        style={{padding:"8px 16px",borderRadius:9,border:"none",background:active===id?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",color:active===id?"#fff":"#64748b",fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
        {icon&&<span>{icon}</span>}{label}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════
const MENUS = {
  teacher:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"attendance",icon:"✓",label:"Take Attendance"},
    {id:"att-history",icon:"📅",label:"History"},
    {id:"my-students",icon:"👥",label:"My Class"},
    {id:"add-student",icon:"＋",label:"Add Student"},
    {id:"announcements",icon:"📢",label:"Announcements"},
    {id:"chat",icon:"💬",label:"Messages"},
  ],
  headmaster:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"approvals",icon:"✅",label:"Approvals",badge:true},
    {id:"attendance",icon:"✓",label:"Attendance"},
    {id:"att-history",icon:"📅",label:"Att. History"},
    {id:"students",icon:"👥",label:"All Students"},
    {id:"teachers",icon:"👨‍🏫",label:"Teachers"},
    {id:"classes",icon:"🏫",label:"Classes"},
    {id:"chat",icon:"💬",label:"Messages"},
    {id:"announcements",icon:"📢",label:"Announcements"},
    {id:"reports",icon:"📊",label:"Reports"},
  ],
  director:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"reports",icon:"📊",label:"Reports"},
    {id:"chat",icon:"💬",label:"Messages"},
  ],
};

const Sidebar = ({user,screen,setScreen,pendingCount,onLogout,collapsed,setCollapsed}) => {
  const items = MENUS[user.role]||[];
  const W = collapsed?64:220;
  return (
    <div className="no-print" style={{width:W,background:"#040810",borderRight:"1px solid #0a1628",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:200,transition:"width .25s cubic-bezier(.4,0,.2,1)",overflow:"hidden"}}>
      <div style={{padding:collapsed?"16px 0":"20px 16px 16px",borderBottom:"1px solid #0a1628",display:"flex",alignItems:"center",gap:10,justifyContent:collapsed?"center":"flex-start"}}>
        {!collapsed&&(
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f1f5f9",letterSpacing:-.3}}>Sir Hosny</div>
            <div style={{fontSize:8,color:"#38bdf8",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginTop:1}}>Class Register</div>
          </div>
        )}
        <button onClick={()=>setCollapsed(!collapsed)} style={{background:"#0a1628",border:"none",color:"#475569",width:28,height:28,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
          {collapsed?"→":"←"}
        </button>
      </div>

      <div style={{margin:"10px 8px",background:"#060d1a",borderRadius:12,padding:collapsed?"10px 4px":"10px",display:"flex",alignItems:"center",gap:8,justifyContent:collapsed?"center":"flex-start",border:"1px solid #0f2040"}}>
        <Av label={user.avatar} color={RC[user.role]} size={32}/>
        {!collapsed&&(
          <div style={{overflow:"hidden",flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name.split(" ").slice(1).join(" ")}</div>
            <RolePill role={user.role}/>
          </div>
        )}
      </div>

      <nav style={{flex:1,overflowY:"auto",padding:"6px 6px",overflowX:"hidden"}}>
        {items.map(item=>{
          const active=screen===item.id;
          const showBadge=item.badge&&pendingCount>0;
          return (
            <button key={item.id} onClick={()=>setScreen(item.id)}
              title={collapsed?item.label:""}
              style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:collapsed?"10px":"9px 10px",borderRadius:10,border:"none",background:active?"#0d2d4d":"transparent",color:active?"#38bdf8":"#475569",fontWeight:active?600:400,fontSize:13,cursor:"pointer",marginBottom:1,textAlign:"left",transition:"all .15s",borderLeft:`2px solid ${active?"#38bdf8":"transparent"}`,justifyContent:collapsed?"center":"flex-start",position:"relative",overflow:"visible"}}>
              <span style={{fontSize:14,width:16,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              {!collapsed&&<span style={{flex:1,whiteSpace:"nowrap"}}>{item.label}</span>}
              {showBadge&&<span style={{background:"#f59e0b",color:"#000",borderRadius:99,fontSize:9,fontWeight:800,padding:"1px 5px",minWidth:16,textAlign:"center",position:collapsed?"absolute":"static",top:collapsed?4:undefined,right:collapsed?4:undefined}}>{pendingCount}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{padding:"8px 6px 14px"}}>
        <button onClick={onLogout} title={collapsed?"Sign out":""} style={{width:"100%",padding:"8px",borderRadius:10,border:"1px solid #0a1628",background:"transparent",color:"#334155",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,justifyContent:collapsed?"center":"flex-start"}}>
          <span>🚪</span>{!collapsed&&"Sign Out"}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
const Login = ({onLogin,allUsers}) => {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const users=allUsers||USERS;
  const go=()=>{
    setLoading(true); setErr("");
    setTimeout(()=>{
      const user=users.find(x=>x.username===u&&x.password===p);
      if(user)onLogin(user); else{setErr("Invalid username or password.");setLoading(false);}
    },600);
  };
  return (
    <div style={{minHeight:"100vh",background:"#06090f",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60vw",height:"60vw",background:"radial-gradient(circle,rgba(14,165,233,.06) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"50vw",height:"50vw",background:"radial-gradient(circle,rgba(168,85,247,.05) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(#0f2040 1px,transparent 1px)",backgroundSize:"28px 28px",opacity:.4,pointerEvents:"none"}}/>
      <div className="fu" style={{width:"100%",maxWidth:420,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(14,165,233,.3)"}}>🏫</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:"#f1f5f9",letterSpacing:-.5}}>Sir Hosny DCRS</h1>
          <p style={{color:"#475569",fontSize:12,marginTop:6,letterSpacing:.5}}>Digital Class Register System</p>
        </div>
        <Card style={{padding:"28px 28px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Username" value={u} onChange={e=>{setU(e.target.value);setErr("");}} placeholder="Enter username" onKeyDown={e=>e.key==="Enter"&&go()}/>
            <Inp label="Password" type="password" value={p} onChange={e=>{setP(e.target.value);setErr("");}} placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&go()}/>
            {err&&<div style={{color:"#f87171",fontSize:12,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",padding:"8px 12px",borderRadius:8}}>{err}</div>}
            <Btn onClick={go} disabled={loading} size="lg" style={{width:"100%",justifyContent:"center",marginTop:4}}>
              {loading?<span className="spin" style={{display:"inline-block"}}>⟳</span>:"Sign In →"}
            </Btn>
          </div>
          <div style={{marginTop:22,borderTop:"1px solid #0f2040",paddingTop:16}}>
            <p style={{color:"#1e293b",fontSize:10,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Quick Access — Demo Accounts</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {USERS.filter((u,i)=>i<3).map(u=>(
                <button key={u.id} onClick={()=>{setU(u.username);setP(u.password);setErr("");}}
                  style={{padding:"8px 6px",borderRadius:10,border:"1px solid #0f2040",background:"#060d1a",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:11,color:RC[u.role],fontWeight:700,textTransform:"capitalize"}}>{u.role}</div>
                  <div style={{fontSize:9,color:"#334155",marginTop:2}}>{u.username}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:6,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {USERS.filter((u,i)=>i>=3).map(u=>(
                <button key={u.id} onClick={()=>{setU(u.username);setP(u.password);setErr("");}}
                  style={{padding:"8px 6px",borderRadius:10,border:"1px solid #0f2040",background:"#060d1a",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:11,color:RC[u.role],fontWeight:700}}>{u.name.split(" ")[1]}</div>
                  <div style={{fontSize:9,color:"#334155",marginTop:2}}>{u.class}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════════════
const StatGrid = ({stats}) => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:22}}>
    {stats.map(({icon,label,value,color="#38bdf8",trend})=>(
      <Card key={label} className="fu card-hover">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontSize:20}}>{icon}</div>
          {trend!==undefined&&<span style={{fontSize:10,color:trend>=0?"#22c55e":"#ef4444",fontWeight:700,background:trend>=0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",padding:"2px 6px",borderRadius:99}}>{trend>=0?"↑":"↓"}{Math.abs(trend)}%</span>}
        </div>
        <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Syne',sans-serif",lineHeight:1,letterSpacing:-.5}}>{value}</div>
        <div style={{color:"#475569",fontSize:11,marginTop:6,fontWeight:500,textTransform:"uppercase",letterSpacing:.6}}>{label}</div>
      </Card>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// DASHBOARDS
// ═══════════════════════════════════════════════════════════════
const TeacherDash = ({user,students,attendance,announcements,requests,setScreen}) => {
  const mine=useMemo(()=>students.filter(s=>s.class===user.class&&s.approved),[students,user.class]);
  const tAtt=useMemo(()=>attendance.filter(a=>a.date===today()&&a.class===user.class),[attendance,user.class]);
  const doneToday=tAtt.length>0;
  const myReqs=requests.filter(r=>r.teacher_id===user.id&&r.status==="pending").length;
  return (
    <div className="fu">
      <H children={`Welcome back, ${user.name.split(" ")[1]} 👋`} sub={`${user.class} · ${fmtDate(today())}`}/>
      {!doneToday&&(
        <div className="blink" onClick={()=>setScreen("attendance")} style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.3)",borderRadius:14,padding:"14px 20px",marginBottom:18,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>⚠️</span>
          <div>
            <div style={{fontWeight:700,color:"#fbbf24",fontSize:14}}>Attendance Not Taken Yet</div>
            <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Tap to take attendance for {user.class} today</div>
          </div>
          <Btn variant="warning" size="sm" style={{marginLeft:"auto"}}>Take Now</Btn>
        </div>
      )}
      <StatGrid stats={[
        {icon:"👥",label:"My Students",value:mine.length},
        {icon:"🟢",label:"Present",value:tAtt.filter(a=>a.status==="present").length,color:"#4ade80"},
        {icon:"🟡",label:"Late",value:tAtt.filter(a=>a.status==="late").length,color:"#fbbf24"},
        {icon:"🔴",label:"Absent",value:tAtt.filter(a=>a.status==="absent").length,color:"#f87171"},
        ...(myReqs>0?[{icon:"⏳",label:"Pending Req.",value:myReqs,color:"#c084fc"}]:[]),
      ]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card style={{gridColumn:1}}>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Today's Roll — {user.class}</div>
          {mine.length===0?<p style={{color:"#334155",fontSize:13}}>No students yet.</p>:
            mine.map(s=>{
              const att=tAtt.find(a=>a.student_id===s.id);
              const r=attRate(attendance,s.id);
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0a1628"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{s.full_name}</div>
                      <div style={{fontSize:10,color:"#334155"}}>{r!==null?`${r}% attendance`:""}</div>
                    </div>
                  </div>
                  {att?<Badge status={att.status}/>:<span style={{fontSize:10,color:"#1e3a5f",fontStyle:"italic"}}>—</span>}
                </div>
              );
            })
          }
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {announcements.length>0&&(
            <Card style={{borderLeft:"3px solid #38bdf8"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>📢 Latest Notice</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:"#e2e8f0"}}>{announcements[announcements.length-1].title}</div>
              <p style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{announcements[announcements.length-1].body}</p>
            </Card>
          )}
          <Card onClick={()=>setScreen("att-history")} style={{cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>This Week</div>
            {[...Array(5)].map((_,i)=>{
              const d=new Date(); d.setDate(d.getDate()-i);
              const ds=d.toISOString().split("T")[0];
              const da=attendance.filter(a=>a.date===ds&&a.class===user.class);
              return(
                <div key={ds} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{fontSize:10,color:"#475569",width:70,flexShrink:0}}>{fmtDate(ds)}</div>
                  {da.length>0?(
                    <MiniBar present={da.filter(a=>a.status==="present").length} late={da.filter(a=>a.status==="late").length} absent={da.filter(a=>a.status==="absent").length} total={da.length} height={16}/>
                  ):<div style={{flex:1,height:16,borderRadius:4,background:"#0a1628",fontSize:9,color:"#1e293b",display:"flex",alignItems:"center",paddingLeft:6}}>No data</div>}
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

const HeadDash = ({students,attendance,requests,setScreen}) => {
  const approved=useMemo(()=>students.filter(s=>s.approved),[students]);
  const tAtt=useMemo(()=>attendance.filter(a=>a.date===today()),[attendance]);
  const pending=requests.filter(r=>r.status==="pending").length;
  const classData=CLASSES.map(c=>{
    const cs=approved.filter(s=>s.class===c);
    const ca=tAtt.filter(a=>a.class===c);
    const p=ca.filter(a=>a.status==="present").length;
    const t=USERS.find(u=>u.class===c);
    return{cls:c,total:cs.length,present:p,late:ca.filter(a=>a.status==="late").length,absent:ca.filter(a=>a.status==="absent").length,done:ca.length>0,teacher:t?.name||"—",rate:cs.length?Math.round(((p+ca.filter(a=>a.status==="late").length)/Math.max(ca.length,1))*100):0};
  });
  return(
    <div className="fu">
      <H children="Headmaster Dashboard" sub={fmtDate(today())}/>
      {pending>0&&(
        <div onClick={()=>setScreen("approvals")} style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.3)",borderRadius:14,padding:"14px 20px",marginBottom:18,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span className="blink" style={{fontSize:22}}>⏳</span>
          <div>
            <div style={{fontWeight:700,color:"#fbbf24"}}>{pending} Pending Student Approval{pending>1?"s":""}</div>
            <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Review and approve teacher requests</div>
          </div>
          <Btn variant="warning" size="sm" style={{marginLeft:"auto"}}>Review</Btn>
        </div>
      )}
      <StatGrid stats={[
        {icon:"👥",label:"Total Students",value:approved.length},
        {icon:"👨‍🏫",label:"Teachers",value:USERS.filter(u=>u.role==="teacher").length},
        {icon:"🏫",label:"Classes",value:CLASSES.length},
        {icon:"🟢",label:"Present Today",value:tAtt.filter(a=>a.status==="present").length,color:"#4ade80"},
        {icon:"🟡",label:"Late Today",value:tAtt.filter(a=>a.status==="late").length,color:"#fbbf24"},
        {icon:"🔴",label:"Absent Today",value:tAtt.filter(a=>a.status==="absent").length,color:"#f87171"},
      ]}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
        {classData.map(c=>(
          <Card key={c.cls} onClick={()=>setScreen("classes")} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9"}}>{c.cls}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:2}}>{c.teacher}</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,background:c.done?"rgba(34,197,94,.1)":"rgba(245,158,11,.1)",color:c.done?"#4ade80":"#fbbf24"}}>
                {c.done?"✅ Done":"⏳ Pending"}
              </span>
            </div>
            <MiniBar present={c.present} late={c.late} absent={c.absent} total={c.present+c.late+c.absent||c.total} height={20}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11}}>
              <span style={{color:"#475569"}}>{c.total} students</span>
              <span style={{color:"#4ade80",fontWeight:700}}>{c.rate}% present</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DirectorDash = ({students,attendance}) => {
  const approved=students.filter(s=>s.approved);
  const tAtt=attendance.filter(a=>a.date===today());
  const total=approved.length;
  const present=tAtt.filter(a=>a.status==="present").length;
  const late=tAtt.filter(a=>a.status==="late").length;
  const absent=tAtt.filter(a=>a.status==="absent").length;
  const rate=total?Math.round(((present+late)/total)*100):0;
  const allDays=[...new Set(attendance.map(a=>a.date))].sort((a,b)=>b.localeCompare(a)).slice(0,7);
  return(
    <div className="fu">
      <H children="Director Overview" sub={`${fmtDate(today())} · Read-only access`}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
        <Card style={{gridColumn:"1/-1",background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(14,165,233,.08))",border:"1px solid rgba(168,85,247,.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <RateCircle rate={rate} size={72}/>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9"}}>{rate}% School Attendance Today</div>
              <div style={{color:"#64748b",fontSize:13,marginTop:4}}>{present} present · {late} late · {absent} absent out of {total} students</div>
            </div>
          </div>
        </Card>
      </div>
      <StatGrid stats={[
        {icon:"👥",label:"Students",value:total},
        {icon:"🏫",label:"Classes",value:CLASSES.length},
        {icon:"🟢",label:"Present",value:present,color:"#4ade80"},
        {icon:"🟡",label:"Late",value:late,color:"#fbbf24"},
        {icon:"🔴",label:"Absent",value:absent,color:"#f87171"},
      ]}/>
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Last 7 Days — School-wide</div>
        {allDays.map(d=>{
          const da=attendance.filter(a=>a.date===d);
          const p=da.filter(a=>a.status==="present").length;
          const l=da.filter(a=>a.status==="late").length;
          const ab=da.filter(a=>a.status==="absent").length;
          return(
            <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:11,color:"#475569",width:80,flexShrink:0}}>{fmtDate(d)}</div>
              <div style={{flex:1}}><MiniBar present={p} late={l} absent={ab} total={p+l+ab} height={20}/></div>
              <div style={{fontSize:11,color:"#64748b",width:60,textAlign:"right",flexShrink:0}}>{p+l+ab>0?`${Math.round(((p+l)/(p+l+ab))*100)}%`:"—"}</div>
            </div>
          );
        })}
        {allDays.length===0&&<p style={{color:"#334155",fontSize:13}}>No data yet.</p>}
      </Card>
      <Card style={{marginTop:14,borderLeft:"3px solid #c084fc"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🔒</span>
          <div style={{fontSize:13,color:"#64748b"}}>Director access is read-only. Use Messages to communicate with the Headmaster.</div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════
const AttendanceScreen = ({user,students,attendance,setAttendance,setSmsLog,setActLog,isHead=false}) => {
  const [selClass,setSelClass]=useState(isHead?CLASSES[0]:user.class||CLASSES[0]);
  const [marks,setMarks]=useState({});
  const [filter,setFilter]=useState("");
  const {toast,show,hide}=useToast();
  const classStudents=useMemo(()=>students.filter(s=>s.class===selClass&&s.approved),[students,selClass]);
  const filtered=useMemo(()=>classStudents.filter(s=>s.full_name.toLowerCase().includes(filter.toLowerCase())),[classStudents,filter]);
  const alreadyDone=attendance.some(a=>a.class===selClass&&a.date===today());
  const todayRecords=attendance.filter(a=>a.class===selClass&&a.date===today());
  useEffect(()=>setMarks({}),[selClass]);
  const pct=Math.round((Object.values(marks).filter(v=>v==="present").length/Math.max(classStudents.length,1))*100);
  const markAll=st=>{const m={};classStudents.forEach(s=>m[s.id]=st);setMarks(m);};
  const submit=()=>{
    if(Object.keys(marks).length!==classStudents.length){show("Mark all students first.","warning");return;}
    const entries=classStudents.map(s=>({id:uid(),student_id:s.id,class:selClass,date:today(),status:marks[s.id],teacher:user.name,teacher_id:user.id}));
    setAttendance(prev=>[...prev,...entries]);
    const logs=classStudents.map(s=>({id:uid(),guardian:s.guardian_name,phone:s.guardian_phone,student:s.full_name,student_id:s.id,status:marks[s.id],message:smsMsg(s.full_name,marks[s.id]),time:new Date().toISOString(),class:selClass}));
    setSmsLog(prev=>[...prev,...logs]);
    setActLog(prev=>[...prev,{id:uid(),type:"attendance",desc:`${user.name} submitted attendance for ${selClass}`,time:new Date().toISOString(),user:user.name}]);
    show(`✅ Submitted! ${logs.length} SMS sent to guardians.`,"success");
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Take Attendance" sub={fmtDate(today())}/>
        {isHead&&<Sel value={selClass} onChange={e=>setSelClass(e.target.value)}>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
      </div>
      {alreadyDone?(
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <span style={{fontSize:24}}>✅</span>
            <div>
              <div style={{fontWeight:700,color:"#4ade80",fontSize:15}}>Attendance Submitted — {selClass}</div>
              <div style={{fontSize:12,color:"#475569",marginTop:2}}>Submitted {fmtDate(today())}</div>
            </div>
          </div>
          <MiniBar present={todayRecords.filter(a=>a.status==="present").length} late={todayRecords.filter(a=>a.status==="late").length} absent={todayRecords.filter(a=>a.status==="absent").length} total={todayRecords.length} height={24}/>
          <div style={{display:"flex",gap:16,marginTop:10,fontSize:12}}>
            <span style={{color:"#4ade80"}}>✅ {todayRecords.filter(a=>a.status==="present").length} Present</span>
            <span style={{color:"#fbbf24"}}>🟡 {todayRecords.filter(a=>a.status==="late").length} Late</span>
            <span style={{color:"#f87171"}}>❌ {todayRecords.filter(a=>a.status==="absent").length} Absent</span>
          </div>
          <div style={{marginTop:18}}>
            {todayRecords.map(a=>{
              const s=students.find(x=>x.id===a.student_id);if(!s)return null;
              return(
                <div key={a.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0a1628"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                    <span style={{fontSize:13}}>{s.full_name}</span>
                  </div>
                  <Badge status={a.status}/>
                </div>
              );
            })}
          </div>
        </Card>
      ):(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn variant="success" size="sm" onClick={()=>markAll("present")} icon="🟢">All Present</Btn>
              <Btn variant="warning" size="sm" onClick={()=>markAll("late")} icon="🟡">All Late</Btn>
              <Btn variant="danger" size="sm" onClick={()=>markAll("absent")} icon="🔴">All Absent</Btn>
            </div>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter students..." style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:8,padding:"7px 12px",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
          </div>
          {Object.keys(marks).length>0&&(
            <div style={{marginBottom:14}}>
              <MiniBar present={Object.values(marks).filter(v=>v==="present").length} late={Object.values(marks).filter(v=>v==="late").length} absent={Object.values(marks).filter(v=>v==="absent").length} total={classStudents.length} height={20}/>
              <div style={{fontSize:11,color:"#475569",marginTop:6}}>{Object.keys(marks).length}/{classStudents.length} marked · {pct}% present</div>
            </div>
          )}
          {filtered.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #0a1628",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av label={s.full_name.slice(0,2).toUpperCase()} size={36} img={s.photo} color="#1e3a5f"/>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#e2e8f0"}}>{s.full_name}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{s.id} · {s.guardian_phone}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:5}}>
                {["present","late","absent"].map(st=>(
                  <button key={st} onClick={()=>setMarks(m=>({...m,[s.id]:st}))}
                    style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${marks[s.id]===st?SC[st]:"#1e293b"}`,background:marks[s.id]===st?SBG[st]:"transparent",color:marks[s.id]===st?SC[st]:"#334155",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all .15s"}}>
                    {st==="present"?"🟢":st==="late"?"🟡":"🔴"} {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {classStudents.length===0&&<p style={{color:"#334155",padding:"20px 0",textAlign:"center"}}>No students in this class yet.</p>}
          {classStudents.length>0&&(
            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:10}}>
              <Btn variant="ghost" size="sm" onClick={()=>setMarks({})}>Clear All</Btn>
              <Btn onClick={submit} size="lg" disabled={Object.keys(marks).length!==classStudents.length}>Submit & Send SMS 📲</Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE HISTORY
// ═══════════════════════════════════════════════════════════════
const AttHistoryScreen = ({user,students,attendance,isHead=false}) => {
  const [selClass,setSelClass]=useState(isHead?"Grade 5A":user.class);
  const [selStudent,setSelStudent]=useState("all");
  const [dateFrom,setDateFrom]=useState("");
  const classStudents=students.filter(s=>s.class===selClass&&s.approved);
  const dates=[...new Set(attendance.filter(a=>a.class===selClass).map(a=>a.date))].sort((a,b)=>b.localeCompare(a));
  const filteredDates=dates.filter(d=>!dateFrom||d>=dateFrom);
  const printRef=useRef();
  const doPrint=()=>window.print();
  return(
    <div className="fu" ref={printRef}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Attendance History" sub="Full log by class and date"/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="ghost" size="sm" onClick={doPrint} icon="🖨️">Print</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {isHead&&<Sel value={selClass} onChange={e=>{setSelClass(e.target.value);setSelStudent("all");}}>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
        <Sel value={selStudent} onChange={e=>setSelStudent(e.target.value)}>
          <option value="all">All Students</option>
          {classStudents.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}
        </Sel>
        <Inp type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"9px 12px",color:"#e2e8f0",fontSize:13}}/>
      </div>
      {filteredDates.length===0?<Card><p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No records found.</p></Card>:
        filteredDates.map(date=>{
          const dayRecs=attendance.filter(a=>a.class===selClass&&a.date===date&&(selStudent==="all"||a.student_id===selStudent));
          if(!dayRecs.length)return null;
          const p=dayRecs.filter(a=>a.status==="present").length;
          const l=dayRecs.filter(a=>a.status==="late").length;
          const ab=dayRecs.filter(a=>a.status==="absent").length;
          return(
            <Card key={date} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{fmtDate(date)}</div>
                <div style={{display:"flex",gap:12,fontSize:12}}>
                  <span style={{color:"#4ade80"}}>✅ {p}</span>
                  <span style={{color:"#fbbf24"}}>🟡 {l}</span>
                  <span style={{color:"#f87171"}}>❌ {ab}</span>
                </div>
              </div>
              <MiniBar present={p} late={l} absent={ab} total={dayRecs.length} height={16}/>
              <div style={{marginTop:12}}>
                {dayRecs.map(a=>{
                  const s=students.find(x=>x.id===a.student_id);if(!s)return null;
                  return(
                    <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0a1628",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Av label={s.full_name.slice(0,2).toUpperCase()} size={26} img={s.photo} color="#1e3a5f"/>
                        <span style={{fontSize:13}}>{s.full_name}</span>
                      </div>
                      <Badge status={a.status}/>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════════
const StudentModal = ({student,attendance,open,onClose}) => {
  if(!student)return null;
  const sAtt=attendance.filter(a=>a.student_id===student.id).sort((a,b)=>b.date.localeCompare(a.date));
  const p=sAtt.filter(a=>a.status==="present").length;
  const l=sAtt.filter(a=>a.status==="late").length;
  const ab=sAtt.filter(a=>a.status==="absent").length;
  const rate=sAtt.length?Math.round(((p+l)/sAtt.length)*100):null;
  return(
    <Modal open={open} onClose={onClose} title="Student Profile" width={560}>
      <div style={{display:"flex",gap:16,alignItems:"center",background:"#060d1a",borderRadius:14,padding:16,marginBottom:20}}>
        <Av label={student.full_name.slice(0,2).toUpperCase()} size={64} img={student.photo} color="#1e3a5f"/>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#f1f5f9"}}>{student.full_name}</div>
          <div style={{fontSize:12,color:"#38bdf8",marginTop:3}}>{student.class} · ID: {student.id}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:2}}>Age: {calcAge(student.dob)} · Born: {fmtDate(student.dob)}</div>
        </div>
        <RateCircle rate={rate} size={60}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:"#060d1a",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Guardian</div>
          <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{student.guardian_name}</div>
          <div style={{fontSize:12,color:"#38bdf8",marginTop:3}}>{student.guardian_phone}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {[["Present",p,"#4ade80"],["Late",l,"#fbbf24"],["Absent",ab,"#f87171"]].map(([lb,v,c])=>(
            <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
              <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontWeight:700,fontSize:11,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Recent Records</div>
      <div style={{maxHeight:180,overflowY:"auto"}}>
        {sAtt.length===0?<p style={{color:"#334155",fontSize:12,textAlign:"center",padding:"12px 0"}}>No records yet.</p>:
          sAtt.slice(0,15).map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0a1628",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#94a3b8"}}>{fmtDate(a.date)}</span>
              <Badge status={a.status}/>
            </div>
          ))
        }
      </div>
    </Modal>
  );
};

const StudentsScreen = ({user,students,attendance,isHead=false}) => {
  const [search,setSearch]=useState(""); const [selClass,setSelClass]=useState(isHead?"all":user.class);
  const [sortBy,setSortBy]=useState("name"); const [selStu,setSelStu]=useState(null); const [open,setOpen]=useState(false);
  const [genderFilter,setGenderFilter]=useState("all");
  const list=useMemo(()=>
    students.filter(s=>s.approved)
      .filter(s=>isHead?(selClass==="all"||s.class===selClass):s.class===user.class)
      .filter(s=>s.full_name.toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase()))
      .filter(s=>genderFilter==="all"||(s.gender||"").toLowerCase()===genderFilter)
      .sort((a,b)=>{
        if(sortBy==="name")return a.full_name.localeCompare(b.full_name);
        if(sortBy==="class")return a.class.localeCompare(b.class);
        if(sortBy==="gender")return (a.gender||"").localeCompare(b.gender||"");
        const ra=attRate(attendance,a.id)??-1;
        const rb=attRate(attendance,b.id)??-1;
        return rb-ra;
      })
  ,[students,selClass,search,sortBy,attendance,genderFilter]);
  const males=students.filter(s=>s.approved&&(isHead?true:s.class===user.class)&&(s.gender||"").toLowerCase()==="male").length;
  const females=students.filter(s=>s.approved&&(isHead?true:s.class===user.class)&&(s.gender||"").toLowerCase()==="female").length;
  return(
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <H children={isHead?"All Students":`${user.class} — Students`} sub={`${list.length} students · 👦 ${males} boys · 👧 ${females} girls`}/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or ID…" style={{background:"#0d1829",border:"1px solid #1e293b",borderRadius:10,padding:"9px 14px",color:"#e2e8f0",fontSize:13,outline:"none",flex:1,minWidth:160}}/>
        {isHead&&<Sel value={selClass} onChange={e=>setSelClass(e.target.value)}><option value="all">All Classes</option>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
        <Sel value={genderFilter} onChange={e=>setGenderFilter(e.target.value)}>
          <option value="all">All Genders</option>
          <option value="male">👦 Boys</option>
          <option value="female">👧 Girls</option>
        </Sel>
        <Sel value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="class">Sort: Class</option>
          <option value="gender">Sort: Gender</option>
          <option value="rate">Sort: Attendance</option>
        </Sel>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {list.map(s=>{
          const r=attRate(attendance,s.id);
          const sAtt=attendance.filter(a=>a.student_id===s.id);
          return(
            <Card key={s.id} className="card-hover" onClick={()=>{setSelStu(s);setOpen(true);}} style={{cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Av label={s.full_name.slice(0,2).toUpperCase()} size={44} img={s.photo} color="#1d4ed8"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.full_name}</div>
                  <div style={{fontSize:11,color:"#38bdf8",marginTop:1}}>{s.class}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{s.id}</div>
                </div>
                <RateCircle rate={r} size={44}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 10px",fontSize:11}}>
                <span style={{color:"#334155"}}>Age</span><span style={{color:"#94a3b8"}}>{calcAge(s.dob)} yrs</span>
                <span style={{color:"#334155"}}>Gender</span><span style={{color:"#94a3b8"}}>{s.gender==="male"?"👦 Boy":s.gender==="female"?"👧 Girl":"—"}</span>
                <span style={{color:"#334155"}}>Guardian</span><span style={{color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.guardian_name}</span>
                <span style={{color:"#334155"}}>Phone</span><span style={{color:"#94a3b8"}}>{s.guardian_phone}</span>
              </div>
              {sAtt.length>0&&<div style={{marginTop:10}}><MiniBar present={sAtt.filter(a=>a.status==="present").length} late={sAtt.filter(a=>a.status==="late").length} absent={sAtt.filter(a=>a.status==="absent").length} total={sAtt.length} height={14}/></div>}
            </Card>
          );
        })}
        {list.length===0&&<p style={{color:"#334155",gridColumn:"1/-1",textAlign:"center",padding:"32px 0"}}>No students found.</p>}
      </div>
      <StudentModal student={selStu} attendance={attendance} open={open} onClose={()=>setOpen(false)}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADD STUDENT
// ═══════════════════════════════════════════════════════════════
const AddStudentScreen = ({user,requests,setRequests,setActLog}) => {
  const [form,setForm]=useState({full_name:"",dob:"",guardian_name:"",guardian_phone:"",photo:null});
  const [preview,setPreview]=useState(null);
  const [errors,setErrors]=useState({});
  const {toast,show,hide}=useToast();
  const fileRef=useRef();
  const setF=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const handlePhoto=e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>5*1024*1024){show("Photo must be under 5MB","error");return;}
    const r=new FileReader();r.onload=ev=>{setF("photo",ev.target.result);setPreview(ev.target.result);};r.readAsDataURL(file);
  };
  const validate=()=>{
    const e={};
    if(!form.full_name.trim())e.full_name="Required";
    if(!form.dob)e.dob="Required";
    if(!form.guardian_name.trim())e.guardian_name="Required";
    if(!form.guardian_phone.trim())e.guardian_phone="Required";
    else if(!/^\+?\d{8,15}$/.test(form.guardian_phone.replace(/\s/g,"")))e.guardian_phone="Invalid phone number";
    setErrors(e);return Object.keys(e).length===0;
  };
  const submit=()=>{
    if(!validate())return;
    const req={id:uid(),...form,class:user.class,teacher:user.name,teacher_id:user.id,status:"pending",created:new Date().toISOString()};
    setRequests(prev=>[...prev,req]);
    setActLog(prev=>[...prev,{id:uid(),type:"request",desc:`${user.name} requested to add ${form.full_name} to ${user.class}`,time:new Date().toISOString(),user:user.name}]);
    setForm({full_name:"",dob:"",guardian_name:"",guardian_phone:"",photo:null});setPreview(null);
    show("✅ Request submitted! Awaiting Headmaster approval.","success");
  };
  const myReqs=requests.filter(r=>r.teacher_id===user.id).sort((a,b)=>b.created.localeCompare(a.created));
  const ErrMsg=({field})=>errors[field]?<span style={{fontSize:10,color:"#f87171",marginTop:2}}>{errors[field]}</span>:null;
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Add Student Request" sub="Requires Headmaster approval before the student is added"/>
      <Card style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:18}}>New Student — {user.class}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Photo Upload */}
          <div style={{display:"flex",alignItems:"center",gap:16,background:"#060d1a",borderRadius:14,padding:14,border:"1px dashed #1e293b",cursor:"pointer"}} onClick={()=>fileRef.current.click()}>
            <div style={{width:64,height:64,borderRadius:12,background:"#0d1829",border:"2px dashed #1e293b",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
              {preview?<img src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>📷</span>}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"#e2e8f0"}}>Student Photo</div>
              <div style={{fontSize:12,color:"#475569",marginTop:2}}>Tap to upload from camera or gallery (optional)</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto}/>
          </div>

          {/* Full Name */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Full Name *" value={form.full_name} onChange={e=>setF("full_name",e.target.value)} placeholder="Student's full name"/>
            <ErrMsg field="full_name"/>
          </div>

          {/* DOB + Age */}
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
              <Inp label="Date of Birth *" type="date" value={form.dob} onChange={e=>setF("dob",e.target.value)}/>
              <ErrMsg field="dob"/>
            </div>
            <div style={{background:"#060d1a",borderRadius:10,padding:"10px 16px",border:"1px solid #1e293b",textAlign:"center",minWidth:80}}>
              <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>Age</div>
              <div style={{fontSize:20,fontWeight:800,color:"#38bdf8",fontFamily:"'Syne',sans-serif"}}>{form.dob?`${calcAge(form.dob)}`:"—"}</div>
            </div>
          </div>

          {/* Gender */}
          <Sel label="Gender *" value={form.gender||""} onChange={e=>setF("gender",e.target.value)}>
            <option value="">-- Select Gender --</option>
            <option value="male">👦 Male</option>
            <option value="female">👧 Female</option>
          </Sel>

          {/* Guardian Name */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Guardian Name *" value={form.guardian_name} onChange={e=>setF("guardian_name",e.target.value)} placeholder="Parent or guardian full name"/>
            <ErrMsg field="guardian_name"/>
          </div>

          {/* Guardian Phone */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Guardian Phone *" value={form.guardian_phone} onChange={e=>setF("guardian_phone",e.target.value)} placeholder="+20xxxxxxxxxx"/>
            <ErrMsg field="guardian_phone"/>
          </div>

          <Btn onClick={submit} size="lg" style={{width:"100%",justifyContent:"center"}}>Submit for Headmaster Approval →</Btn>
        </div>
      </Card>
      <H children="My Requests" sub={`${myReqs.length} total`}/>
      {myReqs.length===0?<Card><p style={{color:"#334155",textAlign:"center",padding:"16px 0"}}>No requests yet.</p></Card>:
        myReqs.map(r=>(
          <Card key={r.id} style={{marginBottom:12,borderLeft:`3px solid ${r.status==="pending"?"#fbbf24":r.status==="approved"?"#4ade80":"#f87171"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {r.photo&&<Av label={r.full_name.slice(0,2).toUpperCase()} size={38} img={r.photo} color="#1e3a5f"/>}
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{r.full_name}</div>
                  <div style={{fontSize:11,color:"#475569",marginTop:2}}>{r.class} · DOB: {fmtDate(r.dob)} · Age: {calcAge(r.dob)} · {r.guardian_name} · {r.guardian_phone}</div>
                  <div style={{fontSize:10,color:"#334155",marginTop:2}}>{fmtDate(r.created)}</div>
                </div>
              </div>
              <span style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:r.status==="pending"?SBG.late:r.status==="approved"?SBG.present:SBG.absent,color:r.status==="pending"?SC.late:r.status==="approved"?SC.present:SC.absent}}>
                {r.status==="pending"?"⏳ Pending":r.status==="approved"?"✅ Approved":"❌ Rejected"}
              </span>
            </div>
          </Card>
        ))
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════
const ApprovalsScreen = ({requests,setRequests,setStudents,setActLog}) => {
  const {toast,show,hide}=useToast();
  const pending=requests.filter(r=>r.status==="pending");
  const done=requests.filter(r=>r.status!=="pending").sort((a,b)=>b.created.localeCompare(a.created));
  const handle=(req,action)=>{
    setRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:action}:r));
    if(action==="approved"){
      setStudents(prev=>[...prev,{id:"S"+uid(),full_name:req.full_name,class:req.class,dob:req.dob,guardian_name:req.guardian_name,guardian_phone:req.guardian_phone,photo:req.photo||null,approved:true}]);
      setActLog(prev=>[...prev,{id:uid(),type:"approval",desc:`Headmaster approved ${req.full_name} → ${req.class}`,time:new Date().toISOString(),user:"Headmaster"}]);
      show(`✅ ${req.full_name} added to ${req.class}.`,"success");
    }else{
      setActLog(prev=>[...prev,{id:uid(),type:"rejection",desc:`Headmaster rejected request for ${req.full_name}`,time:new Date().toISOString(),user:"Headmaster"}]);
      show("Request rejected.","error");
    }
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Student Approvals" sub={`${pending.length} pending · ${done.length} processed`}/>
      {pending.length===0?<Card style={{marginBottom:16,textAlign:"center"}}><p style={{color:"#475569",padding:"20px 0"}}>✅ No pending requests right now.</p></Card>:
        pending.map(r=>(
          <Card key={r.id} style={{marginBottom:16,borderLeft:"3px solid #fbbf24"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:60,height:60,borderRadius:12,overflow:"hidden",background:"#1e293b",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {r.photo?<img src={r.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>👤</span>}
                </div>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9",marginBottom:8}}>{r.full_name}</div>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 12px",fontSize:12}}>
                    <span style={{color:"#334155"}}>Class</span><span style={{color:"#94a3b8"}}>{r.class}</span>
                    <span style={{color:"#334155"}}>DOB</span><span style={{color:"#94a3b8"}}>{fmtDate(r.dob)}</span>
                    <span style={{color:"#334155"}}>Age</span><span style={{color:"#38bdf8",fontWeight:700}}>{calcAge(r.dob)} yrs</span>
                    <span style={{color:"#334155"}}>Guardian</span><span style={{color:"#94a3b8"}}>{r.guardian_name}</span>
                    <span style={{color:"#334155"}}>Phone</span><span style={{color:"#94a3b8"}}>{r.guardian_phone}</span>
                    <span style={{color:"#334155"}}>Teacher</span><span style={{color:"#94a3b8"}}>{r.teacher}</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexDirection:"column"}}>
                <Btn variant="success" onClick={()=>handle(r,"approved")}>✅ Approve</Btn>
                <Btn variant="danger" onClick={()=>handle(r,"rejected")}>❌ Reject</Btn>
              </div>
            </div>
          </Card>
        ))
      }
      {done.length>0&&(
        <>
          <H children="Past Requests" sub=""/>
          {done.slice(0,10).map(r=>(
            <Card key={r.id} style={{marginBottom:8,opacity:.6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#94a3b8"}}>{r.full_name} — {r.class} — {r.teacher}</span>
                <span style={{fontSize:11,color:r.status==="approved"?SC.present:SC.absent,fontWeight:700}}>{r.status==="approved"?"✅ Approved":"❌ Rejected"}</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TEACHERS — Add, Assign Class, Remove
// ═══════════════════════════════════════════════════════════════
const TeachersScreen = ({students,attendance,extraTeachers,setExtraTeachers}) => {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",username:"",password:"",email:"",class:""});
  const [errors,setErrors]=useState({});
  const {toast,show,hide}=useToast();
  const setF=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const allTeachers=[...USERS.filter(u=>u.role==="teacher"),...(extraTeachers||[])];

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Required";
    if(!form.username.trim())e.username="Required";
    else if(allTeachers.find(t=>t.username===form.username))e.username="Username already taken";
    if(!form.password.trim())e.password="Required";
    else if(form.password.length<6)e.password="Min 6 characters";
    if(!form.email.trim())e.email="Required";
    setErrors(e);return Object.keys(e).length===0;
  };

  const addTeacher=()=>{
    if(!validate())return;
    const t={id:"T"+uid(),role:"teacher",name:form.name,username:form.username,password:form.password,email:form.email,class:form.class||"",avatar:form.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()};
    setExtraTeachers(prev=>[...prev,t]);
    setForm({name:"",username:"",password:"",email:"",class:""});
    setShowAdd(false);
    show(`✅ ${form.name} added as teacher!`,"success");
  };

  const assignClass=(id,cls)=>{
    setExtraTeachers(prev=>prev.map(t=>t.id===id?{...t,class:cls}:t));
    show("✅ Class assigned!","success");
  };

  const removeTeacher=(id,name)=>{
    setExtraTeachers(prev=>prev.filter(t=>t.id!==id));
    show(`${name} removed.`,"info");
  };

  const ErrMsg=({field})=>errors[field]?<span style={{fontSize:10,color:"#f87171"}}>{errors[field]}</span>:null;

  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Teachers" sub={`${allTeachers.length} registered`}/>
        <Btn onClick={()=>setShowAdd(true)} icon="&#65291;">Add Teacher</Btn>
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Teacher" width={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Full Name *" value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Teacher full name"/>
            <ErrMsg field="name"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Username *" value={form.username} onChange={e=>setF("username",e.target.value)} placeholder="Login username"/>
            <ErrMsg field="username"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Password *" type="password" value={form.password} onChange={e=>setF("password",e.target.value)} placeholder="Min 6 characters"/>
            <ErrMsg field="password"/>
          </div>
          <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Email *" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="teacher@school.edu"/>
            <ErrMsg field="email"/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <Sel label="Assign Class (optional)" value={form.class} onChange={e=>setF("class",e.target.value)}>
              <option value="">-- No class yet --</option>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addTeacher}>Add Teacher</Btn>
          </div>
        </div>
      </Modal>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {allTeachers.map(t=>{
          const isExtra=!!(extraTeachers||[]).find(e=>e.id===t.id);
          const ms=students.filter(s=>s.class===t.class&&s.approved);
          const done=attendance.some(a=>a.class===t.class&&a.date===today());
          const totalDays=[...new Set(attendance.filter(a=>a.class===t.class).map(a=>a.date))].length;
          return(
            <Card key={t.id} className="card-hover">
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <Av label={t.avatar} color="#34d399" size={50}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>{t.name}</div>
                  <RolePill role={t.role}/>
                  <div style={{fontSize:11,color:"#475569",marginTop:3}}>@{t.username}</div>
                </div>
                {isExtra&&<span style={{fontSize:9,color:"#38bdf8",background:"rgba(56,189,248,.1)",padding:"2px 8px",borderRadius:99,fontWeight:700}}>NEW</span>}
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Assigned Class</label>
                {isExtra?(
                  <select value={t.class||""} onChange={e=>assignClass(t.id,e.target.value)}
                    style={{width:"100%",background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"8px 12px",color:"#e2e8f0",fontSize:13,outline:"none"}}>
                    <option value="">-- Unassigned --</option>
                    {CLASSES.map(c=><option key={c}>{c}</option>)}
                  </select>
                ):(
                  <div style={{background:"#060d1a",borderRadius:10,padding:"8px 12px",fontSize:13,color:"#38bdf8",fontWeight:600}}>{t.class||"Unassigned"}</div>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:isExtra?12:0}}>
                {[["Students",ms.length,"#38bdf8"],["Days",totalDays,"#94a3b8"],["Today",done?"✓":"—",done?"#4ade80":"#475569"]].map(([lb,v,c])=>(
                  <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
                    <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{lb}</div>
                  </div>
                ))}
              </div>
              {isExtra&&<Btn variant="danger" size="sm" onClick={()=>removeTeacher(t.id,t.name)} style={{width:"100%"}}>Remove Teacher</Btn>}
            </Card>
          );
        })}
        {allTeachers.length===0&&<Card><p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No teachers yet.</p></Card>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════════════════════
const ClassesScreen = ({students,attendance}) => (
  <div className="fu">
    <H children="Class Management" sub="Overview of all classes"/>
    {CLASSES.map(cls=>{
      const cs=students.filter(s=>s.class===cls&&s.approved);
      const teacher=USERS.find(u=>u.class===cls);
      const ca=attendance.filter(a=>a.class===cls);
      const todayAtt=ca.filter(a=>a.date===today());
      const days=[...new Set(ca.map(a=>a.date))].length;
      const p=ca.filter(a=>a.status==="present").length;
      const l=ca.filter(a=>a.status==="late").length;
      const ab=ca.filter(a=>a.status==="absent").length;
      const avgRate=cs.length&&days?Math.round(((p+l)/(cs.length*days))*100):0;
      const todayP=todayAtt.filter(a=>a.status==="present").length;
      const todayL=todayAtt.filter(a=>a.status==="late").length;
      const todayAb=todayAtt.filter(a=>a.status==="absent").length;
      return(
        <Card key={cls} style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f1f5f9"}}>{cls}</div>
              <div style={{fontSize:12,color:"#475569",marginTop:3}}>Teacher: <span style={{color:"#34d399",fontWeight:600}}>{teacher?.name||"Unassigned"}</span></div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,padding:"4px 12px",borderRadius:99,fontWeight:700,background:todayAtt.length>0?SBG.present:SBG.late,color:todayAtt.length>0?SC.present:SC.late}}>{todayAtt.length>0?"✅ Done Today":"⏳ Pending"}</span>
              <RateCircle rate={avgRate} size={44}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[["👥","Students",cs.length,"#38bdf8"],["📅","Days Rec.",days,"#94a3b8"],["📊","Avg Rate",`${avgRate}%`,avgRate>=80?"#4ade80":avgRate>=60?"#fbbf24":"#f87171"],["🟢","Present Today",todayP,"#4ade80"]].map(([ic,lb,v,c])=>(
              <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{ic}</div>
                <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
                <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.4,marginTop:2}}>{lb}</div>
              </div>
            ))}
          </div>
          {todayAtt.length>0&&<><MiniBar present={todayP} late={todayL} absent={todayAb} total={todayAtt.length} height={20}/><div style={{display:"flex",gap:14,marginTop:8,fontSize:11}}><span style={{color:SC.present}}>✅ {todayP}</span><span style={{color:SC.late}}>🟡 {todayL}</span><span style={{color:SC.absent}}>❌ {todayAb}</span></div></>}
        </Card>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════════
const ChatScreen = ({user,messages,setMessages,extraTeachers}) => {
  const [input,setInput]=useState(""); const [selId,setSelId]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const endRef=useRef();
  const allUsers=[...USERS,...(extraTeachers||[]).filter(t=>!USERS.find(u=>u.id===t.id))];
  const partners=allUsers.filter(u=>{
    if(u.id===user.id)return false;
    if(user.role==="director")return u.role==="headmaster";
    if(user.role==="headmaster")return u.role==="director"||u.role==="teacher";
    if(user.role==="teacher")return u.role==="headmaster";
    return false;
  });
  useEffect(()=>{if(partners.length>0&&!selId)setSelId(partners[0].id);},[]);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[messages,selId]);
  const selUser=allUsers.find(u=>u.id===selId);
  const thread=selId?messages.filter(m=>(m.from===user.id&&m.to===selId)||(m.from===selId&&m.to===user.id)).sort((a,b)=>a.time.localeCompare(b.time)):[];
  const unread=id=>messages.filter(m=>m.from===id&&m.to===user.id&&!m.read).length;
  const send=()=>{
    if(!input.trim()||!selId)return;
    setMessages(prev=>[...prev,{id:uid(),from:user.id,to:selId,text:input.trim(),time:new Date().toISOString(),read:false}]);
    setInput("");
  };
  return(
    <div style={{display:"flex",height:"calc(100vh - 80px)",gap:0,position:"relative"}}>
      {/* Collapsible Contacts Sidebar */}
      <div style={{width:sidebarOpen?200:0,minWidth:0,background:"#040810",borderRadius:sidebarOpen?"14px 0 0 14px":0,border:sidebarOpen?"1px solid #0f2040":"none",overflow:"hidden",display:"flex",flexDirection:"column",flexShrink:0,transition:"width .25s ease",position:"relative"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #0a1628",fontSize:10,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>Conversations</div>
        {partners.map(p=>{
          const u=unread(p.id); const active=selId===p.id;
          return(
            <button key={p.id} onClick={()=>{setSelId(p.id);setSidebarOpen(false);}}
              style={{width:"100%",padding:"11px 12px",border:"none",background:active?"#0d1829":"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left",borderLeft:`2px solid ${active?RC[p.role]:"transparent"}`,transition:"all .15s"}}>
              <Av label={p.avatar} color={RC[p.role]} size={34}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name.split(" ").slice(1).join(" ")||p.name}</div>
                <div style={{fontSize:9,color:RC[p.role],textTransform:"capitalize",fontWeight:700,marginTop:1}}>{p.role}</div>
              </div>
              {u>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:99,fontSize:9,fontWeight:800,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{u}</span>}
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#0d1829",borderRadius:sidebarOpen?"0 14px 14px 0":"14px",border:"1px solid #0f2040",overflow:"hidden",minWidth:0,borderLeft:sidebarOpen?"none":"1px solid #0f2040"}}>
        {/* Header with toggle arrow */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid #0a1628",display:"flex",alignItems:"center",gap:10}}>
          {/* Bold arrow button */}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)}
            style={{background:"#0ea5e9",border:"none",color:"#fff",width:36,height:36,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,flexShrink:0,boxShadow:"0 2px 8px rgba(14,165,233,.4)"}}>
            {sidebarOpen?"◀":"▶"}
          </button>
          {selUser?(
            <>
              <Av label={selUser.avatar} color={RC[selUser.role]} size={34}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{selUser.name}</div>
                <RolePill role={selUser.role}/>
              </div>
              {user.role==="director"&&<span style={{fontSize:9,color:"#334155",background:"#060d1a",padding:"3px 8px",borderRadius:99,border:"1px solid #0f2040"}}>🔒 Director ↔ HM</span>}
            </>
          ):(
            <div style={{color:"#475569",fontSize:13,flex:1}}>
              {sidebarOpen?"Select a conversation":"Tap ▶ to see contacts"}
            </div>
          )}
        </div>

        {selUser?(
          <>
            <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
              {thread.length===0&&<p style={{color:"#334155",textAlign:"center",marginTop:60,fontSize:13}}>Start the conversation…</p>}
              {thread.map(m=>{
                const mine=m.from===user.id;
                const sender=allUsers.find(u=>u.id===m.from);
                return(
                  <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                    {!mine&&<Av label={sender?.avatar||"?"} color={RC[sender?.role||"teacher"]} size={26}/>}
                    <div style={{maxWidth:"75%",padding:"9px 14px",borderRadius:mine?"16px 16px 4px 16px":"16px 16px 16px 4px",background:mine?"linear-gradient(135deg,#0ea5e9,#0369a1)":"#1e293b",color:"#f1f5f9",fontSize:13,lineHeight:1.5,wordBreak:"break-word"}}>
                      <div>{m.text}</div>
                      <div style={{fontSize:9,color:mine?"rgba(255,255,255,.5)":"#475569",marginTop:4,textAlign:"right"}}>{fmtTime(m.time)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>
            <div style={{padding:"10px 14px",borderTop:"1px solid #0a1628",display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder={`Type message to ${selUser.name.split(" ")[0]}…`}
                style={{flex:1,background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,outline:"none"}}/>
              <Btn onClick={send} disabled={!input.trim()} style={{padding:"11px 18px"}}>Send</Btn>
            </div>
          </>
        ):(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:1,flexDirection:"column",gap:12,color:"#334155"}}>
            <div style={{fontSize:32}}>💬</div>
            <div style={{fontSize:14}}>Tap <strong style={{color:"#0ea5e9"}}>▶</strong> to open contacts</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════
const AnnouncementsScreen = ({user,announcements,setAnnouncements}) => {
  const [title,setTitle]=useState(""); const [body,setBody]=useState("");
  const {toast,show,hide}=useToast();
  const canPost=user.role==="headmaster";
  const post=()=>{
    if(!title.trim()||!body.trim()){show("Please fill both fields.","warning");return;}
    setAnnouncements(prev=>[...prev,{id:uid(),title,body,author:user.name,time:new Date().toISOString()}]);
    setTitle("");setBody("");show("📢 Announcement posted to all teachers!","success");
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Announcements" sub={canPost?"Post school-wide notices":"Notices from the Headmaster"}/>
      {canPost&&(
        <Card style={{marginBottom:22}}>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📢 New Announcement</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Inp label="Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title"/>
            <Textarea label="Message" value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your announcement…" rows={4}/>
            <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={post} icon="📢">Post Announcement</Btn></div>
          </div>
        </Card>
      )}
      {[...announcements].reverse().map(a=>(
        <Card key={a.id} style={{marginBottom:14,borderLeft:"3px solid #38bdf8"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:6}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9"}}>{a.title}</div>
            <div style={{fontSize:11,color:"#334155"}}>{a.author} · {fmtDate(a.time)} {fmtTime(a.time)}</div>
          </div>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.7}}>{a.body}</p>
        </Card>
      ))}
      {announcements.length===0&&<Card><p style={{color:"#334155",textAlign:"center",padding:"16px 0"}}>No announcements yet.</p></Card>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REPORTS — full suite
// ═══════════════════════════════════════════════════════════════
const ReportsScreen = ({students,attendance,smsLog,actLog}) => {
  const [tab,setTab]=useState("overview");
  const approved=useMemo(()=>students.filter(s=>s.approved),[students]);
  const printReport=()=>window.print();
  const exportCSV=()=>{
    const rows=[["Student","Class","ID","Guardian","Phone","Present","Late","Absent","Rate%"]];
    approved.forEach(s=>{
      const sA=attendance.filter(a=>a.student_id===s.id);
      const p=sA.filter(a=>a.status==="present").length;
      const l=sA.filter(a=>a.status==="late").length;
      const ab=sA.filter(a=>a.status==="absent").length;
      const r=sA.length?Math.round(((p+l)/sA.length)*100):0;
      rows.push([s.full_name,s.class,s.id,s.guardian_name,s.guardian_phone,p,l,ab,r]);
    });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="SHDCR_Report.csv";a.click();
  };
  const allDays=[...new Set(attendance.map(a=>a.date))].sort((a,b)=>b.localeCompare(a));
  return(
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Reports & Analytics" sub="Comprehensive school data"/>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm" onClick={printReport} icon="🖨️">Print</Btn>
          <Btn variant="teal" size="sm" onClick={exportCSV} icon="📥">Export CSV</Btn>
        </div>
      </div>
      <TabBar tabs={[["overview","Overview","📊"],["class","By Class","🏫"],["sms","SMS Log","📲"],["activity","Activity","📋"]]} active={tab} onChange={setTab}/>

      {tab==="overview"&&(
        <div>
          <StatGrid stats={[
            {icon:"👥",label:"Total Students",value:approved.length},
            {icon:"📅",label:"Days Recorded",value:allDays.length},
            {icon:"🟢",label:"Total Present",value:attendance.filter(a=>a.status==="present").length,color:"#4ade80"},
            {icon:"🟡",label:"Total Late",value:attendance.filter(a=>a.status==="late").length,color:"#fbbf24"},
            {icon:"🔴",label:"Total Absent",value:attendance.filter(a=>a.status==="absent").length,color:"#f87171"},
            {icon:"📲",label:"SMS Sent",value:smsLog.length,color:"#38bdf8"},
          ]}/>
          <Card>
            <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>Student Attendance Rates (Present + Late ÷ Total)</div>
            {approved.map(s=>{
              const sA=attendance.filter(a=>a.student_id===s.id);
              const p=sA.filter(a=>a.status==="present").length;
              const l=sA.filter(a=>a.status==="late").length;
              const ab=sA.filter(a=>a.status==="absent").length;
              const r=sA.length?Math.round(((p+l)/sA.length)*100):null;
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #0a1628",gap:10,flexWrap:"wrap"}}>
                  <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                  <div style={{minWidth:160,flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#e2e8f0"}}>{s.full_name}</div>
                    <div style={{fontSize:10,color:"#475569"}}>{s.class}</div>
                  </div>
                  <div style={{display:"flex",gap:10,fontSize:11,alignItems:"center",flex:2,minWidth:200}}>
                    <span style={{color:SC.present,width:36}}>P:{p}</span>
                    <span style={{color:SC.late,width:36}}>L:{l}</span>
                    <span style={{color:SC.absent,width:36}}>A:{ab}</span>
                    <div style={{flex:1}}><MiniBar present={p} late={l} absent={ab} total={sA.length||1} height={14}/></div>
                    <RateCircle rate={r} size={38}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {tab==="class"&&(
        <div>
          {CLASSES.map(cls=>{
            const cs=approved.filter(s=>s.class===cls);
            const ca=attendance.filter(a=>a.class===cls);
            const days=[...new Set(ca.map(a=>a.date))];
            const p=ca.filter(a=>a.status==="present").length;
            const l=ca.filter(a=>a.status==="late").length;
            const ab=ca.filter(a=>a.status==="absent").length;
            const rate=cs.length&&days.length?Math.round(((p+l)/(cs.length*days.length))*100):0;
            return(
              <Card key={cls} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#f1f5f9"}}>{cls}</div>
                  <div style={{display:"flex",gap:12,fontSize:12,alignItems:"center"}}>
                    <span style={{color:SC.present}}>✅ {p}</span><span style={{color:SC.late}}>🟡 {l}</span><span style={{color:SC.absent}}>❌ {ab}</span>
                    <RateCircle rate={rate} size={40}/>
                  </div>
                </div>
                <MiniBar present={p} late={l} absent={ab} total={p+l+ab||1} height={20}/>
                <div style={{marginTop:14}}>
                  {cs.map(s=>{
                    const sA=ca.filter(a=>a.student_id===s.id);
                    const sp=sA.filter(a=>a.status==="present").length;
                    const sl=sA.filter(a=>a.status==="late").length;
                    const sr=sA.length?Math.round(((sp+sl)/sA.length)*100):null;
                    return(
                      <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0a1628",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><Av label={s.full_name.slice(0,2).toUpperCase()} size={26} img={s.photo} color="#1e3a5f"/><span style={{fontSize:13}}>{s.full_name}</span></div>
                        <div style={{display:"flex",gap:8,fontSize:11,alignItems:"center"}}>
                          <span style={{color:SC.present}}>{sp}P</span><span style={{color:SC.late}}>{sl}L</span><span style={{color:SC.absent}}>{sA.filter(a=>a.status==="absent").length}A</span>
                          <RateCircle rate={sr} size={34}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="sms"&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📲 Guardian SMS Log — {smsLog.length} sent</div>
          {smsLog.length===0?<p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No SMS sent yet.</p>:
            [...smsLog].reverse().map(s=>(
              <div key={s.id} style={{padding:"12px 0",borderBottom:"1px solid #0a1628"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,flexWrap:"wrap",gap:6,alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{s.student}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge status={s.status}/><span style={{fontSize:10,color:"#334155"}}>{fmtDate(s.time)} {fmtTime(s.time)}</span></div>
                </div>
                <div style={{fontSize:11,color:"#475569",marginBottom:5}}>📞 {s.guardian} · {s.phone}</div>
                <div style={{fontSize:12,color:"#94a3b8",background:"#060d1a",border:"1px solid #0f2040",borderRadius:8,padding:"8px 12px",fontStyle:"italic"}}>"{s.message}"</div>
              </div>
            ))
          }
        </Card>
      )}

      {tab==="activity"&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📋 Activity Log</div>
          {actLog.length===0?<p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No activity yet.</p>:
            [...actLog].reverse().map(a=>(
              <div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid #0a1628",display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:18,marginTop:1}}>{a.type==="attendance"?"✓":a.type==="approval"?"✅":a.type==="rejection"?"❌":"📝"}</span>
                <div><div style={{fontSize:13,color:"#94a3b8"}}>{a.desc}</div><div style={{fontSize:10,color:"#334155",marginTop:3}}>{fmtDate(a.time)} {fmtTime(a.time)} · {a.user}</div></div>
              </div>
            ))
          }
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [students,setStudents]=useStore("shdcr3_students",SEED_STUDENTS);
  const [attendance,setAttendance]=useStore("shdcr3_attendance",[]);
  const [requests,setRequests]=useStore("shdcr3_requests",[]);
  const [messages,setMessages]=useStore("shdcr3_messages",[]);
  const [announcements,setAnnouncements]=useStore("shdcr3_announcements",[]);
  const [smsLog,setSmsLog]=useStore("shdcr3_sms",[]);
  const [actLog,setActLog]=useStore("shdcr3_actlog",[]);
  const [extraTeachers,setExtraTeachers]=useStore("shdcr3_teachers",[]);
  const allTeachers=[...USERS.filter(u=>u.role==="teacher"),...extraTeachers];
  const pending=requests.filter(r=>r.status==="pending").length;
  if(!user){
    const allUsers=[...USERS,...extraTeachers];
    return<><GS/><Login onLogin={u=>{setUser(u);setScreen("dashboard");}} allUsers={allUsers}/></>;
  }
  const SW=collapsed?64:220;
  const sp={user,students,setStudents,attendance,setAttendance,requests,setRequests,messages,setMessages,announcements,setAnnouncements,smsLog,setSmsLog,actLog,setActLog,extraTeachers,setExtraTeachers};
  const renderScreen=()=>{
    const r=user.role;
    switch(screen){
      case"dashboard":    return r==="teacher"?<TeacherDash {...sp} setScreen={setScreen}/>:r==="headmaster"?<HeadDash {...sp} setScreen={setScreen}/>:<DirectorDash {...sp}/>;
      case"attendance":   return<AttendanceScreen {...sp} isHead={r==="headmaster"}/>;
      case"att-history":  return<AttHistoryScreen {...sp} isHead={r==="headmaster"}/>;
      case"my-students":  return<StudentsScreen {...sp} isHead={false}/>;
      case"students":     return<StudentsScreen {...sp} isHead={true}/>;
      case"add-student":  return<AddStudentScreen {...sp}/>;
      case"approvals":    return<ApprovalsScreen {...sp}/>;
      case"teachers":     return<TeachersScreen {...sp} extraTeachers={extraTeachers} setExtraTeachers={setExtraTeachers}/>;
      case"classes":      return<ClassesScreen {...sp}/>;
      case"chat":         return<ChatScreen {...sp} extraTeachers={extraTeachers}/>;
      case"announcements":return<AnnouncementsScreen {...sp}/>;
      case"reports":      return<ReportsScreen {...sp}/>;
      default:return null;
    }
  };
  return(
    <><GS/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar user={user} screen={screen} setScreen={setScreen} pendingCount={pending} onLogout={()=>{setUser(null);setScreen("dashboard");}} collapsed={collapsed} setCollapsed={setCollapsed}/>
        <main style={{marginLeft:SW,flex:1,padding:"26px 24px",maxWidth:"100%",overflowX:"hidden",minHeight:"100vh",transition:"margin-left .25s cubic-bezier(.4,0,.2,1)"}}>
          {renderScreen()}
        </main>
      </div>
    </>
  );
}
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{font-family:'DM Sans',sans-serif;background:#06090f;color:#cbd5e1;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
    input,select,textarea,button{font-family:'DM Sans',sans-serif}
    button{cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
    @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
    .fu{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fi{animation:fadeIn .3s ease both}
    .blink{animation:pulse 2s infinite}
    .spin{animation:spin 1s linear infinite}
    .card-hover{transition:transform .2s,box-shadow .2s,border-color .2s}
    .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.4);border-color:#1e3a5f !important}
    @media print{
      .no-print{display:none!important}
      body{background:white;color:black}
      .print-area{background:white;color:black;padding:20px}
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Av = ({label,color="#38bdf8",size=36,img=null,style={}}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:img?"#0f172a":color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.32,fontWeight:700,color,flexShrink:0,overflow:"hidden",border:`1.5px solid ${color}44`,...style}}>
    {img?<img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:label}
  </div>
);

const Badge = ({status}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:SBG[status],color:SC[status],border:`1px solid ${SC[status]}33`,textTransform:"capitalize",letterSpacing:.3,whiteSpace:"nowrap"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:SC[status],display:"inline-block"}}/>
    {status}
  </span>
);

const RolePill = ({role}) => (
  <span style={{padding:"2px 9px",borderRadius:99,fontSize:9,fontWeight:700,background:RC[role]+"18",color:RC[role],textTransform:"uppercase",letterSpacing:1}}>{role}</span>
);

const Card = ({children,style={},className="",onClick}) => (
  <div className={`${className}${onClick?" card-hover":""}`} onClick={onClick}
    style={{background:"linear-gradient(145deg,#0d1829,#0a1220)",borderRadius:16,padding:"20px 22px",border:"1px solid #0f2040",...style,cursor:onClick?"pointer":"default"}}>
    {children}
  </div>
);

const Btn = ({children,onClick,variant="primary",style={},disabled=false,size="md",icon=""}) => {
  const sz = size==="sm"?{padding:"6px 14px",fontSize:12}:size==="lg"?{padding:"13px 28px",fontSize:15}:{padding:"9px 20px",fontSize:13};
  const vs = {
    primary:{background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(14,165,233,.25)"},
    success:{background:"linear-gradient(135deg,#22c55e,#15803d)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(34,197,94,.2)"},
    danger: {background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(239,68,68,.2)"},
    warning:{background:"linear-gradient(135deg,#f59e0b,#b45309)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(245,158,11,.2)"},
    ghost:  {background:"transparent",color:"#64748b",border:"1px solid #1e293b",boxShadow:"none"},
    purple: {background:"linear-gradient(135deg,#a855f7,#7c3aed)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(168,85,247,.25)"},
    teal:   {background:"linear-gradient(135deg,#14b8a6,#0f766e)",color:"#fff",border:"none",boxShadow:"0 4px 15px rgba(20,184,166,.2)"},
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{...sz,borderRadius:10,fontWeight:600,transition:"all .2s",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,...vs[variant],display:"inline-flex",alignItems:"center",gap:6,...style}}>
      {icon&&<span>{icon}</span>}{children}
    </button>
  );
};

const Inp = ({label,hint,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <input {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",transition:"border-color .2s,box-shadow .2s",...p.style}}
      onFocus={e=>{e.target.style.borderColor="#0ea5e9";e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,.15)";}}
      onBlur={e=>{e.target.style.borderColor="#1e293b";e.target.style.boxShadow="none";}}/>
    {hint&&<span style={{fontSize:11,color:"#334155"}}>{hint}</span>}
  </div>
);

const Sel = ({label,children,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <select {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",...p.style}}>{children}</select>
  </div>
);

const Textarea = ({label,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <textarea {...p} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,outline:"none",resize:"vertical",lineHeight:1.5,...p.style}}
      onFocus={e=>{e.target.style.borderColor="#0ea5e9";e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,.15)";}}
      onBlur={e=>{e.target.style.borderColor="#1e293b";e.target.style.boxShadow="none";}}/>
  </div>
);

const Modal = ({open,onClose,title,children,width=520}) => {
  if(!open)return null;
  return (
    <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}} onClick={onClose}>
      <div className="fu" style={{background:"linear-gradient(145deg,#0d1829,#0a1220)",borderRadius:20,padding:28,width:"100%",maxWidth:width,maxHeight:"92vh",overflowY:"auto",border:"1px solid #1e293b",boxShadow:"0 32px 80px rgba(0,0,0,.7)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:18,color:"#f1f5f9"}}>{title}</h3>
          <button onClick={onClose} style={{background:"#0f2040",border:"none",color:"#64748b",width:32,height:32,borderRadius:"50%",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({msg,type,onClose}) => {
  useEffect(()=>{if(msg){const t=setTimeout(onClose,4000);return()=>clearTimeout(t);}}, [msg]);
  if(!msg)return null;
  const colors={success:"#22c55e",error:"#ef4444",info:"#38bdf8",warning:"#f59e0b"};
  const c=colors[type]||colors.info;
  return (
    <div className="fu" style={{position:"fixed",bottom:28,right:28,background:`linear-gradient(135deg,#0d1829,#0a1220)`,color:c,border:`1px solid ${c}44`,padding:"13px 20px",borderRadius:14,fontWeight:600,fontSize:13,zIndex:9999,boxShadow:"0 8px 40px rgba(0,0,0,.6)",maxWidth:380,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>{type==="success"?"✅":type==="error"?"❌":type==="warning"?"⚠️":"ℹ️"}</span>
      <span>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:c,opacity:.6,cursor:"pointer",marginLeft:4}}>✕</button>
    </div>
  );
};

const useToast = () => {
  const [t,setT]=useState({msg:"",type:"info"});
  const show=(msg,type="info")=>setT({msg,type});
  const hide=()=>setT({msg:"",type:"info"});
  return {toast:t,show,hide};
};

// ═══════════════════════════════════════════════════════════════
// MINI BAR CHART
// ═══════════════════════════════════════════════════════════════
const MiniBar = ({present,late,absent,total,height=32}) => {
  if(!total)return <div style={{height,borderRadius:6,background:"#0f172a",fontSize:10,color:"#334155",display:"flex",alignItems:"center",justifyContent:"center"}}>No data</div>;
  const pPct=Math.round((present/total)*100);
  const lPct=Math.round((late/total)*100);
  const aPct=100-pPct-lPct;
  return (
    <div style={{display:"flex",gap:2,height,borderRadius:6,overflow:"hidden"}}>
      {pPct>0&&<div style={{flex:pPct,background:"#22c55e",minWidth:2,transition:"flex .5s"}} title={`Present: ${present}`}/>}
      {lPct>0&&<div style={{flex:lPct,background:"#f59e0b",minWidth:2,transition:"flex .5s"}} title={`Late: ${late}`}/>}
      {aPct>0&&<div style={{flex:aPct,background:"#1e293b",minWidth:2,transition:"flex .5s"}} title={`Absent: ${absent}`}/>}
    </div>
  );
};

// Rate circle
const RateCircle = ({rate,size=52}) => {
  const color = rate===null?"#1e293b":rate>=80?"#22c55e":rate>=60?"#f59e0b":"#ef4444";
  const r=18,circ=2*Math.PI*r;
  const dash=rate?circ*(rate/100):0;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0f172a" strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .6s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.22,fontWeight:800,color,fontFamily:"'Syne',sans-serif"}}>
        {rate===null?"—":`${rate}`}
      </div>
    </div>
  );
};

// Section heading
const H = ({children,sub=""}) => (
  <div style={{marginBottom:22}}>
    <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"#f1f5f9",letterSpacing:-.3}}>{children}</h2>
    {sub&&<p style={{color:"#475569",fontSize:13,marginTop:4}}>{sub}</p>}
  </div>
);

const TabBar = ({tabs,active,onChange}) => (
  <div style={{display:"flex",gap:4,marginBottom:20,background:"#060d1a",borderRadius:12,padding:4,border:"1px solid #0f2040",flexWrap:"wrap"}}>
    {tabs.map(([id,label,icon])=>(
      <button key={id} onClick={()=>onChange(id)}
        style={{padding:"8px 16px",borderRadius:9,border:"none",background:active===id?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",color:active===id?"#fff":"#64748b",fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
        {icon&&<span>{icon}</span>}{label}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════
const MENUS = {
  teacher:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"attendance",icon:"✓",label:"Take Attendance"},
    {id:"att-history",icon:"📅",label:"History"},
    {id:"my-students",icon:"👥",label:"My Class"},
    {id:"add-student",icon:"＋",label:"Add Student"},
    {id:"announcements",icon:"📢",label:"Announcements"},
    {id:"chat",icon:"💬",label:"Messages"},
  ],
  headmaster:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"approvals",icon:"✅",label:"Approvals",badge:true},
    {id:"attendance",icon:"✓",label:"Attendance"},
    {id:"att-history",icon:"📅",label:"Att. History"},
    {id:"students",icon:"👥",label:"All Students"},
    {id:"teachers",icon:"👨‍🏫",label:"Teachers"},
    {id:"classes",icon:"🏫",label:"Classes"},
    {id:"chat",icon:"💬",label:"Messages"},
    {id:"announcements",icon:"📢",label:"Announcements"},
    {id:"reports",icon:"📊",label:"Reports"},
  ],
  director:[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"reports",icon:"📊",label:"Reports"},
    {id:"chat",icon:"💬",label:"Messages"},
  ],
};

const Sidebar = ({user,screen,setScreen,pendingCount,onLogout,collapsed,setCollapsed}) => {
  const items = MENUS[user.role]||[];
  const W = collapsed?64:220;
  return (
    <div className="no-print" style={{width:W,background:"#040810",borderRight:"1px solid #0a1628",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:200,transition:"width .25s cubic-bezier(.4,0,.2,1)",overflow:"hidden"}}>
      <div style={{padding:collapsed?"16px 0":"20px 16px 16px",borderBottom:"1px solid #0a1628",display:"flex",alignItems:"center",gap:10,justifyContent:collapsed?"center":"flex-start"}}>
        {!collapsed&&(
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f1f5f9",letterSpacing:-.3}}>Sir Hosny</div>
            <div style={{fontSize:8,color:"#38bdf8",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginTop:1}}>Class Register</div>
          </div>
        )}
        <button onClick={()=>setCollapsed(!collapsed)} style={{background:"#0a1628",border:"none",color:"#475569",width:28,height:28,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
          {collapsed?"→":"←"}
        </button>
      </div>

      <div style={{margin:"10px 8px",background:"#060d1a",borderRadius:12,padding:collapsed?"10px 4px":"10px",display:"flex",alignItems:"center",gap:8,justifyContent:collapsed?"center":"flex-start",border:"1px solid #0f2040"}}>
        <Av label={user.avatar} color={RC[user.role]} size={32}/>
        {!collapsed&&(
          <div style={{overflow:"hidden",flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name.split(" ").slice(1).join(" ")}</div>
            <RolePill role={user.role}/>
          </div>
        )}
      </div>

      <nav style={{flex:1,overflowY:"auto",padding:"6px 6px",overflowX:"hidden"}}>
        {items.map(item=>{
          const active=screen===item.id;
          const showBadge=item.badge&&pendingCount>0;
          return (
            <button key={item.id} onClick={()=>setScreen(item.id)}
              title={collapsed?item.label:""}
              style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:collapsed?"10px":"9px 10px",borderRadius:10,border:"none",background:active?"#0d2d4d":"transparent",color:active?"#38bdf8":"#475569",fontWeight:active?600:400,fontSize:13,cursor:"pointer",marginBottom:1,textAlign:"left",transition:"all .15s",borderLeft:`2px solid ${active?"#38bdf8":"transparent"}`,justifyContent:collapsed?"center":"flex-start",position:"relative",overflow:"visible"}}>
              <span style={{fontSize:14,width:16,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              {!collapsed&&<span style={{flex:1,whiteSpace:"nowrap"}}>{item.label}</span>}
              {showBadge&&<span style={{background:"#f59e0b",color:"#000",borderRadius:99,fontSize:9,fontWeight:800,padding:"1px 5px",minWidth:16,textAlign:"center",position:collapsed?"absolute":"static",top:collapsed?4:undefined,right:collapsed?4:undefined}}>{pendingCount}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{padding:"8px 6px 14px"}}>
        <button onClick={onLogout} title={collapsed?"Sign out":""} style={{width:"100%",padding:"8px",borderRadius:10,border:"1px solid #0a1628",background:"transparent",color:"#334155",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,justifyContent:collapsed?"center":"flex-start"}}>
          <span>🚪</span>{!collapsed&&"Sign Out"}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
const Login = ({onLogin,allUsers}) => {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const users=allUsers||USERS;
  const go=()=>{
    setLoading(true); setErr("");
    setTimeout(()=>{
      const user=users.find(x=>x.username===u&&x.password===p);
      if(user)onLogin(user); else{setErr("Invalid username or password.");setLoading(false);}
    },600);
  };
  return (
    <div style={{minHeight:"100vh",background:"#06090f",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60vw",height:"60vw",background:"radial-gradient(circle,rgba(14,165,233,.06) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"50vw",height:"50vw",background:"radial-gradient(circle,rgba(168,85,247,.05) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(#0f2040 1px,transparent 1px)",backgroundSize:"28px 28px",opacity:.4,pointerEvents:"none"}}/>
      <div className="fu" style={{width:"100%",maxWidth:420,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(14,165,233,.3)"}}>🏫</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:"#f1f5f9",letterSpacing:-.5}}>Sir Hosny DCRS</h1>
          <p style={{color:"#475569",fontSize:12,marginTop:6,letterSpacing:.5}}>Digital Class Register System</p>
        </div>
        <Card style={{padding:"28px 28px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Username" value={u} onChange={e=>{setU(e.target.value);setErr("");}} placeholder="Enter username" onKeyDown={e=>e.key==="Enter"&&go()}/>
            <Inp label="Password" type="password" value={p} onChange={e=>{setP(e.target.value);setErr("");}} placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&go()}/>
            {err&&<div style={{color:"#f87171",fontSize:12,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",padding:"8px 12px",borderRadius:8}}>{err}</div>}
            <Btn onClick={go} disabled={loading} size="lg" style={{width:"100%",justifyContent:"center",marginTop:4}}>
              {loading?<span className="spin" style={{display:"inline-block"}}>⟳</span>:"Sign In →"}
            </Btn>
          </div>
          <div style={{marginTop:22,borderTop:"1px solid #0f2040",paddingTop:16}}>
            <p style={{color:"#1e293b",fontSize:10,marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Quick Access — Demo Accounts</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {USERS.filter((u,i)=>i<3).map(u=>(
                <button key={u.id} onClick={()=>{setU(u.username);setP(u.password);setErr("");}}
                  style={{padding:"8px 6px",borderRadius:10,border:"1px solid #0f2040",background:"#060d1a",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:11,color:RC[u.role],fontWeight:700,textTransform:"capitalize"}}>{u.role}</div>
                  <div style={{fontSize:9,color:"#334155",marginTop:2}}>{u.username}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:6,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {USERS.filter((u,i)=>i>=3).map(u=>(
                <button key={u.id} onClick={()=>{setU(u.username);setP(u.password);setErr("");}}
                  style={{padding:"8px 6px",borderRadius:10,border:"1px solid #0f2040",background:"#060d1a",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:11,color:RC[u.role],fontWeight:700}}>{u.name.split(" ")[1]}</div>
                  <div style={{fontSize:9,color:"#334155",marginTop:2}}>{u.class}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════════════
const StatGrid = ({stats}) => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:22}}>
    {stats.map(({icon,label,value,color="#38bdf8",trend})=>(
      <Card key={label} className="fu card-hover">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontSize:20}}>{icon}</div>
          {trend!==undefined&&<span style={{fontSize:10,color:trend>=0?"#22c55e":"#ef4444",fontWeight:700,background:trend>=0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",padding:"2px 6px",borderRadius:99}}>{trend>=0?"↑":"↓"}{Math.abs(trend)}%</span>}
        </div>
        <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Syne',sans-serif",lineHeight:1,letterSpacing:-.5}}>{value}</div>
        <div style={{color:"#475569",fontSize:11,marginTop:6,fontWeight:500,textTransform:"uppercase",letterSpacing:.6}}>{label}</div>
      </Card>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// DASHBOARDS
// ═══════════════════════════════════════════════════════════════
const TeacherDash = ({user,students,attendance,announcements,requests,setScreen}) => {
  const mine=useMemo(()=>students.filter(s=>s.class===user.class&&s.approved),[students,user.class]);
  const tAtt=useMemo(()=>attendance.filter(a=>a.date===today()&&a.class===user.class),[attendance,user.class]);
  const doneToday=tAtt.length>0;
  const myReqs=requests.filter(r=>r.teacher_id===user.id&&r.status==="pending").length;
  return (
    <div className="fu">
      <H children={`Welcome back, ${user.name.split(" ")[1]} 👋`} sub={`${user.class} · ${fmtDate(today())}`}/>
      {!doneToday&&(
        <div className="blink" onClick={()=>setScreen("attendance")} style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.3)",borderRadius:14,padding:"14px 20px",marginBottom:18,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>⚠️</span>
          <div>
            <div style={{fontWeight:700,color:"#fbbf24",fontSize:14}}>Attendance Not Taken Yet</div>
            <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Tap to take attendance for {user.class} today</div>
          </div>
          <Btn variant="warning" size="sm" style={{marginLeft:"auto"}}>Take Now</Btn>
        </div>
      )}
      <StatGrid stats={[
        {icon:"👥",label:"My Students",value:mine.length},
        {icon:"🟢",label:"Present",value:tAtt.filter(a=>a.status==="present").length,color:"#4ade80"},
        {icon:"🟡",label:"Late",value:tAtt.filter(a=>a.status==="late").length,color:"#fbbf24"},
        {icon:"🔴",label:"Absent",value:tAtt.filter(a=>a.status==="absent").length,color:"#f87171"},
        ...(myReqs>0?[{icon:"⏳",label:"Pending Req.",value:myReqs,color:"#c084fc"}]:[]),
      ]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card style={{gridColumn:1}}>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Today's Roll — {user.class}</div>
          {mine.length===0?<p style={{color:"#334155",fontSize:13}}>No students yet.</p>:
            mine.map(s=>{
              const att=tAtt.find(a=>a.student_id===s.id);
              const r=attRate(attendance,s.id);
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0a1628"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{s.full_name}</div>
                      <div style={{fontSize:10,color:"#334155"}}>{r!==null?`${r}% attendance`:""}</div>
                    </div>
                  </div>
                  {att?<Badge status={att.status}/>:<span style={{fontSize:10,color:"#1e3a5f",fontStyle:"italic"}}>—</span>}
                </div>
              );
            })
          }
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {announcements.length>0&&(
            <Card style={{borderLeft:"3px solid #38bdf8"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>📢 Latest Notice</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:"#e2e8f0"}}>{announcements[announcements.length-1].title}</div>
              <p style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{announcements[announcements.length-1].body}</p>
            </Card>
          )}
          <Card onClick={()=>setScreen("att-history")} style={{cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>This Week</div>
            {[...Array(5)].map((_,i)=>{
              const d=new Date(); d.setDate(d.getDate()-i);
              const ds=d.toISOString().split("T")[0];
              const da=attendance.filter(a=>a.date===ds&&a.class===user.class);
              return(
                <div key={ds} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{fontSize:10,color:"#475569",width:70,flexShrink:0}}>{fmtDate(ds)}</div>
                  {da.length>0?(
                    <MiniBar present={da.filter(a=>a.status==="present").length} late={da.filter(a=>a.status==="late").length} absent={da.filter(a=>a.status==="absent").length} total={da.length} height={16}/>
                  ):<div style={{flex:1,height:16,borderRadius:4,background:"#0a1628",fontSize:9,color:"#1e293b",display:"flex",alignItems:"center",paddingLeft:6}}>No data</div>}
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

const HeadDash = ({students,attendance,requests,setScreen}) => {
  const approved=useMemo(()=>students.filter(s=>s.approved),[students]);
  const tAtt=useMemo(()=>attendance.filter(a=>a.date===today()),[attendance]);
  const pending=requests.filter(r=>r.status==="pending").length;
  const classData=CLASSES.map(c=>{
    const cs=approved.filter(s=>s.class===c);
    const ca=tAtt.filter(a=>a.class===c);
    const p=ca.filter(a=>a.status==="present").length;
    const t=USERS.find(u=>u.class===c);
    return{cls:c,total:cs.length,present:p,late:ca.filter(a=>a.status==="late").length,absent:ca.filter(a=>a.status==="absent").length,done:ca.length>0,teacher:t?.name||"—",rate:cs.length?Math.round(((p+ca.filter(a=>a.status==="late").length)/Math.max(ca.length,1))*100):0};
  });
  return(
    <div className="fu">
      <H children="Headmaster Dashboard" sub={fmtDate(today())}/>
      {pending>0&&(
        <div onClick={()=>setScreen("approvals")} style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.3)",borderRadius:14,padding:"14px 20px",marginBottom:18,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span className="blink" style={{fontSize:22}}>⏳</span>
          <div>
            <div style={{fontWeight:700,color:"#fbbf24"}}>{pending} Pending Student Approval{pending>1?"s":""}</div>
            <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Review and approve teacher requests</div>
          </div>
          <Btn variant="warning" size="sm" style={{marginLeft:"auto"}}>Review</Btn>
        </div>
      )}
      <StatGrid stats={[
        {icon:"👥",label:"Total Students",value:approved.length},
        {icon:"👨‍🏫",label:"Teachers",value:USERS.filter(u=>u.role==="teacher").length},
        {icon:"🏫",label:"Classes",value:CLASSES.length},
        {icon:"🟢",label:"Present Today",value:tAtt.filter(a=>a.status==="present").length,color:"#4ade80"},
        {icon:"🟡",label:"Late Today",value:tAtt.filter(a=>a.status==="late").length,color:"#fbbf24"},
        {icon:"🔴",label:"Absent Today",value:tAtt.filter(a=>a.status==="absent").length,color:"#f87171"},
      ]}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
        {classData.map(c=>(
          <Card key={c.cls} onClick={()=>setScreen("classes")} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9"}}>{c.cls}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:2}}>{c.teacher}</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,background:c.done?"rgba(34,197,94,.1)":"rgba(245,158,11,.1)",color:c.done?"#4ade80":"#fbbf24"}}>
                {c.done?"✅ Done":"⏳ Pending"}
              </span>
            </div>
            <MiniBar present={c.present} late={c.late} absent={c.absent} total={c.present+c.late+c.absent||c.total} height={20}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11}}>
              <span style={{color:"#475569"}}>{c.total} students</span>
              <span style={{color:"#4ade80",fontWeight:700}}>{c.rate}% present</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DirectorDash = ({students,attendance}) => {
  const approved=students.filter(s=>s.approved);
  const tAtt=attendance.filter(a=>a.date===today());
  const total=approved.length;
  const present=tAtt.filter(a=>a.status==="present").length;
  const late=tAtt.filter(a=>a.status==="late").length;
  const absent=tAtt.filter(a=>a.status==="absent").length;
  const rate=total?Math.round(((present+late)/total)*100):0;
  const allDays=[...new Set(attendance.map(a=>a.date))].sort((a,b)=>b.localeCompare(a)).slice(0,7);
  return(
    <div className="fu">
      <H children="Director Overview" sub={`${fmtDate(today())} · Read-only access`}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
        <Card style={{gridColumn:"1/-1",background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(14,165,233,.08))",border:"1px solid rgba(168,85,247,.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <RateCircle rate={rate} size={72}/>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9"}}>{rate}% School Attendance Today</div>
              <div style={{color:"#64748b",fontSize:13,marginTop:4}}>{present} present · {late} late · {absent} absent out of {total} students</div>
            </div>
          </div>
        </Card>
      </div>
      <StatGrid stats={[
        {icon:"👥",label:"Students",value:total},
        {icon:"🏫",label:"Classes",value:CLASSES.length},
        {icon:"🟢",label:"Present",value:present,color:"#4ade80"},
        {icon:"🟡",label:"Late",value:late,color:"#fbbf24"},
        {icon:"🔴",label:"Absent",value:absent,color:"#f87171"},
      ]}/>
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Last 7 Days — School-wide</div>
        {allDays.map(d=>{
          const da=attendance.filter(a=>a.date===d);
          const p=da.filter(a=>a.status==="present").length;
          const l=da.filter(a=>a.status==="late").length;
          const ab=da.filter(a=>a.status==="absent").length;
          return(
            <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:11,color:"#475569",width:80,flexShrink:0}}>{fmtDate(d)}</div>
              <div style={{flex:1}}><MiniBar present={p} late={l} absent={ab} total={p+l+ab} height={20}/></div>
              <div style={{fontSize:11,color:"#64748b",width:60,textAlign:"right",flexShrink:0}}>{p+l+ab>0?`${Math.round(((p+l)/(p+l+ab))*100)}%`:"—"}</div>
            </div>
          );
        })}
        {allDays.length===0&&<p style={{color:"#334155",fontSize:13}}>No data yet.</p>}
      </Card>
      <Card style={{marginTop:14,borderLeft:"3px solid #c084fc"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🔒</span>
          <div style={{fontSize:13,color:"#64748b"}}>Director access is read-only. Use Messages to communicate with the Headmaster.</div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════
const AttendanceScreen = ({user,students,attendance,setAttendance,setSmsLog,setActLog,isHead=false}) => {
  const [selClass,setSelClass]=useState(isHead?CLASSES[0]:user.class||CLASSES[0]);
  const [marks,setMarks]=useState({});
  const [filter,setFilter]=useState("");
  const {toast,show,hide}=useToast();
  const classStudents=useMemo(()=>students.filter(s=>s.class===selClass&&s.approved),[students,selClass]);
  const filtered=useMemo(()=>classStudents.filter(s=>s.full_name.toLowerCase().includes(filter.toLowerCase())),[classStudents,filter]);
  const alreadyDone=attendance.some(a=>a.class===selClass&&a.date===today());
  const todayRecords=attendance.filter(a=>a.class===selClass&&a.date===today());
  useEffect(()=>setMarks({}),[selClass]);
  const pct=Math.round((Object.values(marks).filter(v=>v==="present").length/Math.max(classStudents.length,1))*100);
  const markAll=st=>{const m={};classStudents.forEach(s=>m[s.id]=st);setMarks(m);};
  const submit=()=>{
    if(Object.keys(marks).length!==classStudents.length){show("Mark all students first.","warning");return;}
    const entries=classStudents.map(s=>({id:uid(),student_id:s.id,class:selClass,date:today(),status:marks[s.id],teacher:user.name,teacher_id:user.id}));
    setAttendance(prev=>[...prev,...entries]);
    const logs=classStudents.map(s=>({id:uid(),guardian:s.guardian_name,phone:s.guardian_phone,student:s.full_name,student_id:s.id,status:marks[s.id],message:smsMsg(s.full_name,marks[s.id]),time:new Date().toISOString(),class:selClass}));
    setSmsLog(prev=>[...prev,...logs]);
    setActLog(prev=>[...prev,{id:uid(),type:"attendance",desc:`${user.name} submitted attendance for ${selClass}`,time:new Date().toISOString(),user:user.name}]);
    show(`✅ Submitted! ${logs.length} SMS sent to guardians.`,"success");
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Take Attendance" sub={fmtDate(today())}/>
        {isHead&&<Sel value={selClass} onChange={e=>setSelClass(e.target.value)}>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
      </div>
      {alreadyDone?(
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <span style={{fontSize:24}}>✅</span>
            <div>
              <div style={{fontWeight:700,color:"#4ade80",fontSize:15}}>Attendance Submitted — {selClass}</div>
              <div style={{fontSize:12,color:"#475569",marginTop:2}}>Submitted {fmtDate(today())}</div>
            </div>
          </div>
          <MiniBar present={todayRecords.filter(a=>a.status==="present").length} late={todayRecords.filter(a=>a.status==="late").length} absent={todayRecords.filter(a=>a.status==="absent").length} total={todayRecords.length} height={24}/>
          <div style={{display:"flex",gap:16,marginTop:10,fontSize:12}}>
            <span style={{color:"#4ade80"}}>✅ {todayRecords.filter(a=>a.status==="present").length} Present</span>
            <span style={{color:"#fbbf24"}}>🟡 {todayRecords.filter(a=>a.status==="late").length} Late</span>
            <span style={{color:"#f87171"}}>❌ {todayRecords.filter(a=>a.status==="absent").length} Absent</span>
          </div>
          <div style={{marginTop:18}}>
            {todayRecords.map(a=>{
              const s=students.find(x=>x.id===a.student_id);if(!s)return null;
              return(
                <div key={a.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0a1628"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                    <span style={{fontSize:13}}>{s.full_name}</span>
                  </div>
                  <Badge status={a.status}/>
                </div>
              );
            })}
          </div>
        </Card>
      ):(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn variant="success" size="sm" onClick={()=>markAll("present")} icon="🟢">All Present</Btn>
              <Btn variant="warning" size="sm" onClick={()=>markAll("late")} icon="🟡">All Late</Btn>
              <Btn variant="danger" size="sm" onClick={()=>markAll("absent")} icon="🔴">All Absent</Btn>
            </div>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter students..." style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:8,padding:"7px 12px",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
          </div>
          {Object.keys(marks).length>0&&(
            <div style={{marginBottom:14}}>
              <MiniBar present={Object.values(marks).filter(v=>v==="present").length} late={Object.values(marks).filter(v=>v==="late").length} absent={Object.values(marks).filter(v=>v==="absent").length} total={classStudents.length} height={20}/>
              <div style={{fontSize:11,color:"#475569",marginTop:6}}>{Object.keys(marks).length}/{classStudents.length} marked · {pct}% present</div>
            </div>
          )}
          {filtered.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #0a1628",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av label={s.full_name.slice(0,2).toUpperCase()} size={36} img={s.photo} color="#1e3a5f"/>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#e2e8f0"}}>{s.full_name}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{s.id} · {s.guardian_phone}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:5}}>
                {["present","late","absent"].map(st=>(
                  <button key={st} onClick={()=>setMarks(m=>({...m,[s.id]:st}))}
                    style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${marks[s.id]===st?SC[st]:"#1e293b"}`,background:marks[s.id]===st?SBG[st]:"transparent",color:marks[s.id]===st?SC[st]:"#334155",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all .15s"}}>
                    {st==="present"?"🟢":st==="late"?"🟡":"🔴"} {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {classStudents.length===0&&<p style={{color:"#334155",padding:"20px 0",textAlign:"center"}}>No students in this class yet.</p>}
          {classStudents.length>0&&(
            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:10}}>
              <Btn variant="ghost" size="sm" onClick={()=>setMarks({})}>Clear All</Btn>
              <Btn onClick={submit} size="lg" disabled={Object.keys(marks).length!==classStudents.length}>Submit & Send SMS 📲</Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE HISTORY
// ═══════════════════════════════════════════════════════════════
const AttHistoryScreen = ({user,students,attendance,isHead=false}) => {
  const [selClass,setSelClass]=useState(isHead?"Grade 5A":user.class);
  const [selStudent,setSelStudent]=useState("all");
  const [dateFrom,setDateFrom]=useState("");
  const classStudents=students.filter(s=>s.class===selClass&&s.approved);
  const dates=[...new Set(attendance.filter(a=>a.class===selClass).map(a=>a.date))].sort((a,b)=>b.localeCompare(a));
  const filteredDates=dates.filter(d=>!dateFrom||d>=dateFrom);
  const printRef=useRef();
  const doPrint=()=>window.print();
  return(
    <div className="fu" ref={printRef}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Attendance History" sub="Full log by class and date"/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="ghost" size="sm" onClick={doPrint} icon="🖨️">Print</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {isHead&&<Sel value={selClass} onChange={e=>{setSelClass(e.target.value);setSelStudent("all");}}>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
        <Sel value={selStudent} onChange={e=>setSelStudent(e.target.value)}>
          <option value="all">All Students</option>
          {classStudents.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}
        </Sel>
        <Inp type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"9px 12px",color:"#e2e8f0",fontSize:13}}/>
      </div>
      {filteredDates.length===0?<Card><p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No records found.</p></Card>:
        filteredDates.map(date=>{
          const dayRecs=attendance.filter(a=>a.class===selClass&&a.date===date&&(selStudent==="all"||a.student_id===selStudent));
          if(!dayRecs.length)return null;
          const p=dayRecs.filter(a=>a.status==="present").length;
          const l=dayRecs.filter(a=>a.status==="late").length;
          const ab=dayRecs.filter(a=>a.status==="absent").length;
          return(
            <Card key={date} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{fmtDate(date)}</div>
                <div style={{display:"flex",gap:12,fontSize:12}}>
                  <span style={{color:"#4ade80"}}>✅ {p}</span>
                  <span style={{color:"#fbbf24"}}>🟡 {l}</span>
                  <span style={{color:"#f87171"}}>❌ {ab}</span>
                </div>
              </div>
              <MiniBar present={p} late={l} absent={ab} total={dayRecs.length} height={16}/>
              <div style={{marginTop:12}}>
                {dayRecs.map(a=>{
                  const s=students.find(x=>x.id===a.student_id);if(!s)return null;
                  return(
                    <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0a1628",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Av label={s.full_name.slice(0,2).toUpperCase()} size={26} img={s.photo} color="#1e3a5f"/>
                        <span style={{fontSize:13}}>{s.full_name}</span>
                      </div>
                      <Badge status={a.status}/>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════════
const StudentModal = ({student,attendance,open,onClose}) => {
  if(!student)return null;
  const sAtt=attendance.filter(a=>a.student_id===student.id).sort((a,b)=>b.date.localeCompare(a.date));
  const p=sAtt.filter(a=>a.status==="present").length;
  const l=sAtt.filter(a=>a.status==="late").length;
  const ab=sAtt.filter(a=>a.status==="absent").length;
  const rate=sAtt.length?Math.round(((p+l)/sAtt.length)*100):null;
  return(
    <Modal open={open} onClose={onClose} title="Student Profile" width={560}>
      <div style={{display:"flex",gap:16,alignItems:"center",background:"#060d1a",borderRadius:14,padding:16,marginBottom:20}}>
        <Av label={student.full_name.slice(0,2).toUpperCase()} size={64} img={student.photo} color="#1e3a5f"/>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#f1f5f9"}}>{student.full_name}</div>
          <div style={{fontSize:12,color:"#38bdf8",marginTop:3}}>{student.class} · ID: {student.id}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:2}}>Age: {calcAge(student.dob)} · Born: {fmtDate(student.dob)}</div>
        </div>
        <RateCircle rate={rate} size={60}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:"#060d1a",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Guardian</div>
          <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{student.guardian_name}</div>
          <div style={{fontSize:12,color:"#38bdf8",marginTop:3}}>{student.guardian_phone}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {[["Present",p,"#4ade80"],["Late",l,"#fbbf24"],["Absent",ab,"#f87171"]].map(([lb,v,c])=>(
            <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
              <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontWeight:700,fontSize:11,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Recent Records</div>
      <div style={{maxHeight:180,overflowY:"auto"}}>
        {sAtt.length===0?<p style={{color:"#334155",fontSize:12,textAlign:"center",padding:"12px 0"}}>No records yet.</p>:
          sAtt.slice(0,15).map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0a1628",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#94a3b8"}}>{fmtDate(a.date)}</span>
              <Badge status={a.status}/>
            </div>
          ))
        }
      </div>
    </Modal>
  );
};

const StudentsScreen = ({user,students,attendance,isHead=false}) => {
  const [search,setSearch]=useState(""); const [selClass,setSelClass]=useState(isHead?"all":user.class);
  const [sortBy,setSortBy]=useState("name"); const [selStu,setSelStu]=useState(null); const [open,setOpen]=useState(false);
  const [genderFilter,setGenderFilter]=useState("all");
  const list=useMemo(()=>
    students.filter(s=>s.approved)
      .filter(s=>isHead?(selClass==="all"||s.class===selClass):s.class===user.class)
      .filter(s=>s.full_name.toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase()))
      .filter(s=>genderFilter==="all"||(s.gender||"").toLowerCase()===genderFilter)
      .sort((a,b)=>{
        if(sortBy==="name")return a.full_name.localeCompare(b.full_name);
        if(sortBy==="class")return a.class.localeCompare(b.class);
        if(sortBy==="gender")return (a.gender||"").localeCompare(b.gender||"");
        const ra=attRate(attendance,a.id)??-1;
        const rb=attRate(attendance,b.id)??-1;
        return rb-ra;
      })
  ,[students,selClass,search,sortBy,attendance,genderFilter]);
  const males=students.filter(s=>s.approved&&(isHead?true:s.class===user.class)&&(s.gender||"").toLowerCase()==="male").length;
  const females=students.filter(s=>s.approved&&(isHead?true:s.class===user.class)&&(s.gender||"").toLowerCase()==="female").length;
  return(
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <H children={isHead?"All Students":`${user.class} — Students`} sub={`${list.length} students · 👦 ${males} boys · 👧 ${females} girls`}/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or ID…" style={{background:"#0d1829",border:"1px solid #1e293b",borderRadius:10,padding:"9px 14px",color:"#e2e8f0",fontSize:13,outline:"none",flex:1,minWidth:160}}/>
        {isHead&&<Sel value={selClass} onChange={e=>setSelClass(e.target.value)}><option value="all">All Classes</option>{CLASSES.map(c=><option key={c}>{c}</option>)}</Sel>}
        <Sel value={genderFilter} onChange={e=>setGenderFilter(e.target.value)}>
          <option value="all">All Genders</option>
          <option value="male">👦 Boys</option>
          <option value="female">👧 Girls</option>
        </Sel>
        <Sel value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="class">Sort: Class</option>
          <option value="gender">Sort: Gender</option>
          <option value="rate">Sort: Attendance</option>
        </Sel>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {list.map(s=>{
          const r=attRate(attendance,s.id);
          const sAtt=attendance.filter(a=>a.student_id===s.id);
          return(
            <Card key={s.id} className="card-hover" onClick={()=>{setSelStu(s);setOpen(true);}} style={{cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Av label={s.full_name.slice(0,2).toUpperCase()} size={44} img={s.photo} color="#1d4ed8"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.full_name}</div>
                  <div style={{fontSize:11,color:"#38bdf8",marginTop:1}}>{s.class}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{s.id}</div>
                </div>
                <RateCircle rate={r} size={44}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 10px",fontSize:11}}>
                <span style={{color:"#334155"}}>Age</span><span style={{color:"#94a3b8"}}>{calcAge(s.dob)} yrs</span>
                <span style={{color:"#334155"}}>Gender</span><span style={{color:"#94a3b8"}}>{s.gender==="male"?"👦 Boy":s.gender==="female"?"👧 Girl":"—"}</span>
                <span style={{color:"#334155"}}>Guardian</span><span style={{color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.guardian_name}</span>
                <span style={{color:"#334155"}}>Phone</span><span style={{color:"#94a3b8"}}>{s.guardian_phone}</span>
              </div>
              {sAtt.length>0&&<div style={{marginTop:10}}><MiniBar present={sAtt.filter(a=>a.status==="present").length} late={sAtt.filter(a=>a.status==="late").length} absent={sAtt.filter(a=>a.status==="absent").length} total={sAtt.length} height={14}/></div>}
            </Card>
          );
        })}
        {list.length===0&&<p style={{color:"#334155",gridColumn:"1/-1",textAlign:"center",padding:"32px 0"}}>No students found.</p>}
      </div>
      <StudentModal student={selStu} attendance={attendance} open={open} onClose={()=>setOpen(false)}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADD STUDENT
// ═══════════════════════════════════════════════════════════════
const AddStudentScreen = ({user,requests,setRequests,setActLog}) => {
  const [form,setForm]=useState({full_name:"",dob:"",guardian_name:"",guardian_phone:"",photo:null});
  const [preview,setPreview]=useState(null);
  const [errors,setErrors]=useState({});
  const {toast,show,hide}=useToast();
  const fileRef=useRef();
  const setF=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const handlePhoto=e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>5*1024*1024){show("Photo must be under 5MB","error");return;}
    const r=new FileReader();r.onload=ev=>{setF("photo",ev.target.result);setPreview(ev.target.result);};r.readAsDataURL(file);
  };
  const validate=()=>{
    const e={};
    if(!form.full_name.trim())e.full_name="Required";
    if(!form.dob)e.dob="Required";
    if(!form.guardian_name.trim())e.guardian_name="Required";
    if(!form.guardian_phone.trim())e.guardian_phone="Required";
    else if(!/^\+?\d{8,15}$/.test(form.guardian_phone.replace(/\s/g,"")))e.guardian_phone="Invalid phone number";
    setErrors(e);return Object.keys(e).length===0;
  };
  const submit=()=>{
    if(!validate())return;
    const req={id:uid(),...form,class:user.class,teacher:user.name,teacher_id:user.id,status:"pending",created:new Date().toISOString()};
    setRequests(prev=>[...prev,req]);
    setActLog(prev=>[...prev,{id:uid(),type:"request",desc:`${user.name} requested to add ${form.full_name} to ${user.class}`,time:new Date().toISOString(),user:user.name}]);
    setForm({full_name:"",dob:"",guardian_name:"",guardian_phone:"",photo:null});setPreview(null);
    show("✅ Request submitted! Awaiting Headmaster approval.","success");
  };
  const myReqs=requests.filter(r=>r.teacher_id===user.id).sort((a,b)=>b.created.localeCompare(a.created));
  const ErrMsg=({field})=>errors[field]?<span style={{fontSize:10,color:"#f87171",marginTop:2}}>{errors[field]}</span>:null;
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Add Student Request" sub="Requires Headmaster approval before the student is added"/>
      <Card style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:18}}>New Student — {user.class}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Photo Upload */}
          <div style={{display:"flex",alignItems:"center",gap:16,background:"#060d1a",borderRadius:14,padding:14,border:"1px dashed #1e293b",cursor:"pointer"}} onClick={()=>fileRef.current.click()}>
            <div style={{width:64,height:64,borderRadius:12,background:"#0d1829",border:"2px dashed #1e293b",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
              {preview?<img src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>📷</span>}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"#e2e8f0"}}>Student Photo</div>
              <div style={{fontSize:12,color:"#475569",marginTop:2}}>Tap to upload from camera or gallery (optional)</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto}/>
          </div>

          {/* Full Name */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Full Name *" value={form.full_name} onChange={e=>setF("full_name",e.target.value)} placeholder="Student's full name"/>
            <ErrMsg field="full_name"/>
          </div>

          {/* DOB + Age */}
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
              <Inp label="Date of Birth *" type="date" value={form.dob} onChange={e=>setF("dob",e.target.value)}/>
              <ErrMsg field="dob"/>
            </div>
            <div style={{background:"#060d1a",borderRadius:10,padding:"10px 16px",border:"1px solid #1e293b",textAlign:"center",minWidth:80}}>
              <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:.8}}>Age</div>
              <div style={{fontSize:20,fontWeight:800,color:"#38bdf8",fontFamily:"'Syne',sans-serif"}}>{form.dob?`${calcAge(form.dob)}`:"—"}</div>
            </div>
          </div>

          {/* Gender */}
          <Sel label="Gender *" value={form.gender||""} onChange={e=>setF("gender",e.target.value)}>
            <option value="">-- Select Gender --</option>
            <option value="male">👦 Male</option>
            <option value="female">👧 Female</option>
          </Sel>

          {/* Guardian Name */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Guardian Name *" value={form.guardian_name} onChange={e=>setF("guardian_name",e.target.value)} placeholder="Parent or guardian full name"/>
            <ErrMsg field="guardian_name"/>
          </div>

          {/* Guardian Phone */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Guardian Phone *" value={form.guardian_phone} onChange={e=>setF("guardian_phone",e.target.value)} placeholder="+20xxxxxxxxxx"/>
            <ErrMsg field="guardian_phone"/>
          </div>

          <Btn onClick={submit} size="lg" style={{width:"100%",justifyContent:"center"}}>Submit for Headmaster Approval →</Btn>
        </div>
      </Card>
      <H children="My Requests" sub={`${myReqs.length} total`}/>
      {myReqs.length===0?<Card><p style={{color:"#334155",textAlign:"center",padding:"16px 0"}}>No requests yet.</p></Card>:
        myReqs.map(r=>(
          <Card key={r.id} style={{marginBottom:12,borderLeft:`3px solid ${r.status==="pending"?"#fbbf24":r.status==="approved"?"#4ade80":"#f87171"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {r.photo&&<Av label={r.full_name.slice(0,2).toUpperCase()} size={38} img={r.photo} color="#1e3a5f"/>}
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{r.full_name}</div>
                  <div style={{fontSize:11,color:"#475569",marginTop:2}}>{r.class} · DOB: {fmtDate(r.dob)} · Age: {calcAge(r.dob)} · {r.guardian_name} · {r.guardian_phone}</div>
                  <div style={{fontSize:10,color:"#334155",marginTop:2}}>{fmtDate(r.created)}</div>
                </div>
              </div>
              <span style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:r.status==="pending"?SBG.late:r.status==="approved"?SBG.present:SBG.absent,color:r.status==="pending"?SC.late:r.status==="approved"?SC.present:SC.absent}}>
                {r.status==="pending"?"⏳ Pending":r.status==="approved"?"✅ Approved":"❌ Rejected"}
              </span>
            </div>
          </Card>
        ))
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════
const ApprovalsScreen = ({requests,setRequests,setStudents,setActLog}) => {
  const {toast,show,hide}=useToast();
  const pending=requests.filter(r=>r.status==="pending");
  const done=requests.filter(r=>r.status!=="pending").sort((a,b)=>b.created.localeCompare(a.created));
  const handle=(req,action)=>{
    setRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:action}:r));
    if(action==="approved"){
      setStudents(prev=>[...prev,{id:"S"+uid(),full_name:req.full_name,class:req.class,dob:req.dob,guardian_name:req.guardian_name,guardian_phone:req.guardian_phone,photo:req.photo||null,approved:true}]);
      setActLog(prev=>[...prev,{id:uid(),type:"approval",desc:`Headmaster approved ${req.full_name} → ${req.class}`,time:new Date().toISOString(),user:"Headmaster"}]);
      show(`✅ ${req.full_name} added to ${req.class}.`,"success");
    }else{
      setActLog(prev=>[...prev,{id:uid(),type:"rejection",desc:`Headmaster rejected request for ${req.full_name}`,time:new Date().toISOString(),user:"Headmaster"}]);
      show("Request rejected.","error");
    }
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Student Approvals" sub={`${pending.length} pending · ${done.length} processed`}/>
      {pending.length===0?<Card style={{marginBottom:16,textAlign:"center"}}><p style={{color:"#475569",padding:"20px 0"}}>✅ No pending requests right now.</p></Card>:
        pending.map(r=>(
          <Card key={r.id} style={{marginBottom:16,borderLeft:"3px solid #fbbf24"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:60,height:60,borderRadius:12,overflow:"hidden",background:"#1e293b",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {r.photo?<img src={r.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>👤</span>}
                </div>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9",marginBottom:8}}>{r.full_name}</div>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 12px",fontSize:12}}>
                    <span style={{color:"#334155"}}>Class</span><span style={{color:"#94a3b8"}}>{r.class}</span>
                    <span style={{color:"#334155"}}>DOB</span><span style={{color:"#94a3b8"}}>{fmtDate(r.dob)}</span>
                    <span style={{color:"#334155"}}>Age</span><span style={{color:"#38bdf8",fontWeight:700}}>{calcAge(r.dob)} yrs</span>
                    <span style={{color:"#334155"}}>Guardian</span><span style={{color:"#94a3b8"}}>{r.guardian_name}</span>
                    <span style={{color:"#334155"}}>Phone</span><span style={{color:"#94a3b8"}}>{r.guardian_phone}</span>
                    <span style={{color:"#334155"}}>Teacher</span><span style={{color:"#94a3b8"}}>{r.teacher}</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexDirection:"column"}}>
                <Btn variant="success" onClick={()=>handle(r,"approved")}>✅ Approve</Btn>
                <Btn variant="danger" onClick={()=>handle(r,"rejected")}>❌ Reject</Btn>
              </div>
            </div>
          </Card>
        ))
      }
      {done.length>0&&(
        <>
          <H children="Past Requests" sub=""/>
          {done.slice(0,10).map(r=>(
            <Card key={r.id} style={{marginBottom:8,opacity:.6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#94a3b8"}}>{r.full_name} — {r.class} — {r.teacher}</span>
                <span style={{fontSize:11,color:r.status==="approved"?SC.present:SC.absent,fontWeight:700}}>{r.status==="approved"?"✅ Approved":"❌ Rejected"}</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TEACHERS — Add, Assign Class, Remove
// ═══════════════════════════════════════════════════════════════
const TeachersScreen = ({students,attendance,extraTeachers,setExtraTeachers}) => {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",username:"",password:"",email:"",class:""});
  const [errors,setErrors]=useState({});
  const {toast,show,hide}=useToast();
  const setF=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const allTeachers=[...USERS.filter(u=>u.role==="teacher"),...(extraTeachers||[])];

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Required";
    if(!form.username.trim())e.username="Required";
    else if(allTeachers.find(t=>t.username===form.username))e.username="Username already taken";
    if(!form.password.trim())e.password="Required";
    else if(form.password.length<6)e.password="Min 6 characters";
    if(!form.email.trim())e.email="Required";
    setErrors(e);return Object.keys(e).length===0;
  };

  const addTeacher=()=>{
    if(!validate())return;
    const t={id:"T"+uid(),role:"teacher",name:form.name,username:form.username,password:form.password,email:form.email,class:form.class||"",avatar:form.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()};
    setExtraTeachers(prev=>[...prev,t]);
    setForm({name:"",username:"",password:"",email:"",class:""});
    setShowAdd(false);
    show(`✅ ${form.name} added as teacher!`,"success");
  };

  const assignClass=(id,cls)=>{
    setExtraTeachers(prev=>prev.map(t=>t.id===id?{...t,class:cls}:t));
    show("✅ Class assigned!","success");
  };

  const removeTeacher=(id,name)=>{
    setExtraTeachers(prev=>prev.filter(t=>t.id!==id));
    show(`${name} removed.`,"info");
  };

  const ErrMsg=({field})=>errors[field]?<span style={{fontSize:10,color:"#f87171"}}>{errors[field]}</span>:null;

  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Teachers" sub={`${allTeachers.length} registered`}/>
        <Btn onClick={()=>setShowAdd(true)} icon="&#65291;">Add Teacher</Btn>
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Teacher" width={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Full Name *" value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Teacher full name"/>
            <ErrMsg field="name"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Username *" value={form.username} onChange={e=>setF("username",e.target.value)} placeholder="Login username"/>
            <ErrMsg field="username"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Password *" type="password" value={form.password} onChange={e=>setF("password",e.target.value)} placeholder="Min 6 characters"/>
            <ErrMsg field="password"/>
          </div>
          <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:4}}>
            <Inp label="Email *" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="teacher@school.edu"/>
            <ErrMsg field="email"/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <Sel label="Assign Class (optional)" value={form.class} onChange={e=>setF("class",e.target.value)}>
              <option value="">-- No class yet --</option>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div style={{gridColumn:"1/-1",display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addTeacher}>Add Teacher</Btn>
          </div>
        </div>
      </Modal>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {allTeachers.map(t=>{
          const isExtra=!!(extraTeachers||[]).find(e=>e.id===t.id);
          const ms=students.filter(s=>s.class===t.class&&s.approved);
          const done=attendance.some(a=>a.class===t.class&&a.date===today());
          const totalDays=[...new Set(attendance.filter(a=>a.class===t.class).map(a=>a.date))].length;
          return(
            <Card key={t.id} className="card-hover">
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <Av label={t.avatar} color="#34d399" size={50}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#e2e8f0"}}>{t.name}</div>
                  <RolePill role={t.role}/>
                  <div style={{fontSize:11,color:"#475569",marginTop:3}}>@{t.username}</div>
                </div>
                {isExtra&&<span style={{fontSize:9,color:"#38bdf8",background:"rgba(56,189,248,.1)",padding:"2px 8px",borderRadius:99,fontWeight:700}}>NEW</span>}
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:600,color:"#475569",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Assigned Class</label>
                {isExtra?(
                  <select value={t.class||""} onChange={e=>assignClass(t.id,e.target.value)}
                    style={{width:"100%",background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"8px 12px",color:"#e2e8f0",fontSize:13,outline:"none"}}>
                    <option value="">-- Unassigned --</option>
                    {CLASSES.map(c=><option key={c}>{c}</option>)}
                  </select>
                ):(
                  <div style={{background:"#060d1a",borderRadius:10,padding:"8px 12px",fontSize:13,color:"#38bdf8",fontWeight:600}}>{t.class||"Unassigned"}</div>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:isExtra?12:0}}>
                {[["Students",ms.length,"#38bdf8"],["Days",totalDays,"#94a3b8"],["Today",done?"✓":"—",done?"#4ade80":"#475569"]].map(([lb,v,c])=>(
                  <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
                    <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{lb}</div>
                  </div>
                ))}
              </div>
              {isExtra&&<Btn variant="danger" size="sm" onClick={()=>removeTeacher(t.id,t.name)} style={{width:"100%"}}>Remove Teacher</Btn>}
            </Card>
          );
        })}
        {allTeachers.length===0&&<Card><p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No teachers yet.</p></Card>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════════════════════
const ClassesScreen = ({students,attendance}) => (
  <div className="fu">
    <H children="Class Management" sub="Overview of all classes"/>
    {CLASSES.map(cls=>{
      const cs=students.filter(s=>s.class===cls&&s.approved);
      const teacher=USERS.find(u=>u.class===cls);
      const ca=attendance.filter(a=>a.class===cls);
      const todayAtt=ca.filter(a=>a.date===today());
      const days=[...new Set(ca.map(a=>a.date))].length;
      const p=ca.filter(a=>a.status==="present").length;
      const l=ca.filter(a=>a.status==="late").length;
      const ab=ca.filter(a=>a.status==="absent").length;
      const avgRate=cs.length&&days?Math.round(((p+l)/(cs.length*days))*100):0;
      const todayP=todayAtt.filter(a=>a.status==="present").length;
      const todayL=todayAtt.filter(a=>a.status==="late").length;
      const todayAb=todayAtt.filter(a=>a.status==="absent").length;
      return(
        <Card key={cls} style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f1f5f9"}}>{cls}</div>
              <div style={{fontSize:12,color:"#475569",marginTop:3}}>Teacher: <span style={{color:"#34d399",fontWeight:600}}>{teacher?.name||"Unassigned"}</span></div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,padding:"4px 12px",borderRadius:99,fontWeight:700,background:todayAtt.length>0?SBG.present:SBG.late,color:todayAtt.length>0?SC.present:SC.late}}>{todayAtt.length>0?"✅ Done Today":"⏳ Pending"}</span>
              <RateCircle rate={avgRate} size={44}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[["👥","Students",cs.length,"#38bdf8"],["📅","Days Rec.",days,"#94a3b8"],["📊","Avg Rate",`${avgRate}%`,avgRate>=80?"#4ade80":avgRate>=60?"#fbbf24":"#f87171"],["🟢","Present Today",todayP,"#4ade80"]].map(([ic,lb,v,c])=>(
              <div key={lb} style={{background:"#060d1a",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{ic}</div>
                <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div>
                <div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:.4,marginTop:2}}>{lb}</div>
              </div>
            ))}
          </div>
          {todayAtt.length>0&&<><MiniBar present={todayP} late={todayL} absent={todayAb} total={todayAtt.length} height={20}/><div style={{display:"flex",gap:14,marginTop:8,fontSize:11}}><span style={{color:SC.present}}>✅ {todayP}</span><span style={{color:SC.late}}>🟡 {todayL}</span><span style={{color:SC.absent}}>❌ {todayAb}</span></div></>}
        </Card>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════════
const ChatScreen = ({user,messages,setMessages,extraTeachers}) => {
  const [input,setInput]=useState(""); const [selId,setSelId]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const endRef=useRef();
  const allUsers=[...USERS,...(extraTeachers||[]).filter(t=>!USERS.find(u=>u.id===t.id))];
  const partners=allUsers.filter(u=>{
    if(u.id===user.id)return false;
    if(user.role==="director")return u.role==="headmaster";
    if(user.role==="headmaster")return u.role==="director"||u.role==="teacher";
    if(user.role==="teacher")return u.role==="headmaster";
    return false;
  });
  useEffect(()=>{if(partners.length>0&&!selId)setSelId(partners[0].id);},[]);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[messages,selId]);
  const selUser=allUsers.find(u=>u.id===selId);
  const thread=selId?messages.filter(m=>(m.from===user.id&&m.to===selId)||(m.from===selId&&m.to===user.id)).sort((a,b)=>a.time.localeCompare(b.time)):[];
  const unread=id=>messages.filter(m=>m.from===id&&m.to===user.id&&!m.read).length;
  const send=()=>{
    if(!input.trim()||!selId)return;
    setMessages(prev=>[...prev,{id:uid(),from:user.id,to:selId,text:input.trim(),time:new Date().toISOString(),read:false}]);
    setInput("");
  };
  return(
    <div style={{display:"flex",height:"calc(100vh - 80px)",gap:0,position:"relative"}}>
      {/* Collapsible Contacts Sidebar */}
      <div style={{width:sidebarOpen?200:0,minWidth:0,background:"#040810",borderRadius:sidebarOpen?"14px 0 0 14px":0,border:sidebarOpen?"1px solid #0f2040":"none",overflow:"hidden",display:"flex",flexDirection:"column",flexShrink:0,transition:"width .25s ease",position:"relative"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #0a1628",fontSize:10,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>Conversations</div>
        {partners.map(p=>{
          const u=unread(p.id); const active=selId===p.id;
          return(
            <button key={p.id} onClick={()=>{setSelId(p.id);setSidebarOpen(false);}}
              style={{width:"100%",padding:"11px 12px",border:"none",background:active?"#0d1829":"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left",borderLeft:`2px solid ${active?RC[p.role]:"transparent"}`,transition:"all .15s"}}>
              <Av label={p.avatar} color={RC[p.role]} size={34}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name.split(" ").slice(1).join(" ")||p.name}</div>
                <div style={{fontSize:9,color:RC[p.role],textTransform:"capitalize",fontWeight:700,marginTop:1}}>{p.role}</div>
              </div>
              {u>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:99,fontSize:9,fontWeight:800,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{u}</span>}
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#0d1829",borderRadius:sidebarOpen?"0 14px 14px 0":"14px",border:"1px solid #0f2040",overflow:"hidden",minWidth:0,borderLeft:sidebarOpen?"none":"1px solid #0f2040"}}>
        {/* Header with toggle arrow */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid #0a1628",display:"flex",alignItems:"center",gap:10}}>
          {/* Bold arrow button */}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)}
            style={{background:"#0ea5e9",border:"none",color:"#fff",width:36,height:36,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,flexShrink:0,boxShadow:"0 2px 8px rgba(14,165,233,.4)"}}>
            {sidebarOpen?"◀":"▶"}
          </button>
          {selUser?(
            <>
              <Av label={selUser.avatar} color={RC[selUser.role]} size={34}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{selUser.name}</div>
                <RolePill role={selUser.role}/>
              </div>
              {user.role==="director"&&<span style={{fontSize:9,color:"#334155",background:"#060d1a",padding:"3px 8px",borderRadius:99,border:"1px solid #0f2040"}}>🔒 Director ↔ HM</span>}
            </>
          ):(
            <div style={{color:"#475569",fontSize:13,flex:1}}>
              {sidebarOpen?"Select a conversation":"Tap ▶ to see contacts"}
            </div>
          )}
        </div>

        {selUser?(
          <>
            <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
              {thread.length===0&&<p style={{color:"#334155",textAlign:"center",marginTop:60,fontSize:13}}>Start the conversation…</p>}
              {thread.map(m=>{
                const mine=m.from===user.id;
                const sender=allUsers.find(u=>u.id===m.from);
                return(
                  <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                    {!mine&&<Av label={sender?.avatar||"?"} color={RC[sender?.role||"teacher"]} size={26}/>}
                    <div style={{maxWidth:"75%",padding:"9px 14px",borderRadius:mine?"16px 16px 4px 16px":"16px 16px 16px 4px",background:mine?"linear-gradient(135deg,#0ea5e9,#0369a1)":"#1e293b",color:"#f1f5f9",fontSize:13,lineHeight:1.5,wordBreak:"break-word"}}>
                      <div>{m.text}</div>
                      <div style={{fontSize:9,color:mine?"rgba(255,255,255,.5)":"#475569",marginTop:4,textAlign:"right"}}>{fmtTime(m.time)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>
            <div style={{padding:"10px 14px",borderTop:"1px solid #0a1628",display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder={`Type message to ${selUser.name.split(" ")[0]}…`}
                style={{flex:1,background:"#060d1a",border:"1px solid #1e293b",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14,outline:"none"}}/>
              <Btn onClick={send} disabled={!input.trim()} style={{padding:"11px 18px"}}>Send</Btn>
            </div>
          </>
        ):(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:1,flexDirection:"column",gap:12,color:"#334155"}}>
            <div style={{fontSize:32}}>💬</div>
            <div style={{fontSize:14}}>Tap <strong style={{color:"#0ea5e9"}}>▶</strong> to open contacts</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════
const AnnouncementsScreen = ({user,announcements,setAnnouncements}) => {
  const [title,setTitle]=useState(""); const [body,setBody]=useState("");
  const {toast,show,hide}=useToast();
  const canPost=user.role==="headmaster";
  const post=()=>{
    if(!title.trim()||!body.trim()){show("Please fill both fields.","warning");return;}
    setAnnouncements(prev=>[...prev,{id:uid(),title,body,author:user.name,time:new Date().toISOString()}]);
    setTitle("");setBody("");show("📢 Announcement posted to all teachers!","success");
  };
  return(
    <div className="fu">
      <Toast {...toast} onClose={hide}/>
      <H children="Announcements" sub={canPost?"Post school-wide notices":"Notices from the Headmaster"}/>
      {canPost&&(
        <Card style={{marginBottom:22}}>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📢 New Announcement</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Inp label="Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title"/>
            <Textarea label="Message" value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your announcement…" rows={4}/>
            <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={post} icon="📢">Post Announcement</Btn></div>
          </div>
        </Card>
      )}
      {[...announcements].reverse().map(a=>(
        <Card key={a.id} style={{marginBottom:14,borderLeft:"3px solid #38bdf8"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:6}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9"}}>{a.title}</div>
            <div style={{fontSize:11,color:"#334155"}}>{a.author} · {fmtDate(a.time)} {fmtTime(a.time)}</div>
          </div>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.7}}>{a.body}</p>
        </Card>
      ))}
      {announcements.length===0&&<Card><p style={{color:"#334155",textAlign:"center",padding:"16px 0"}}>No announcements yet.</p></Card>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REPORTS — full suite
// ═══════════════════════════════════════════════════════════════
const ReportsScreen = ({students,attendance,smsLog,actLog}) => {
  const [tab,setTab]=useState("overview");
  const approved=useMemo(()=>students.filter(s=>s.approved),[students]);
  const printReport=()=>window.print();
  const exportCSV=()=>{
    const rows=[["Student","Class","ID","Guardian","Phone","Present","Late","Absent","Rate%"]];
    approved.forEach(s=>{
      const sA=attendance.filter(a=>a.student_id===s.id);
      const p=sA.filter(a=>a.status==="present").length;
      const l=sA.filter(a=>a.status==="late").length;
      const ab=sA.filter(a=>a.status==="absent").length;
      const r=sA.length?Math.round(((p+l)/sA.length)*100):0;
      rows.push([s.full_name,s.class,s.id,s.guardian_name,s.guardian_phone,p,l,ab,r]);
    });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="SHDCR_Report.csv";a.click();
  };
  const allDays=[...new Set(attendance.map(a=>a.date))].sort((a,b)=>b.localeCompare(a));
  return(
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <H children="Reports & Analytics" sub="Comprehensive school data"/>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm" onClick={printReport} icon="🖨️">Print</Btn>
          <Btn variant="teal" size="sm" onClick={exportCSV} icon="📥">Export CSV</Btn>
        </div>
      </div>
      <TabBar tabs={[["overview","Overview","📊"],["class","By Class","🏫"],["sms","SMS Log","📲"],["activity","Activity","📋"]]} active={tab} onChange={setTab}/>

      {tab==="overview"&&(
        <div>
          <StatGrid stats={[
            {icon:"👥",label:"Total Students",value:approved.length},
            {icon:"📅",label:"Days Recorded",value:allDays.length},
            {icon:"🟢",label:"Total Present",value:attendance.filter(a=>a.status==="present").length,color:"#4ade80"},
            {icon:"🟡",label:"Total Late",value:attendance.filter(a=>a.status==="late").length,color:"#fbbf24"},
            {icon:"🔴",label:"Total Absent",value:attendance.filter(a=>a.status==="absent").length,color:"#f87171"},
            {icon:"📲",label:"SMS Sent",value:smsLog.length,color:"#38bdf8"},
          ]}/>
          <Card>
            <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>Student Attendance Rates (Present + Late ÷ Total)</div>
            {approved.map(s=>{
              const sA=attendance.filter(a=>a.student_id===s.id);
              const p=sA.filter(a=>a.status==="present").length;
              const l=sA.filter(a=>a.status==="late").length;
              const ab=sA.filter(a=>a.status==="absent").length;
              const r=sA.length?Math.round(((p+l)/sA.length)*100):null;
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #0a1628",gap:10,flexWrap:"wrap"}}>
                  <Av label={s.full_name.slice(0,2).toUpperCase()} size={30} img={s.photo} color="#1e3a5f"/>
                  <div style={{minWidth:160,flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#e2e8f0"}}>{s.full_name}</div>
                    <div style={{fontSize:10,color:"#475569"}}>{s.class}</div>
                  </div>
                  <div style={{display:"flex",gap:10,fontSize:11,alignItems:"center",flex:2,minWidth:200}}>
                    <span style={{color:SC.present,width:36}}>P:{p}</span>
                    <span style={{color:SC.late,width:36}}>L:{l}</span>
                    <span style={{color:SC.absent,width:36}}>A:{ab}</span>
                    <div style={{flex:1}}><MiniBar present={p} late={l} absent={ab} total={sA.length||1} height={14}/></div>
                    <RateCircle rate={r} size={38}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {tab==="class"&&(
        <div>
          {CLASSES.map(cls=>{
            const cs=approved.filter(s=>s.class===cls);
            const ca=attendance.filter(a=>a.class===cls);
            const days=[...new Set(ca.map(a=>a.date))];
            const p=ca.filter(a=>a.status==="present").length;
            const l=ca.filter(a=>a.status==="late").length;
            const ab=ca.filter(a=>a.status==="absent").length;
            const rate=cs.length&&days.length?Math.round(((p+l)/(cs.length*days.length))*100):0;
            return(
              <Card key={cls} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#f1f5f9"}}>{cls}</div>
                  <div style={{display:"flex",gap:12,fontSize:12,alignItems:"center"}}>
                    <span style={{color:SC.present}}>✅ {p}</span><span style={{color:SC.late}}>🟡 {l}</span><span style={{color:SC.absent}}>❌ {ab}</span>
                    <RateCircle rate={rate} size={40}/>
                  </div>
                </div>
                <MiniBar present={p} late={l} absent={ab} total={p+l+ab||1} height={20}/>
                <div style={{marginTop:14}}>
                  {cs.map(s=>{
                    const sA=ca.filter(a=>a.student_id===s.id);
                    const sp=sA.filter(a=>a.status==="present").length;
                    const sl=sA.filter(a=>a.status==="late").length;
                    const sr=sA.length?Math.round(((sp+sl)/sA.length)*100):null;
                    return(
                      <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0a1628",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><Av label={s.full_name.slice(0,2).toUpperCase()} size={26} img={s.photo} color="#1e3a5f"/><span style={{fontSize:13}}>{s.full_name}</span></div>
                        <div style={{display:"flex",gap:8,fontSize:11,alignItems:"center"}}>
                          <span style={{color:SC.present}}>{sp}P</span><span style={{color:SC.late}}>{sl}L</span><span style={{color:SC.absent}}>{sA.filter(a=>a.status==="absent").length}A</span>
                          <RateCircle rate={sr} size={34}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab==="sms"&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📲 Guardian SMS Log — {smsLog.length} sent</div>
          {smsLog.length===0?<p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No SMS sent yet.</p>:
            [...smsLog].reverse().map(s=>(
              <div key={s.id} style={{padding:"12px 0",borderBottom:"1px solid #0a1628"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,flexWrap:"wrap",gap:6,alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{s.student}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge status={s.status}/><span style={{fontSize:10,color:"#334155"}}>{fmtDate(s.time)} {fmtTime(s.time)}</span></div>
                </div>
                <div style={{fontSize:11,color:"#475569",marginBottom:5}}>📞 {s.guardian} · {s.phone}</div>
                <div style={{fontSize:12,color:"#94a3b8",background:"#060d1a",border:"1px solid #0f2040",borderRadius:8,padding:"8px 12px",fontStyle:"italic"}}>"{s.message}"</div>
              </div>
            ))
          }
        </Card>
      )}

      {tab==="activity"&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>📋 Activity Log</div>
          {actLog.length===0?<p style={{color:"#334155",textAlign:"center",padding:"20px 0"}}>No activity yet.</p>:
            [...actLog].reverse().map(a=>(
              <div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid #0a1628",display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:18,marginTop:1}}>{a.type==="attendance"?"✓":a.type==="approval"?"✅":a.type==="rejection"?"❌":"📝"}</span>
                <div><div style={{fontSize:13,color:"#94a3b8"}}>{a.desc}</div><div style={{fontSize:10,color:"#334155",marginTop:3}}>{fmtDate(a.time)} {fmtTime(a.time)} · {a.user}</div></div>
              </div>
            ))
          }
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [students,setStudents]=useStore("shdcr3_students",SEED_STUDENTS);
  const [attendance,setAttendance]=useStore("shdcr3_attendance",[]);
  const [requests,setRequests]=useStore("shdcr3_requests",[]);
  const [messages,setMessages]=useStore("shdcr3_messages",[]);
  const [announcements,setAnnouncements]=useStore("shdcr3_announcements",[]);
  const [smsLog,setSmsLog]=useStore("shdcr3_sms",[]);
  const [actLog,setActLog]=useStore("shdcr3_actlog",[]);
  const [extraTeachers,setExtraTeachers]=useStore("shdcr3_teachers",[]);
  const allTeachers=[...USERS.filter(u=>u.role==="teacher"),...extraTeachers];
  const pending=requests.filter(r=>r.status==="pending").length;
  if(!user){
    const allUsers=[...USERS,...extraTeachers];
    return<><GS/><Login onLogin={u=>{setUser(u);setScreen("dashboard");}} allUsers={allUsers}/></>;
  }
  const SW=collapsed?64:220;
  const sp={user,students,setStudents,attendance,setAttendance,requests,setRequests,messages,setMessages,announcements,setAnnouncements,smsLog,setSmsLog,actLog,setActLog,extraTeachers,setExtraTeachers};
  const renderScreen=()=>{
    const r=user.role;
    switch(screen){
      case"dashboard":    return r==="teacher"?<TeacherDash {...sp} setScreen={setScreen}/>:r==="headmaster"?<HeadDash {...sp} setScreen={setScreen}/>:<DirectorDash {...sp}/>;
      case"attendance":   return<AttendanceScreen {...sp} isHead={r==="headmaster"}/>;
      case"att-history":  return<AttHistoryScreen {...sp} isHead={r==="headmaster"}/>;
      case"my-students":  return<StudentsScreen {...sp} isHead={false}/>;
      case"students":     return<StudentsScreen {...sp} isHead={true}/>;
      case"add-student":  return<AddStudentScreen {...sp}/>;
      case"approvals":    return<ApprovalsScreen {...sp}/>;
      case"teachers":     return<TeachersScreen {...sp} extraTeachers={extraTeachers} setExtraTeachers={setExtraTeachers}/>;
      case"classes":      return<ClassesScreen {...sp}/>;
      case"chat":         return<ChatScreen {...sp} extraTeachers={extraTeachers}/>;
      case"announcements":return<AnnouncementsScreen {...sp}/>;
      case"reports":      return<ReportsScreen {...sp}/>;
      default:return null;
    }
  };
  return(
    <><GS/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar user={user} screen={screen} setScreen={setScreen} pendingCount={pending} onLogout={()=>{setUser(null);setScreen("dashboard");}} collapsed={collapsed} setCollapsed={setCollapsed}/>
        <main style={{marginLeft:SW,flex:1,padding:"26px 24px",maxWidth:"100%",overflowX:"hidden",minHeight:"100vh",transition:"margin-left .25s cubic-bezier(.4,0,.2,1)"}}>
          {renderScreen()}
        </main>
      </div>
    </>
  );
}
