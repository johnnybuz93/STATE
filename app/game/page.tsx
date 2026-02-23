'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlobeSettingsProvider, useGlobeSettings } from '@/contexts/GlobeSettingsContext';

const GlobeCanvas = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => <div style={{width:'100%',height:'100%',background:'#04060c'}} />,
});

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Agent { name:string; emoji:string; role?:string; spec?:string; loyalty:string; thought:string; onMission?:{type:string;target:string}|null; avatar?:string; }
interface Country { name:string; influence:number; stability:number; gdp:string; status:string; flag:string; }
interface CrisisChoice { label:string; type?:string; mil?:number; eco?:number; sft?:number; cap?:number; esp?:number; nar?:number; }
interface Crisis { label:string; title:string; sub:string; text:string; choices:CrisisChoice[]; }
interface ChronicleEntry { epoch:number; headline:string; sub:string; text:string; type:string; }
interface Evt { text:string; type:string; t:string; }

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const EPOCH_NAMES = ['Dawn of Power','The Shadow Wars','The Great Game','Iron Curtain','Final Dominion'];
const THOUGHTS = [
  "Three ministers met without me. I am watching.",
  "The opposition gains ground. We must act now.",
  "Our propaganda is working. The youth believe us.",
  "Someone in this cabinet is not who they claim to be.",
  "The people grow restless. History won't forgive hesitation.",
  "I am loyal. But loyalty has a price.",
  "Two of our agents have gone dark in the east.",
  "I've located an asset we can leverage immediately.",
  "The numbers suggest we're three moves from collapse.",
  "They underestimate us. Good.",
];
const DEBATES = [
  ["Viktor Hale","Sofia Reyes","We must respond to China's military buildup immediately.","And start a war? Diplomacy costs less than funerals, Viktor."],
  ["Chen Wei","Lena Marsh","The economic report is worse than we disclosed.","Then we change the narrative. That's my job."],
  ["Dmitri Volkov","Viktor Hale","I've identified a foreign agent inside our infrastructure.","Finally. I suspected it for two epochs."],
  ["Sofia Reyes","Chen Wei","Brazil signals interest in an alliance.","Their GDP is unstable. Wait for better terms."],
  ["Lena Marsh","Dmitri Volkov","The media offensive is working. Approval up twelve points.","Don't trust polls. Trust what agents see on the ground."],
  ["Viktor Hale","Chen Wei","We need to double the military budget.","We're already running a deficit. Absolutely not."],
];
const CINEMATIC_CRISES: Crisis[] = [
  { label:'☢ Nuclear Alert', title:'NUCLEAR STANDOFF', sub:'Missiles Detected', text:'Satellite imagery confirms three ICBM launches from an undisclosed location. NATO forces at DEFCON 2. All eyes on your response.', choices:[{label:'Diplomatic Hotline',type:'primary',mil:0,eco:-80,sft:20,cap:-100},{label:'Military Response',mil:25,eco:-200,sft:-15,cap:-300},{label:'Evacuate & Wait',mil:-10,eco:-50,sft:-20,cap:-50}]},
  { label:'🌊 Climate Collapse', title:'COASTAL CATASTROPHE', sub:'Global Crisis', text:'Six coastal megacities report catastrophic flooding. 40 million displaced. UN requests emergency aid. Your response will define your legacy.', choices:[{label:'Emergency Aid',type:'primary',mil:0,eco:-150,sft:40,cap:-200},{label:'Secure Borders',mil:15,eco:0,sft:-30,cap:0},{label:'Ignore & Profit',mil:0,eco:80,sft:-50,cap:200}]},
  { label:'💻 Cyber Attack', title:'GRID OFFLINE', sub:'Infrastructure Failure', text:'A coordinated cyber attack has taken down power grids across 12 nations. Banks frozen. Hospitals on backup. The source: unknown.', choices:[{label:'Launch Counter-Attack',type:'primary',mil:0,eco:-100,esp:30,cap:-150},{label:'Negotiate Quietly',mil:0,eco:-50,sft:10,cap:-80},{label:'Blame a Rival',mil:10,eco:0,nar:20,cap:0}]},
  { label:'💀 Assassination Plot', title:'THREAT CONFIRMED', sub:'Your Life In Danger', text:'Intelligence has uncovered a credible plot against your life originating from within your own government. The suspect list has three names. All are ministers.', choices:[{label:'Purge the Cabinet',type:'primary',mil:10,eco:-50,sft:-20,cap:-100},{label:'Set a Trap',mil:0,eco:0,esp:40,cap:-50},{label:'Flee the Country',mil:-30,eco:-100,sft:-50,cap:0}]},
];
const INITIAL_CABINET: Agent[] = [
  {name:"Viktor Hale",role:"Min. of Defense",emoji:"🎖",loyalty:"loyal",thought:"We must show strength before they doubt us."},
  {name:"Lena Marsh",role:"Min. of Narrative",emoji:"📡",loyalty:"loyal",thought:"Control the story, control the world."},
  {name:"Dmitri Volkov",role:"Chief of Intelligence",emoji:"🕵",loyalty:"suspicious",thought:"I've seen what happens to failed presidents."},
  {name:"Chen Wei",role:"Min. of Economy",emoji:"💹",loyalty:"neutral",thought:"The numbers never lie. People always do."},
  {name:"Sofia Reyes",role:"Foreign Affairs",emoji:"🌐",loyalty:"loyal",thought:"Every war is a failed negotiation."},
];
const INITIAL_COUNTRIES: Country[] = [
  {name:"Russia",influence:12,stability:72,gdp:"$1.7T",status:"Hostile",flag:"🇷🇺"},
  {name:"China",influence:8,stability:85,gdp:"$17T",status:"Rival",flag:"🇨🇳"},
  {name:"Germany",influence:34,stability:91,gdp:"$4.2T",status:"Neutral",flag:"🇩🇪"},
  {name:"Brazil",influence:22,stability:58,gdp:"$2.1T",status:"Neutral",flag:"🇧🇷"},
  {name:"India",influence:15,stability:68,gdp:"$3.3T",status:"Neutral",flag:"🇮🇳"},
  {name:"United Kingdom",influence:55,stability:88,gdp:"$3.1T",status:"Allied",flag:"🇬🇧"},
  {name:"France",influence:48,stability:82,gdp:"$2.9T",status:"Allied",flag:"🇫🇷"},
  {name:"Japan",influence:41,stability:94,gdp:"$4.4T",status:"Allied",flag:"🇯🇵"},
  {name:"Saudi Arabia",influence:29,stability:65,gdp:"$0.9T",status:"Neutral",flag:"🇸🇦"},
  {name:"Turkey",influence:18,stability:55,gdp:"$0.8T",status:"Neutral",flag:"🇹🇷"},
  {name:"Mexico",influence:31,stability:60,gdp:"$1.3T",status:"Neutral",flag:"🇲🇽"},
  {name:"Canada",influence:70,stability:96,gdp:"$2.1T",status:"Allied",flag:"🇨🇦"},
];
const MOCK_PLAYERS = [{name:"StarikVlad",nation:"Russia",status:"online"},{name:"DragonWei",nation:"China",status:"online"},{name:"MacroGhost",nation:"France",status:"away"},{name:"NipponShadow",nation:"Japan",status:"online"}];
const REGIONS = [
  {name:'Capital',color:'rgba(184,150,62,0.12)',style:{left:'35%',top:'20%',width:'30%',height:'22%'}},
  {name:'North',color:'rgba(26,74,122,0.1)',style:{left:'20%',top:'4%',width:'60%',height:'18%'}},
  {name:'Industrial Zone',color:'rgba(231,76,60,0.07)',style:{left:'4%',top:'28%',width:'26%',height:'30%'}},
  {name:'Farmlands',color:'rgba(39,174,96,0.07)',style:{left:'70%',top:'26%',width:'26%',height:'30%'}},
  {name:'Coast',color:'rgba(41,128,185,0.09)',style:{left:'10%',top:'62%',width:'80%',height:'16%'}},
];

// ── STYLE TOKENS ───────────────────────────────────────────────────────────
const C = {
  gold:'#b8963e', gold2:'#d4ae5a', gold3:'#f0cc80',
  red:'#c0392b', red2:'#e74c3c', green:'#1a7a4a', green2:'#27ae60',
  blue2:'#2980b9', purple2:'#9b59b6',
  bg:'#04060c', bg2:'#070a12', card:'rgba(7,10,18,0.98)',
  border:'rgba(184,150,62,0.2)', border2:'rgba(184,150,62,0.08)', border3:'rgba(255,255,255,0.05)',
  text:'#c4beb0', text2:'#5e5a52', text3:'#8a8478',
  ff:"'Cinzel',serif", ffm:"'Share Tech Mono',monospace", ffb:"'Rajdhani',sans-serif",
};
const PANEL_W = 360;

// ── GLOBE WRAPPER ──────────────────────────────────────────────────────────
function GlobeArea({ opacity }: { opacity: number }) {
  const settings = useGlobeSettings();
  return (
    <div style={{position:'absolute',inset:0,opacity,transition:'opacity 0.3s',pointerEvents:'none'}}>
      <div style={{width:'100%',height:'100%',pointerEvents:'auto'}}>
        <GlobeCanvas {...settings} />
      </div>
    </div>
  );
}

// ── MAIN GAME COMPONENT ────────────────────────────────────────────────────
function GameContent() {
  const router = useRouter();
  const [screen, setScreen] = useState<'create'|'game'|'cinematic'|'vote'|'chronicle'>('create');
  const [username, setUsername] = useState('COMMANDER');
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('ops');
  const [currentLayer, setCurrentLayer] = useState(1);

  // Stats
  const [capital, setCapital] = useState(1200);
  const [influence, setInfluence] = useState(0);
  const [nationsOwned, setNationsOwned] = useState(1);
  const [softPower, setSoftPower] = useState(24);
  const [military, setMilitary] = useState(45);
  const [economic, setEconomic] = useState(62);
  const [narrative, setNarrative] = useState(28);
  const [espionage, setEspionage] = useState(17);
  const [epoch, setEpoch] = useState(1);
  const [epochPct, setEpochPct] = useState(0);

  // Game data
  const [cabinet, setCabinet] = useState<Agent[]>(INITIAL_CABINET);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [countries, setCountries] = useState<Country[]>(INITIAL_COUNTRIES);
  const [targetCountry, setTargetCountry] = useState<Country|null>(null);
  const [events, setEvents] = useState<Evt[]>([]);
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([]);
  const [wars, setWars] = useState<string[]>([]);

  // Government room
  const [activeBubble, setActiveBubble] = useState<{idx:number;text:string}|null>(null);
  const [govMessages, setGovMessages] = useState<{speaker:string;text:string}[]>([]);
  const [speakingIdx, setSpeakingIdx] = useState<number>(-1);
  const debateRef = useRef(0);
  const chatPhaseRef = useRef(0);

  // Cinematic
  const [activeCrisis, setActiveCrisis] = useState<Crisis|null>(null);
  const [crisisTimer, setCrisisTimer] = useState(60);
  const crisisIntervalRef = useRef<any>(null);

  // Vote
  const [voteCards, setVoteCards] = useState<{agent:Agent;vote:string;revealed:boolean}[]>([]);
  const [voteResult, setVoteResult] = useState<{title:string;sub:string;show:boolean}|null>(null);
  const [voteReason, setVoteReason] = useState('');

  // Toast
  const [toast, setToast] = useState('');
  const toastRef = useRef<any>(null);

  // Epoch loop
  const epochTimerRef = useRef(0);
  const gameStartedRef = useRef(false);
  const epochRef = useRef(1);

  useEffect(() => { epochRef.current = epoch; }, [epoch]);

  // President creation state
  const [presName, setPresName] = useState('');
  const [presCode, setPresCode] = useState('');
  const [presNation, setPresNation] = useState('');
  const [presBg, setPresBg] = useState('mil');
  const [presTraits, setPresTraits] = useState<string[]>([]);
  const [sl1, setSl1] = useState(50);
  const [sl2, setSl2] = useState(40);
  const [sl3, setSl3] = useState(60);

  useEffect(() => {
    const saved = localStorage.getItem('digital_state_username');
    if (saved) setUsername(saved);
    // Always show create screen first
  }, []);

  // Gov room chat
  useEffect(() => {
    if (currentLayer !== 3) return;
    const interval = setInterval(() => {
      const deb = DEBATES[debateRef.current % DEBATES.length];
      const speaker = chatPhaseRef.current % 2 === 0 ? deb[0] : deb[1];
      const line = chatPhaseRef.current % 2 === 0 ? deb[2] : deb[3];
      const idx = INITIAL_CABINET.findIndex(a => a.name === speaker);
      setSpeakingIdx(idx);
      setActiveBubble({idx, text: line});
      setGovMessages(prev => [{speaker, text: line}, ...prev].slice(0, 3));
      setTimeout(() => setActiveBubble(null), 3500);
      chatPhaseRef.current++;
      if (chatPhaseRef.current >= 2) { chatPhaseRef.current = 0; debateRef.current++; }
    }, 4200);
    return () => clearInterval(interval);
  }, [currentLayer]);

  function startLoop() {
    const tick = () => {
      epochTimerRef.current++;
      const pct = (epochTimerRef.current % 600) / 600 * 100;
      setEpochPct(pct);
      if (epochTimerRef.current % 90 === 0) {
        setCapital(c => c + 75);
        setInfluence(i => Math.min(9999, i + 4));
      }
      if (epochTimerRef.current % 240 === 0) {
        setCabinet(prev => prev.map(a => ({
          ...a,
          thought: Math.random() > 0.6 ? THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)] : a.thought,
          loyalty: Math.random() < 0.04 ? (a.loyalty === 'loyal' ? 'neutral' : a.loyalty === 'neutral' ? 'suspicious' : 'neutral') : a.loyalty,
        })));
      }
      if (epochTimerRef.current % 600 === 0 && epochTimerRef.current > 0) {
        const next = Math.min(5, epochRef.current + 1);
        setEpoch(next);
        addEvt(`New epoch: ${EPOCH_NAMES[next-1]}`, '');
        addChronicle(EPOCH_NAMES[next-1], `Epoch ${next} begins.`, 'The world enters a new phase. Power shifts. Alliances strain.', '');
        if (Math.random() > 0.35) triggerCrisis();
      }
      setTimeout(tick, 33);
    };
    tick();
  }

  function addEvt(text: string, type: string) {
    const now = new Date();
    const t = `EP${epochRef.current}·${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    setEvents(prev => [{text, type, t}, ...prev].slice(0, 5));
  }

  function addChronicle(headline: string, sub: string, text: string, type: string) {
    setChronicle(prev => [...prev, {epoch: epochRef.current, headline, sub, text, type}]);
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(''), 3000);
  }

  function selectCountry(c: Country) {
    setTargetCountry(c);
    addEvt(`Target locked: ${c.name}`, c.status === 'Allied' ? 'green' : c.status === 'Hostile' ? 'red' : '');
    setActiveTab('ops');
    if (currentLayer === 2) setCurrentLayer(2);
  }

  function act(type: string) {
    if (!targetCountry) { showToast('Select a country first.'); return; }
    const costs: Record<string,number> = {spy:150, media:80, econ:200, mil:300};
    if (capital < costs[type]) { addEvt('Insufficient treasury.', 'red'); return; }
    setCapital(c => c - costs[type]);
    setCountries(prev => prev.map(c => {
      if (c.name !== targetCountry.name) return c;
      const updates: Partial<Country> = {};
      if (type === 'spy') { updates.influence = c.influence + 8; setEspionage(v => Math.min(100, v+3)); }
      if (type === 'media') { updates.influence = c.influence + 5; setNarrative(v => Math.min(100, v+4)); setSoftPower(v => v+3); }
      if (type === 'econ') { updates.influence = c.influence + 10; updates.stability = Math.max(10, c.stability - 12); setEconomic(v => Math.min(100, v+5)); }
      if (type === 'mil') { updates.influence = c.influence + 15; updates.stability = Math.max(5, c.stability - 20); setMilitary(v => Math.min(100, v+6)); }
      const updated = {...c, ...updates};
      if (updated.influence >= 75 && c.status !== 'Allied') {
        setTimeout(() => {
          setCountries(prev2 => prev2.map(x => x.name === c.name ? {...x, status:'Allied'} : x));
          setNationsOwned(n => n+1);
          setCapital(cap => cap+300);
          addEvt(`🏴 ${c.name} enters your sphere!`, 'green');
          addChronicle(`Nation Acquired`, `${c.name} pledges loyalty.`, `Through sustained pressure, ${c.name} has joined your sphere.`, 'green');
        }, 1400);
      }
      return updated;
    }));
    const msg: Record<string,string> = {spy:`Agent inserted into ${targetCountry.name}.`, media:`Propaganda wave hits ${targetCountry.name}.`, econ:`Economic pressure on ${targetCountry.name}.`, mil:`Military threat to ${targetCountry.name}.`};
    addEvt(msg[type], type === 'mil' ? 'red' : 'green');
  }

  function gact(type: string) {
    const costs: Record<string,number> = {summit:120, trade:180, hack:90, disinfo:60};
    if (capital < costs[type]) { addEvt('Insufficient treasury.', 'red'); return; }
    setCapital(c => c - costs[type]);
    if (type === 'summit') setSoftPower(v => v+12);
    if (type === 'trade') { setEconomic(v => Math.min(100, v+5)); setCapital(c => c+60); }
    if (type === 'hack') setEspionage(v => Math.min(100, v+7));
    if (type === 'disinfo') { setNarrative(v => Math.min(100, v+6)); setSoftPower(v => v+4); }
    const msg: Record<string,string> = {summit:'Diplomatic summit convened.', trade:'Trade routes seized.', hack:'Cyber offensive launched.', disinfo:'Disinformation seeded.'};
    addEvt(msg[type], 'blue');
  }

  function triggerCrisis(forced?: Crisis) {
    const crisis = forced || CINEMATIC_CRISES[Math.floor(Math.random() * CINEMATIC_CRISES.length)];
    setActiveCrisis(crisis);
    setCrisisTimer(60);
    setScreen('cinematic');
    if (crisisIntervalRef.current) clearInterval(crisisIntervalRef.current);
    crisisIntervalRef.current = setInterval(() => {
      setCrisisTimer(t => {
        if (t <= 1) { clearInterval(crisisIntervalRef.current); resolveCrisis(crisis.choices[crisis.choices.length-1], crisis); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function resolveCrisis(choice: CrisisChoice, crisis: Crisis) {
    clearInterval(crisisIntervalRef.current);
    if (choice.mil) setMilitary(v => Math.max(0, Math.min(100, v + choice.mil!)));
    if (choice.sft) setSoftPower(v => Math.max(0, v + choice.sft!));
    if (choice.esp) setEspionage(v => Math.max(0, Math.min(100, v + choice.esp!)));
    if (choice.nar) setNarrative(v => Math.max(0, Math.min(100, v + choice.nar!)));
    if (choice.cap) setCapital(v => Math.max(0, v + choice.cap!));
    addChronicle(crisis.title, `Response: ${choice.label}`, `Crisis resolved: "${choice.label}". History will judge this decision.`, 'red');
    addEvt(`Crisis resolved: ${crisis.title}. Decision: ${choice.label}`, 'red');
    setScreen('game');
  }

  function triggerVote(reason: string) {
    setVoteReason(reason);
    setVoteResult(null);
    const cards = cabinet.map(a => ({agent: a, vote: '', revealed: false}));
    setVoteCards(cards);
    setScreen('vote');
    let forCount = 0, against = 0;
    cabinet.forEach((a, i) => {
      setTimeout(() => {
        const vote = a.loyalty === 'loyal' ? 'for' : a.loyalty === 'suspicious' ? 'against' : Math.random() > 0.5 ? 'for' : 'against';
        if (vote === 'for') forCount++; else against++;
        setVoteCards(prev => prev.map((c, idx) => idx === i ? {...c, vote, revealed: true} : c));
        if (i === cabinet.length - 1) {
          setTimeout(() => {
            const win = forCount > against;
            setVoteResult({title: win ? 'You Survive' : 'You Are Removed', sub: win ? `${forCount} FOR · ${against} AGAINST` : `${against} AGAINST · ${forCount} FOR`, show: true});
            addChronicle('Confidence Vote', win ? 'You survived.' : 'Removed from power.', `The cabinet voted ${forCount}–${against}.`, win ? 'green' : 'red');
          }, 800);
        }
      }, (i+1) * 900);
    });
  }

  function startGame() {
    const name = (presName || username || 'COMMANDER').trim();
    localStorage.setItem('digital_state_username', name);
    setUsername(name);
    setScreen('game');
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      addEvt('Command channel open. The world awaits your move.', 'green');
      addEvt('Intelligence reports incoming from 3 continents.', '');
      addChronicle('Dawn of Power','Your presidency begins.','You have taken command. The world watches. History begins now.','green');
      startLoop();
    }
  }

  // ── RENDER HELPERS ─────────────────────────────────────────────────────
  const loyaltyColor = (l: string) => l === 'loyal' ? C.green2 : l === 'suspicious' ? C.red2 : C.gold;

  const Btn = ({onClick, children, style}: any) => (
    <button onClick={onClick} style={{width:'100%',marginBottom:5,padding:'9px 12px',background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border3}`,display:'flex',alignItems:'center',gap:9,color:C.text,fontFamily:C.ffb,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left' as const,...style}}>
      {children}
    </button>
  );

  const TabBtn = ({id, label}: {id:string;label:string}) => (
    <button onClick={() => setActiveTab(id)} style={{flex:1,padding:'11px 4px',fontFamily:C.ffm,fontSize:8,letterSpacing:2,textTransform:'uppercase' as const,color: activeTab===id ? C.gold2 : C.text2,cursor:'pointer',border:'none',background:'transparent',borderBottom: activeTab===id ? `2px solid ${C.gold}` : '2px solid transparent'}}>
      {label}
    </button>
  );

  // ── SCREENS ────────────────────────────────────────────────────────────

  // ── CREATE PRESIDENT ───────────────────────────────────────────────────
  const CNATIONS = [
    {id:'us',flag:'🇺🇸',name:'United States',bonus:'+25 Military'},
    {id:'uk',flag:'🇬🇧',name:'United Kingdom',bonus:'+20 Espionage'},
    {id:'cn',flag:'🇨🇳',name:'China',bonus:'+30 Economic'},
    {id:'ru',flag:'🇷🇺',name:'Russia',bonus:'+25 Military'},
    {id:'de',flag:'🇩🇪',name:'Germany',bonus:'+30 Economy'},
    {id:'fr',flag:'🇫🇷',name:'France',bonus:'+20 Narrative'},
    {id:'jp',flag:'🇯🇵',name:'Japan',bonus:'+25 Tech'},
    {id:'br',flag:'🇧🇷',name:'Brazil',bonus:'+20 Soft Power'},
  ];
  const CBGS = [
    {id:'mil',icon:'🎖',name:'Military',bonus:'+25 Military'},
    {id:'biz',icon:'💼',name:'Business',bonus:'+200 Capital'},
    {id:'spy',icon:'🕵',name:'Intelligence',bonus:'+20 Espionage'},
    {id:'acad',icon:'📚',name:'Academic',bonus:'+20 Narrative'},
    {id:'dip',icon:'🌐',name:'Diplomat',bonus:'+15 All allies'},
    {id:'med',icon:'📺',name:'Media',bonus:'+25 Soft Power'},
  ];
  const CTRAITS = [
    {id:'char',icon:'✨',name:'Charismatic',desc:'Soft power ×2'},
    {id:'ruth',icon:'🗡',name:'Ruthless',desc:'Military −50% cost'},
    {id:'strat',icon:'♟',name:'Strategist',desc:'+1 action/epoch'},
    {id:'econ2',icon:'📊',name:'Economist',desc:'Treasury +40%'},
    {id:'spy2',icon:'🔍',name:'Spymaster',desc:'Spy actions ×2'},
    {id:'orat',icon:'🎤',name:'Orator',desc:'Crises never drain capital'},
    {id:'par',icon:'👁',name:'Paranoid',desc:'Never betrayed'},
    {id:'vis',icon:'🌌',name:'Visionary',desc:'Unlock secret events'},
  ];

  // slider tags helper
  function getSliderTags(sl1:number, sl2:number, sl3:number) {
    const t1 = sl1<35?'Liberal':sl1>65?'Conservative':'Centrist';
    const t2 = sl2>60?'Nationalist':sl2<35?'Globalist':'Pragmatist';
    const t3 = sl3>65?'Hawk':sl3<35?'Dove':'Realist';
    return [t1, t2, t3];
  }

  if (screen === 'create') return (
    <div style={{width:'100vw',height:'100vh',background:C.bg,color:C.text,fontFamily:C.ffb,display:'flex',overflow:'hidden'}}>
      {/* LEFT */}
      <div style={{width:280,flexShrink:0,borderRight:`1px solid ${C.border2}`,display:'flex',flexDirection:'column',background:'rgba(7,10,18,0.98)'}}>
        <div style={{padding:'24px 24px 16px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,marginBottom:6}}>Commander Profile</div>
          <div style={{fontFamily:C.ff,fontSize:20,fontWeight:700,color:'#fff',letterSpacing:1}}>Create Your President</div>
        </div>
        {/* Preview */}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24,background:'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(184,150,62,0.04) 0%,transparent 70%)'}}>
          <div style={{width:120,height:120,borderRadius:'50%',border:`1px solid ${C.border}`,background:'radial-gradient(circle at 38% 32%,rgba(184,150,62,0.1) 0%,transparent 65%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:52}}>👑</div>
          <div style={{fontFamily:C.ff,fontSize:17,fontWeight:700,color:'#fff',textAlign:'center'}}>{presName||'Your Name'}</div>
          <div style={{fontFamily:C.ffm,fontSize:10,letterSpacing:3,color:C.gold,textAlign:'center'}}>
            {presNation ? presNation.toUpperCase() : '— NO NATION —'}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,justifyContent:'center'}}>
            {getSliderTags(sl1,sl2,sl3).map(tag=>(
              <span key={tag} style={{fontFamily:C.ffm,fontSize:8,letterSpacing:1,padding:'2px 7px',border:`1px solid ${C.border2}`,color:C.text2}}>{tag}</span>
            ))}
          </div>
        </div>
        {/* Buttons */}
        <div style={{padding:'16px 20px',borderTop:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',gap:8}}>
          <button onClick={()=>{localStorage.removeItem('digital_state_username');router.push('/landing');}}
            style={{padding:'12px 20px',fontFamily:C.ffm,fontSize:8,letterSpacing:2,textTransform:'uppercase' as const,cursor:'pointer',background:'transparent',border:`1px solid ${C.border}`,color:C.text2}}>
            ← Logout
          </button>
          <button onClick={startGame}
            style={{padding:'12px 28px',fontFamily:C.ff,fontSize:10,fontWeight:600,letterSpacing:3,textTransform:'uppercase' as const,cursor:'pointer',background:C.gold,border:'none',color:C.bg}}>
            Enter State →
          </button>
        </div>
      </div>

      {/* RIGHT — scrollable form */}
      <div style={{flex:1,overflowY:'auto',padding:'28px 36px'}}>
        {/* Presidential Identity */}
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border2}`}}>Presidential Identity</div>
          <input value={presName} onChange={e=>setPresName(e.target.value)}
            placeholder="President's full name"
            style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.03)',border:`1px solid ${C.border2}`,color:C.text,fontFamily:C.ffb,fontSize:15,outline:'none',marginBottom:10,boxSizing:'border-box' as const}}/>
          <input value={presCode} onChange={e=>setPresCode(e.target.value)}
            placeholder='Codename (e.g. "THE ARCHITECT")'
            style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.03)',border:`1px solid ${C.border2}`,color:C.text,fontFamily:C.ffb,fontSize:15,outline:'none',boxSizing:'border-box' as const}}/>
        </div>

        {/* Nation */}
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border2}`}}>Choose Your Nation</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {CNATIONS.map(n=>(
              <div key={n.id} onClick={()=>setPresNation(n.name)}
                style={{padding:'12px 10px',background: presNation===n.name ? 'rgba(184,150,62,0.08)' : 'rgba(255,255,255,0.02)',border:`1px solid ${presNation===n.name ? C.gold : C.border3}`,cursor:'pointer',textAlign:'center' as const,transition:'all 0.15s'}}>
                <div style={{fontSize:18,marginBottom:4}}>{n.flag}</div>
                <div style={{fontFamily:C.ffb,fontSize:12,fontWeight:600,color: presNation===n.name ? C.gold2 : C.text}}>{n.name}</div>
                <div style={{fontFamily:C.ffm,fontSize:9,color:C.text2,marginTop:2}}>{n.bonus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Background */}
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border2}`}}>Background · Starting Bonus</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {CBGS.map(b=>(
              <div key={b.id} onClick={()=>setPresBg(b.id)}
                style={{padding:'14px 10px',background: presBg===b.id ? 'rgba(184,150,62,0.08)' : 'rgba(255,255,255,0.02)',border:`1px solid ${presBg===b.id ? C.gold : C.border3}`,cursor:'pointer',textAlign:'center' as const,transition:'all 0.15s',position:'relative' as const}}>
                {presBg===b.id && <div style={{position:'absolute' as const,top:4,right:6,fontSize:9,color:C.gold}}>✓</div>}
                <div style={{fontSize:20,marginBottom:6}}>{b.icon}</div>
                <div style={{fontFamily:C.ffb,fontSize:12,fontWeight:600,color: presBg===b.id ? C.gold2 : C.text,marginBottom:3}}>{b.name}</div>
                <div style={{fontFamily:C.ffm,fontSize:8,color:C.text2}}>{b.bonus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Traits */}
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border2}`}}>Core Traits · Max 2</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {CTRAITS.map(t=>{
              const sel = presTraits.includes(t.id);
              return (
                <div key={t.id} onClick={()=>{
                  if(sel) setPresTraits(prev=>prev.filter(x=>x!==t.id));
                  else if(presTraits.length<2) setPresTraits(prev=>[...prev,t.id]);
                }}
                  style={{padding:'12px 10px',background: sel ? 'rgba(184,150,62,0.08)' : 'rgba(255,255,255,0.02)',border:`1px solid ${sel ? C.gold : C.border3}`,cursor: (!sel&&presTraits.length>=2)?'not-allowed':'pointer',textAlign:'center' as const,transition:'all 0.15s',opacity:(!sel&&presTraits.length>=2)?0.4:1}}>
                  <div style={{fontSize:18,marginBottom:4}}>{t.icon}</div>
                  <div style={{fontFamily:C.ffb,fontSize:12,fontWeight:600,color: sel ? C.gold2 : C.text,marginBottom:2}}>{t.name}</div>
                  <div style={{fontFamily:C.ffm,fontSize:8,color:C.text2}}>{t.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Political Spectrum */}
        <div style={{marginBottom:40}}>
          <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const,marginBottom:14,paddingBottom:6,borderBottom:`1px solid ${C.border2}`}}>Political Spectrum</div>
          {[
            {label1:'Liberal',label2:'Conservative',val:sl1,set:(v:number)=>setSl1(v)},
            {label1:'Globalist',label2:'Nationalist',val:sl2,set:(v:number)=>setSl2(v)},
            {label1:'Diplomat',label2:'Hawk',val:sl3,set:(v:number)=>setSl3(v)},
          ].map(({label1,label2,val,set})=>(
            <div key={label1} style={{marginBottom:18}}>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:C.ffm,fontSize:9,color:C.text2,marginBottom:7}}>
                <span>{label1}</span><span>{label2}</span>
              </div>
              <input type="range" min={0} max={100} value={val}
                onChange={e=>set(Number(e.target.value))}
                style={{width:'100%',WebkitAppearance:'none' as any,appearance:'none' as any,height:2,background:`linear-gradient(to right, ${C.gold} ${val}%, rgba(184,150,62,0.15) ${val}%)`,outline:'none',cursor:'pointer'}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // CINEMATIC CRISIS
  if (screen === 'cinematic' && activeCrisis) return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:350,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(192,57,43,0.07) 0%,transparent 70%)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)'}}/>
      <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:680,padding:'0 40px'}}>
        <div style={{fontFamily:C.ffm,fontSize:10,letterSpacing:6,color:C.red2,textTransform:'uppercase' as const,marginBottom:20}}>{activeCrisis.label}</div>
        <div style={{fontFamily:C.ff,fontSize:'clamp(28px,5vw,64px)',fontWeight:900,color:'#fff',letterSpacing:4,textTransform:'uppercase' as const,lineHeight:1,marginBottom:10}}>{activeCrisis.title}</div>
        <div style={{fontFamily:C.ff,fontSize:'clamp(13px,2vw,20px)',color:C.red2,letterSpacing:3,textTransform:'uppercase' as const,marginBottom:28}}>{activeCrisis.sub}</div>
        <div style={{fontFamily:C.ffm,fontSize:11,color:C.text3,lineHeight:1.9,border:`1px solid ${C.border2}`,padding:'14px 18px',background:'rgba(4,6,12,0.85)',textAlign:'left' as const,marginBottom:32}}>
          <div style={{fontFamily:C.ffm,fontSize:8,color:C.gold,letterSpacing:2,marginBottom:9,borderBottom:`1px solid ${C.border2}`,paddingBottom:6}}>Intelligence Brief · CLASSIFIED</div>
          {activeCrisis.text}
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' as const}}>
          {activeCrisis.choices.map((ch, i) => (
            <button key={i} onClick={() => resolveCrisis(ch, activeCrisis)}
              style={{padding:'12px 26px',fontFamily:C.ff,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase' as const,cursor:'pointer',border:`1px solid ${C.border}`,color: ch.type === 'primary' ? '#fff' : C.text,background: ch.type === 'primary' ? C.red2 : 'rgba(4,6,12,0.8)'}}>
              {ch.label}
            </button>
          ))}
        </div>
        <div style={{marginTop:32,fontFamily:C.ffm,fontSize:9,letterSpacing:2,color:C.text2}}>Decision required in {crisisTimer}s</div>
      </div>
    </div>
  );

  // VOTE SCREEN
  if (screen === 'vote') return (
    <div style={{position:'fixed',inset:0,background:'rgba(2,3,8,0.98)',zIndex:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 50% at 50% 40%,rgba(184,150,62,0.04) 0%,transparent 70%)'}}/>
      <div style={{fontFamily:C.ff,fontSize:'clamp(18px,3vw,34px)',fontWeight:900,letterSpacing:6,color:'#fff',textTransform:'uppercase' as const,marginBottom:6,position:'relative',zIndex:1}}>Confidence Vote</div>
      <div style={{fontFamily:C.ffm,fontSize:9,letterSpacing:3,color:C.gold,textTransform:'uppercase' as const,marginBottom:36,position:'relative',zIndex:1}}>{voteReason}</div>
      <div style={{display:'flex',gap:14,flexWrap:'wrap' as const,justifyContent:'center',position:'relative',zIndex:1,marginBottom:36}}>
        {voteCards.map((vc, i) => (
          <div key={i} style={{width:100,display:'flex',flexDirection:'column',alignItems:'center',gap:7,padding:'14px 10px',background: vc.revealed ? (vc.vote==='for' ? 'rgba(39,174,96,0.06)' : 'rgba(231,76,60,0.06)') : 'rgba(255,255,255,0.02)',border:`1px solid ${vc.revealed ? (vc.vote==='for' ? C.green2 : C.red2) : C.border3}`,opacity: vc.revealed ? 1 : 0.3,transition:'all 0.4s'}}>
            <div style={{fontSize:26}}>{vc.agent.emoji}</div>
            <div style={{fontFamily:C.ffm,fontSize:7,letterSpacing:1,color:C.text2,textAlign:'center'}}>{vc.agent.name}</div>
            <div style={{fontFamily:C.ff,fontSize:9,fontWeight:700,letterSpacing:2,textTransform:'uppercase' as const,color: vc.vote==='for' ? C.green2 : vc.vote==='against' ? C.red2 : C.text2}}>{vc.revealed ? (vc.vote === 'for' ? 'FOR' : 'AGAINST') : '—'}</div>
          </div>
        ))}
      </div>
      {voteResult?.show && (
        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{fontFamily:C.ff,fontSize:'clamp(24px,5vw,52px)',fontWeight:900,letterSpacing:4,textTransform:'uppercase' as const,marginBottom:8,color: voteResult.title.includes('Survive') ? C.green2 : C.red2}}>{voteResult.title}</div>
          <div style={{fontFamily:C.ffm,fontSize:10,letterSpacing:2,color:C.text2,marginBottom:24}}>{voteResult.sub}</div>
          <button onClick={() => setScreen('game')} style={{padding:'11px 34px',fontFamily:C.ff,fontSize:10,fontWeight:600,letterSpacing:4,textTransform:'uppercase' as const,cursor:'pointer',background:'transparent',border:`1px solid ${C.border}`,color:C.text}}>Return to Command</button>
        </div>
      )}
    </div>
  );

  // CHRONICLE SCREEN
  if (screen === 'chronicle') return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:300,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'24px 40px 18px',borderBottom:`1px solid ${C.border2}`,flexShrink:0,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:C.ffm,fontSize:9,letterSpacing:3,color:C.gold,marginBottom:8}}>Historical Record</div>
          <h1 style={{fontFamily:C.ff,fontSize:26,fontWeight:700,color:'#fff',letterSpacing:2}}>The Chronicle</h1>
        </div>
        <button onClick={() => setScreen('game')} style={{padding:'12px 24px',fontFamily:C.ffm,fontSize:9,letterSpacing:2,textTransform:'uppercase' as const,cursor:'pointer',background:'transparent',border:`1px solid ${C.border}`,color:C.text2}}>← Return</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'32px 40px'}}>
        {chronicle.length === 0 ? <div style={{fontFamily:C.ffm,fontSize:10,color:C.text2,padding:'20px 0'}}>No history yet.</div> : [...chronicle].reverse().map((e, i) => (
          <div key={i} style={{borderLeft:`2px solid ${e.type==='green' ? C.green2 : e.type==='red' ? C.red2 : C.border}`,paddingLeft:24,paddingBottom:30,position:'relative'}}>
            <div style={{position:'absolute',left:-5,top:2,width:8,height:8,borderRadius:'50%',background: e.type==='green' ? C.green2 : e.type==='red' ? C.red2 : C.gold,border:`2px solid ${C.bg}`}}/>
            <div style={{fontFamily:C.ffm,fontSize:9,letterSpacing:3,color:C.gold,marginBottom:6}}>EPOCH {e.epoch} — {EPOCH_NAMES[e.epoch-1]}</div>
            <div style={{fontFamily:C.ff,fontSize:17,fontWeight:700,color:'#fff',letterSpacing:1,marginBottom:8}}>{e.headline}</div>
            <div style={{fontFamily:C.ffm,fontSize:10,color:C.text3,lineHeight:1.9}}>{e.text}</div>
            {e.sub && <div style={{margin:'12px 0',padding:'9px 14px',borderLeft:`2px solid ${C.gold}`,fontFamily:C.ffm,fontSize:9,color:C.text2,fontStyle:'italic'}}>{e.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ── MAIN GAME SCREEN ─────────────────────────────────────────────────────
  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:C.bg,color:C.text,fontFamily:C.ffb,display:'flex',flexDirection:'row',position:'relative'}}>
      {/* Scanlines */}
      <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 4px)'}}/>
      {/* Hide FPS counter */}
      <style dangerouslySetInnerHTML={{__html:`div[style*="position: fixed"][style*="left: 0px"][style*="top: 0px"] { display: none !important; }`}} />

      {/* Globe area */}
      <div style={{position:'relative',flex:1,transition:'margin-right 0.4s cubic-bezier(0.32,0.72,0,1)',marginRight: panelOpen ? PANEL_W : 0,minWidth:0,overflow:'hidden'}}>

        {/* Globe */}
        <GlobeArea opacity={currentLayer === 1 ? 1 : 0.12} />

        {/* HUD */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:54,zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'linear-gradient(180deg,rgba(4,6,12,0.96) 0%,transparent 100%)',borderBottom:`1px solid ${C.border2}`,pointerEvents:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,pointerEvents:'auto'}}>
            <div style={{fontFamily:C.ff,fontSize:14,fontWeight:700,letterSpacing:4,color:C.gold2}}>DIGITAL STATE</div>
            <div style={{width:1,height:18,background:C.border2}}/>
            <div style={{fontFamily:C.ffm,fontSize:10,letterSpacing:2,color:C.text2}}>{username.toUpperCase()} · GLOBAL OPERATOR</div>
          </div>
          <div style={{display:'flex',pointerEvents:'auto'}}>
            {[['INFLUENCE',influence],['TREASURY',capital.toLocaleString()],['NATIONS',nationsOwned],['SOFT POWER',softPower]].map(([l,v]) => (
              <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'flex-end',padding:'0 14px',borderLeft:`1px solid ${C.border2}`}}>
                <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:2,color:C.text2,marginBottom:1}}>{l}</div>
                <div style={{fontFamily:C.ffm,fontSize:17,color:C.gold2,lineHeight:1}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Epoch */}
        <div style={{position:'absolute',top:56,left:'50%',transform:'translateX(-50%)',zIndex:20,display:'flex',flexDirection:'column',alignItems:'center',gap:3,pointerEvents:'none'}}>
          <div style={{fontFamily:C.ffm,fontSize:7,letterSpacing:3,color:C.text2}}>Epoch Progress</div>
          <div style={{width:120,height:1,background:C.border2,overflow:'hidden'}}><div style={{height:'100%',background:C.gold,width:`${epochPct}%`,transition:'width 1s linear'}}/></div>
          <div style={{fontFamily:C.ffm,fontSize:8,color:C.gold,letterSpacing:2}}>Epoch {epoch} — {EPOCH_NAMES[epoch-1]}</div>
        </div>

        {/* Layer buttons */}
        <div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',zIndex:25,display:'flex',flexDirection:'column'}}>
          {[{n:1,label:'🌍 Geopolitics'},{n:2,label:'🗺 Country'},{n:3,label:'🏛 Government'}].map(({n,label}) => (
            <button key={n} onClick={() => setCurrentLayer(n)}
              style={{padding:'12px 10px',fontFamily:C.ffm,fontSize:7,letterSpacing:'1.5px',textTransform:'uppercase' as const,background: currentLayer===n ? 'rgba(184,150,62,0.1)' : 'rgba(4,6,12,0.9)',border:`1px solid ${currentLayer===n ? C.gold : C.border2}`,borderLeft:'none',borderBottom:'none',color: currentLayer===n ? C.gold2 : C.text2,cursor:'pointer',writingMode:'vertical-rl' as const,transform:'rotate(180deg)',height:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {label}
            </button>
          ))}
        </div>

        {/* Event feed */}
        {currentLayer === 1 && (
          <div style={{position:'absolute',bottom:20,left:60,zIndex:20,width:260,display:'flex',flexDirection:'column',gap:4,pointerEvents:'none'}}>
            {events.map((e,i) => (
              <div key={i} style={{padding:'7px 10px',background:'rgba(4,6,12,0.93)',borderLeft:`2px solid ${e.type==='green' ? C.green2 : e.type==='red' ? C.red2 : C.gold}`,fontFamily:C.ffm,fontSize:10,color:C.text3,lineHeight:1.5}}>
                <span style={{color:C.text2,fontSize:8,display:'block',marginBottom:1}}>{e.t}</span>
                {e.text}
              </div>
            ))}
          </div>
        )}

        {/* LAYER 2 — Country Map */}
        {currentLayer === 2 && (
          <div style={{position:'absolute',inset:0,zIndex:15,background:'rgba(4,6,12,0.93)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:'min(680px,85vw)',aspectRatio:'16/9',position:'relative',border:`1px solid ${C.border}`,background:'rgba(10,20,35,0.95)',overflow:'hidden'}}>
              {/* Grid */}
              <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(184,150,62,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(184,150,62,0.04) 1px,transparent 1px)`,backgroundSize:'40px 40px'}}/>
              <div style={{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',fontFamily:C.ff,fontSize:12,fontWeight:700,letterSpacing:3,color:C.gold2,whiteSpace:'nowrap'}}>
                {targetCountry ? `${targetCountry.flag} ${targetCountry.name.toUpperCase()}` : '— SELECT A NATION —'}
              </div>
              {/* Regions */}
              {REGIONS.map(r => (
                <div key={r.name} style={{position:'absolute',...r.style,background:r.color,border:`1px solid rgba(184,150,62,0.12)`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s'}}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,150,62,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = r.color)}>
                  <span style={{color:C.text2,fontFamily:C.ffm,fontSize:8,letterSpacing:1,textAlign:'center'}}>{r.name}</span>
                </div>
              ))}
              {/* Stats */}
              {targetCountry && (
                <div style={{position:'absolute',bottom:10,left:0,right:0,display:'flex',justifyContent:'center',gap:20}}>
                  {[['GDP',targetCountry.gdp],['Stability',targetCountry.stability+'%'],['Influence',targetCountry.influence+'%'],['Mood',targetCountry.stability>75?'😊':targetCountry.stability>50?'😐':'😠']].map(([l,v]) => (
                    <div key={l} style={{textAlign:'center'}}>
                      <div style={{fontFamily:C.ffm,fontSize:15,color:C.gold2}}>{v}</div>
                      <div style={{fontFamily:C.ffm,fontSize:7,color:C.text2,letterSpacing:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Happiness dots */}
              {targetCountry && (
                <div style={{position:'absolute',bottom:52,left:12,right:12,display:'flex',gap:3,flexWrap:'wrap' as const}}>
                  {Array.from({length:60}).map((_, i) => (
                    <div key={i} style={{width:5,height:5,borderRadius:'50%',background: i < (targetCountry.stability/100*60) ? `hsl(${110+Math.random()*30},55%,40%)` : 'rgba(70,70,70,0.35)'}}/>
                  ))}
                </div>
              )}
              {/* Country list on right */}
              <div style={{position:'absolute',right:0,top:0,bottom:0,width:120,background:'rgba(4,6,12,0.92)',borderLeft:`1px solid ${C.border2}`,overflowY:'auto',padding:6}}>
                {countries.map(c => (
                  <div key={c.name} onClick={() => selectCountry(c)}
                    style={{padding:'5px 7px',cursor:'pointer',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:5,background: targetCountry?.name===c.name ? 'rgba(184,150,62,0.08)' : 'transparent'}}>
                    <span style={{fontSize:11}}>{c.flag}</span>
                    <div>
                      <div style={{fontFamily:C.ffm,fontSize:8,color:C.text,letterSpacing:0.5}}>{c.name}</div>
                      <div style={{fontFamily:C.ffm,fontSize:7,color: c.status==='Allied' ? C.green2 : c.status==='Hostile' ? C.red2 : C.text2}}>{c.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LAYER 3 — Government Room */}
        {currentLayer === 3 && (
          <div style={{position:'absolute',inset:0,zIndex:15,background:'rgba(2,4,10,0.96)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',paddingBottom:24}}>
            {/* Top label */}
            <div style={{position:'absolute',top:70,left:'50%',transform:'translateX(-50%)',fontFamily:C.ffm,fontSize:9,letterSpacing:4,color:C.text2,textTransform:'uppercase' as const}}>Government Chamber</div>
            <div style={{width:'100%',maxWidth:860,position:'relative'}}>
              {/* Table SVG */}
              <div style={{width:'100%',height:140,position:'relative',marginBottom:8,background:'radial-gradient(ellipse 60% 50% at 50% 100%,rgba(184,150,62,0.05) 0%,transparent 70%)'}}>
                <svg style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',opacity:0.2}} width="660" height="110" viewBox="0 0 660 110">
                  <ellipse cx="330" cy="105" rx="300" ry="65" stroke="rgba(184,150,62,0.45)" strokeWidth="1" fill="none"/>
                  <ellipse cx="330" cy="105" rx="260" ry="52" stroke="rgba(184,150,62,0.15)" strokeWidth="1" fill="rgba(184,150,62,0.025)"/>
                </svg>
              </div>
              {/* Agents */}
              <div style={{display:'flex',justifyContent:'center',gap:'clamp(6px,2vw,28px)',alignItems:'flex-end',padding:'0 16px'}}>
                {cabinet.map((a, i) => (
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',position:'relative',transition:'transform 0.2s'}}
                    onClick={() => setActiveBubble(activeBubble?.idx === i ? null : {idx:i, text:a.thought})}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                    {/* Speech bubble */}
                    {activeBubble?.idx === i && (
                      <div style={{position:'absolute',bottom:'calc(100% + 6px)',left:'50%',transform:'translateX(-50%)',background:'rgba(6,10,18,0.98)',border:`1px solid ${C.border}`,padding:'6px 9px',minWidth:140,maxWidth:200,fontFamily:C.ffm,fontSize:8,color:C.text,lineHeight:1.5,textAlign:'center' as const,zIndex:10,whiteSpace:'normal' as const}}>
                        {activeBubble.text}
                      </div>
                    )}
                    <div style={{width:58,height:64,border:`1px solid ${C.border}`,background:'linear-gradient(180deg,rgba(184,150,62,0.07) 0%,rgba(4,6,12,0.8) 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,position:'relative',boxShadow: speakingIdx===i ? `0 0 0 2px ${C.gold},0 0 18px rgba(184,150,62,0.25)` : 'none',transition:'box-shadow 0.3s'}}>
                      {a.emoji}
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:loyaltyColor(a.loyalty)}}/>
                    </div>
                    <div style={{fontFamily:C.ffm,fontSize:7,letterSpacing:1,color:C.text2,textAlign:'center' as const,maxWidth:65}}>{a.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
              {/* Chat messages */}
              <div style={{width:'min(560px,88vw)',margin:'10px auto 0',display:'flex',flexDirection:'column',gap:3,maxHeight:90,overflow:'hidden'}}>
                {govMessages.map((m, i) => (
                  <div key={i} style={{fontFamily:C.ffm,fontSize:9,color:C.text3,lineHeight:1.5,textAlign:'center' as const}}>
                    <strong style={{color:C.gold2}}>{m.speaker}:</strong> {m.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel toggle */}
      <button onClick={() => setPanelOpen(p => !p)}
        style={{position:'fixed',top:'50%',transform:'translateY(-50%)',right: panelOpen ? PANEL_W : 0,zIndex:300,width:18,height:48,background:'rgba(4,6,12,0.96)',border:`1px solid ${C.border}`,borderRight:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.text2,transition:'right 0.4s cubic-bezier(0.32,0.72,0,1)',padding:0}}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform: panelOpen ? 'none' : 'rotate(180deg)',flexShrink:0}}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Side panel */}
      <div style={{position:'fixed',top:0,right:0,width:PANEL_W,height:'100%',background:'rgba(4,6,12,0.99)',borderLeft:`1px solid ${C.border2}`,zIndex:500,display:'flex',flexDirection:'column',transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',transition:'transform 0.4s cubic-bezier(0.32,0.72,0,1)',isolation:'isolate',pointerEvents:'all'}}>
        <div style={{display:'flex',borderBottom:`1px solid ${C.border2}`,flexShrink:0}}>
          <TabBtn id="ops" label="Ops"/>
          <TabBtn id="power" label="Power"/>
          <TabBtn id="agents" label="Agents"/>
          <TabBtn id="world" label="World"/>
          <button onClick={() => setScreen('chronicle')} style={{flex:0,padding:'11px 8px',fontFamily:C.ffm,fontSize:10,color:C.text2,cursor:'pointer',border:'none',background:'transparent',borderBottom:'2px solid transparent'}}>📜</button>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:14,scrollbarWidth:'thin',scrollbarColor:`${C.border2} transparent`}}>

          {/* OPS TAB */}
          {activeTab === 'ops' && (
            <div>
              {/* Country box */}
              {targetCountry && (
                <div style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border2}`,padding:12,marginBottom:12}}>
                  <div style={{fontFamily:C.ff,fontSize:16,color:C.gold2,marginBottom:3}}>{targetCountry.flag} {targetCountry.name}</div>
                  <div style={{fontFamily:C.ffm,fontSize:8,color:C.text2,letterSpacing:2,marginBottom:10}}>STABILITY {targetCountry.stability}% · GDP {targetCountry.gdp} · {targetCountry.status.toUpperCase()}</div>
                  {[{t:'spy',icon:'🕵',label:'Deploy Spy',cost:'-150 💰'},{t:'media',icon:'📡',label:'Propaganda',cost:'-80 💰'},{t:'econ',icon:'💹',label:'Economic Pressure',cost:'-200 💰'},{t:'mil',icon:'⚔',label:'Military Threat',cost:'-300 💰'}].map(a => (
                    <Btn key={a.t} onClick={() => act(a.t)}>
                      <span style={{fontSize:13,width:16,textAlign:'center'}}>{a.icon}</span>{a.label}
                      <span style={{marginLeft:'auto',fontFamily:C.ffm,fontSize:8,color:C.text2}}>{a.cost}</span>
                    </Btn>
                  ))}
                </div>
              )}
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${C.border2}`}}>Global Operations</div>
              {[{t:'summit',icon:'🌐',label:'Diplomatic Summit',cost:'-120 💰'},{t:'trade',icon:'🚢',label:'Trade Route Control',cost:'-180 💰'},{t:'hack',icon:'💻',label:'Cyber Offensive',cost:'-90 💰'},{t:'disinfo',icon:'📰',label:'Disinformation Drop',cost:'-60 💰'}].map(a => (
                <Btn key={a.t} onClick={() => gact(a.t)}>
                  <span style={{fontSize:13,width:16,textAlign:'center'}}>{a.icon}</span>{a.label}
                  <span style={{marginLeft:'auto',fontFamily:C.ffm,fontSize:8,color:C.text2}}>{a.cost}</span>
                </Btn>
              ))}
              <Btn onClick={() => triggerVote('The opposition calls a confidence vote.')} style={{marginTop:8,borderColor:'rgba(231,76,60,0.25)',color:C.red2}}>
                <span>🗳</span>Confidence Vote
              </Btn>
              <Btn onClick={() => triggerCrisis()} style={{borderColor:'rgba(184,150,62,0.2)',color:C.gold2}}>
                <span>⚡</span>Trigger Crisis [TEST]
              </Btn>
            </div>
          )}

          {/* POWER TAB */}
          {activeTab === 'power' && (
            <div>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${C.border2}`}}>Power Vectors</div>
              {[['Military',military,C.red2],['Economic',economic,C.green2],['Narrative',narrative,C.blue2],['Espionage',espionage,C.gold],['Soft Power',softPower,C.purple2]].map(([l,v,c]) => (
                <div key={l as string} style={{display:'grid',gridTemplateColumns:'70px 1fr 28px',alignItems:'center',gap:7,marginBottom:8}}>
                  <span style={{fontFamily:C.ffm,fontSize:8,letterSpacing:1,color:C.text2}}>{l}</span>
                  <div style={{height:3,background:C.border2,overflow:'hidden'}}><div style={{height:'100%',background:c as string,width:`${v}%`,transition:'width 0.6s'}}/></div>
                  <span style={{fontFamily:C.ffm,fontSize:8,color:C.text3,textAlign:'right'}}>{v}%</span>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${C.border2}`,margin:'12px 0'}}/>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10}}>Sphere of Influence</div>
              <div style={{fontFamily:C.ffm,fontSize:9,color:C.text3,lineHeight:2}}>
                {countries.filter(c => c.status==='Allied').map(c => `${c.flag} ${c.name}`).join('\n') || '— Expand to gain allies —'}
              </div>
              <div style={{borderTop:`1px solid ${C.border2}`,margin:'12px 0'}}/>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10}}>Active Wars</div>
              <div style={{fontFamily:C.ffm,fontSize:9,color:C.red2,lineHeight:2}}>{wars.length ? wars.map(w => `⚔ vs ${w}`).join('\n') : '— No active conflicts —'}</div>
            </div>
          )}

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <div>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${C.border2}`}}>Cabinet & Field Agents</div>
              {[...cabinet, ...agents].map((a, i) => (
                <div key={i} style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border3}`,padding:11,marginBottom:7,position:'relative',cursor:'pointer'}} onClick={() => showToast(a.thought)}>
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:loyaltyColor(a.loyalty)}}/>
                  <div style={{display:'flex',gap:9,marginBottom:7,alignItems:'flex-start'}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{a.emoji}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{a.name}</div>
                      <div style={{fontFamily:C.ffm,fontSize:8,color:C.text2,letterSpacing:1,marginTop:1}}>{(a.role||a.spec||'').toUpperCase()}</div>
                      <span style={{display:'inline-block',marginTop:3,padding:'1px 5px',fontFamily:C.ffm,fontSize:7,letterSpacing:1,border:'1px solid',color: loyaltyColor(a.loyalty),borderColor: loyaltyColor(a.loyalty),background:'rgba(0,0,0,0.3)'}}>{a.loyalty.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{fontFamily:C.ffm,fontSize:9,color:C.text2,lineHeight:1.5,borderTop:`1px solid ${C.border2}`,paddingTop:7}}>"{a.thought}"</div>
                  {a.onMission && <div style={{marginTop:5,padding:'4px 7px',fontFamily:C.ffm,fontSize:8,letterSpacing:1,background:'rgba(41,128,185,0.1)',border:'1px solid rgba(41,128,185,0.2)',color:C.blue2}}>▶ {a.onMission.type} → {a.onMission.target}</div>}
                </div>
              ))}
            </div>
          )}

          {/* WORLD TAB */}
          {activeTab === 'world' && (
            <div>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${C.border2}`}}>Live Players</div>
              {MOCK_PLAYERS.map(p => (
                <div key={p.name} style={{padding:'9px 10px',background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border3}`,marginBottom:5,display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background: p.status==='online' ? C.green2 : p.status==='away' ? C.gold : C.text2,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:C.ffm,fontSize:10,color:C.text,letterSpacing:1}}>{p.name}</div>
                    <div style={{fontFamily:C.ffm,fontSize:8,color:C.text2}}>{p.nation} · {p.status.toUpperCase()}</div>
                  </div>
                  <button onClick={() => showToast(`Alliance sent to ${p.name}`)} style={{padding:'2px 6px',fontFamily:C.ffm,fontSize:7,border:`1px solid rgba(39,174,96,0.3)`,color:C.green2,cursor:'pointer',background:'none'}}>ALLY</button>
                  <button onClick={() => showToast(`War declared on ${p.name}`)} style={{padding:'2px 6px',fontFamily:C.ffm,fontSize:7,border:`1px solid rgba(231,76,60,0.3)`,color:C.red2,cursor:'pointer',background:'none'}}>WAR</button>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${C.border2}`,margin:'12px 0'}}/>
              <div style={{fontFamily:C.ffm,fontSize:8,letterSpacing:3,color:C.text2,textTransform:'uppercase' as const,marginBottom:10}}>World Events</div>
              <div style={{fontFamily:C.ffm,fontSize:9,color:C.text3,lineHeight:1.8}}>
                {['🇷🇺 StarikVlad declares war on Saudi Arabia.','🇨🇳 DragonWei forms trade pact with India.','🇫🇷 MacroGhost launches propaganda offensive.','🌍 Global stability: 62% — declining.'].map((e,i) => (
                  <div key={i} style={{padding:'5px 0',borderBottom:`1px solid ${C.border2}`}}>{e}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',bottom:24,right: panelOpen ? PANEL_W+16 : 20,zIndex:300,background:'rgba(4,6,12,0.97)',border:`1px solid ${C.border}`,padding:'10px 16px',fontFamily:C.ffm,fontSize:10,color:C.text,letterSpacing:1,transition:'right 0.4s'}}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <GlobeSettingsProvider>
      <GameContent />
    </GlobeSettingsProvider>
  );
}
