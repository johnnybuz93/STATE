'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlobeSettingsProvider, useGlobeSettings } from '@/contexts/GlobeSettingsContext';

const GlobeCanvas = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => <div style={{width:'100%',height:'100%',background:'#04060c'}} />,
});

function GlobeArea({ visible }: { visible: boolean }) {
  const settings = useGlobeSettings();
  return (
    <div style={{position:'absolute',inset:0,opacity: visible ? 1 : 0.12, transition:'opacity 0.3s', pointerEvents: visible ? 'auto' : 'none'}}>
      <GlobeCanvas {...settings} />
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const [username, setUsername] = useState('COMMANDER');
  const [screen, setScreen] = useState<'create'|'game'>('create');
  const [globeVisible, setGlobeVisible] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [capital, setCapital] = useState(1200);
  const [influence, setInfluence] = useState(0);
  const [nationsOwned, setNationsOwned] = useState(1);
  const [softPower, setSoftPower] = useState(24);
  const [epoch, setEpoch] = useState(1);
  const [epochPct, setEpochPct] = useState(0);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [activeTab, setActiveTab] = useState('ops');
  const [events, setEvents] = useState<{text:string,type:string,t:string}[]>([]);
  const [presName, setPresName] = useState('');
  const gameStarted = useRef(false);
  const epochTimer = useRef(0);

  const EPOCH_NAMES = ['Dawn of Power','The Shadow Wars','The Great Game','Iron Curtain','Final Dominion'];

  useEffect(() => {
    const saved = localStorage.getItem('digital_state_username');
    if (!saved) { router.push('/landing'); return; }
    setUsername(saved);
  }, []);

  function launchGame() {
    setScreen('game');
    if (!gameStarted.current) {
      gameStarted.current = true;
      addEvt('Command channel open. The world awaits your move.', 'green');
      addEvt('Intelligence reports incoming from 3 continents.', '');
      startGameLoop();
    }
  }

  function addEvt(text: string, type: string) {
    const now = new Date();
    const t = `EP${epoch}·${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    setEvents(prev => [{text, type, t}, ...prev].slice(0, 5));
  }

  function startGameLoop() {
    const tick = () => {
      epochTimer.current++;
      setEpochPct((epochTimer.current % 600) / 600 * 100);
      if (epochTimer.current % 90 === 0) {
        setCapital(c => c + 75);
        setInfluence(i => Math.min(9999, i + 4));
      }
      if (epochTimer.current % 600 === 0 && epochTimer.current > 0) {
        setEpoch(e => {
          const next = Math.min(5, e + 1);
          return next;
        });
      }
      setTimeout(tick, 33);
    };
    tick();
  }

  const W = 360;

  // CSS vars inline
  const gold = '#b8963e';
  const gold2 = '#d4ae5a';
  const bg = '#04060c';
  const border2 = 'rgba(184,150,62,0.08)';
  const border = 'rgba(184,150,62,0.2)';
  const text2 = '#5e5a52';
  const text3 = '#8a8478';
  const ff = "'Cinzel',serif";
  const ffMono = "'Share Tech Mono',monospace";
  const ffBody = "'Rajdhani',sans-serif";

  if (screen === 'create') {
    return (
      <GlobeSettingsProvider>
        <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:bg,color:'#c4beb0',fontFamily:ffBody,display:'flex',flexDirection:'row',alignItems:'stretch'}}>
          {/* Left */}
          <div style={{width:380,flexShrink:0,borderRight:`1px solid ${border2}`,display:'flex',flexDirection:'column'}}>
            <div style={{padding:'28px 28px 20px',borderBottom:`1px solid ${border2}`}}>
              <div style={{fontFamily:ffMono,fontSize:9,letterSpacing:3,color:gold,marginBottom:8}}>Commander Profile</div>
              <h2 style={{fontFamily:ff,fontSize:24,fontWeight:700,color:'#fff',letterSpacing:1}}>Create Your President</h2>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,padding:28,background:'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(184,150,62,0.04) 0%,transparent 70%)'}}>
              <div style={{width:120,height:120,borderRadius:'50%',border:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:52}}>🤴</div>
              <div style={{fontFamily:ff,fontSize:18,fontWeight:700,color:'#fff',letterSpacing:1,textAlign:'center'}}>{presName||'Your Name'}</div>
              <div style={{fontFamily:ffMono,fontSize:10,letterSpacing:3,color:gold,textAlign:'center'}}>— NO NATION —</div>
            </div>
            <div style={{padding:'20px 28px',borderTop:`1px solid ${border2}`,display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>{localStorage.removeItem('digital_state_username');router.push('/landing');}}
                style={{padding:'12px 24px',fontFamily:ffMono,fontSize:9,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',background:'transparent',border:`1px solid ${border}`,color:text2}}>
                ← Logout
              </button>
              <button onClick={launchGame}
                style={{padding:'12px 32px',fontFamily:ff,fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',cursor:'pointer',background:gold,border:'none',color:bg}}>
                Enter State →
              </button>
            </div>
          </div>
          {/* Right */}
          <div style={{flex:1,overflowY:'auto',padding:28}}>
            <div style={{fontFamily:ffMono,fontSize:9,letterSpacing:3,color:gold,marginBottom:16,textTransform:'uppercase'}}>Presidential Identity</div>
            <input value={presName} onChange={e=>setPresName(e.target.value)} placeholder="President's full name"
              style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.03)',border:`1px solid ${border2}`,color:'#c4beb0',fontFamily:ffBody,fontSize:15,outline:'none',marginBottom:10}}/>
            <input placeholder='Codename (e.g. "THE ARCHITECT")'
              style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.03)',border:`1px solid ${border2}`,color:'#c4beb0',fontFamily:ffBody,fontSize:15,outline:'none',marginBottom:10}}/>
            <div style={{fontFamily:ffMono,fontSize:9,letterSpacing:3,color:gold,margin:'20px 0 12px',textTransform:'uppercase'}}>Choose Your Nation</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[{flag:'🇺🇸',name:'United States',bonus:'+25 Military'},{flag:'🇬🇧',name:'United Kingdom',bonus:'+20 Espionage'},{flag:'🇨🇳',name:'China',bonus:'+30 Economic'},{flag:'🇷🇺',name:'Russia',bonus:'+25 Military'},{flag:'🇩🇪',name:'Germany',bonus:'+30 Economy'},{flag:'🇫🇷',name:'France',bonus:'+20 Narrative'},{flag:'🇯🇵',name:'Japan',bonus:'+25 Tech'},{flag:'🇧🇷',name:'Brazil',bonus:'+20 Soft Power'}].map(n=>(
                <div key={n.name} style={{padding:'12px 10px',background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.05)`,cursor:'pointer',textAlign:'center'}}>
                  <div style={{fontSize:18,marginBottom:5}}>{n.flag}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#c4beb0'}}>{n.name}</div>
                  <div style={{fontFamily:ffMono,fontSize:9,color:text2,marginTop:2}}>{n.bonus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlobeSettingsProvider>
    );
  }

  return (
    <GlobeSettingsProvider>
      <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:bg,color:'#c4beb0',fontFamily:ffBody,display:'flex',flexDirection:'row',position:'relative'}}>

        {/* Globe area */}
        <div style={{position:'relative',flex:1,transition:`margin-right 0.4s`,marginRight: panelOpen ? W : 0,minWidth:0,overflow:'hidden'}}>

          {/* Globe — rendered directly, no iframe! */}
          <GlobeArea visible={currentLayer === 1} />

          {/* HUD */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:54,zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'linear-gradient(180deg,rgba(4,6,12,0.96) 0%,transparent 100%)',borderBottom:`1px solid ${border2}`,pointerEvents:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:16,pointerEvents:'auto'}}>
              <div style={{fontFamily:ff,fontSize:14,fontWeight:700,letterSpacing:4,color:gold2}}>DIGITAL STATE</div>
              <div style={{width:1,height:18,background:border2}}/>
              <div style={{fontFamily:ffMono,fontSize:10,letterSpacing:2,color:text2}}>{username.toUpperCase()} · GLOBAL OPERATOR</div>
            </div>
            <div style={{display:'flex',pointerEvents:'auto'}}>
              {[['INFLUENCE',influence],['TREASURY',capital.toLocaleString()],['NATIONS',nationsOwned],['SOFT POWER',softPower]].map(([l,v])=>(
                <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'flex-end',padding:'0 14px',borderLeft:`1px solid ${border2}`}}>
                  <div style={{fontFamily:ffMono,fontSize:8,letterSpacing:2,color:text2,marginBottom:1}}>{l}</div>
                  <div style={{fontFamily:ffMono,fontSize:17,color:gold2,lineHeight:1}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Epoch */}
          <div style={{position:'absolute',top:56,left:'50%',transform:'translateX(-50%)',zIndex:20,display:'flex',flexDirection:'column',alignItems:'center',gap:3,pointerEvents:'none'}}>
            <div style={{fontFamily:ffMono,fontSize:7,letterSpacing:3,color:text2}}>Epoch Progress</div>
            <div style={{width:120,height:1,background:border2,overflow:'hidden'}}>
              <div style={{height:'100%',background:gold,width:`${epochPct}%`,transition:'width 1s linear'}}/>
            </div>
            <div style={{fontFamily:ffMono,fontSize:8,color:gold,letterSpacing:2}}>Epoch {epoch} — {EPOCH_NAMES[epoch-1]}</div>
          </div>

          {/* Layer buttons — left side */}
          <div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',zIndex:25,display:'flex',flexDirection:'column'}}>
            {[{n:1,label:'🌍 Geopolitics'},{n:2,label:'🗺 Country'},{n:3,label:'🏛 Government'}].map(({n,label})=>(
              <button key={n} onClick={()=>{setCurrentLayer(n);setGlobeVisible(n===1);}}
                style={{padding:'12px 10px',fontFamily:ffMono,fontSize:7,letterSpacing:'1.5px',textTransform:'uppercase',background: currentLayer===n ? 'rgba(184,150,62,0.1)' : 'rgba(4,6,12,0.9)',border:`1px solid ${currentLayer===n ? gold : border2}`,borderLeft:'none',borderBottom:'none',color: currentLayer===n ? gold2 : text2,cursor:'pointer',writingMode:'vertical-rl',transform:'rotate(180deg)',height:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {label}
              </button>
            ))}
          </div>

          {/* Event feed */}
          {currentLayer === 1 && (
            <div style={{position:'absolute',bottom:20,left:60,zIndex:20,width:260,display:'flex',flexDirection:'column',gap:4,pointerEvents:'none'}}>
              {events.map((e,i)=>(
                <div key={i} style={{padding:'7px 10px',background:'rgba(4,6,12,0.93)',borderLeft:`2px solid ${e.type==='green'?'#27ae60':e.type==='red'?'#e74c3c':'#b8963e'}`,fontFamily:ffMono,fontSize:10,color:text3,lineHeight:1.5}}>
                  <span style={{color:text2,fontSize:8,display:'block',marginBottom:1}}>{e.t}</span>
                  {e.text}
                </div>
              ))}
            </div>
          )}

          {/* Layer 2 — Country */}
          {currentLayer === 2 && (
            <div style={{position:'absolute',inset:0,zIndex:15,background:'rgba(4,6,12,0.93)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:'min(680px,85vw)',aspectRatio:'16/9',position:'relative',border:`1px solid ${border}`,background:'rgba(10,20,35,0.95)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontFamily:ff,fontSize:14,color:gold2,letterSpacing:3}}>— SELECT A NATION —</div>
              </div>
            </div>
          )}

          {/* Layer 3 — Government */}
          {currentLayer === 3 && (
            <div style={{position:'absolute',inset:0,zIndex:15,background:'rgba(2,4,10,0.96)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontFamily:ff,fontSize:18,color:gold2,letterSpacing:3}}>🏛 GOVERNMENT CHAMBER</div>
            </div>
          )}
        </div>

        {/* Panel toggle */}
        <button onClick={()=>setPanelOpen(p=>!p)}
          style={{position:'fixed',top:'50%',transform:'translateY(-50%)',right: panelOpen ? W : 0,zIndex:300,width:18,height:48,background:'rgba(4,6,12,0.96)',border:`1px solid ${border}`,borderRight:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:text2,transition:'right 0.4s'}}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{transform: panelOpen ? 'none' : 'rotate(180deg)'}}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Side panel */}
        <div style={{position:'fixed',top:0,right:0,width:W,height:'100%',background:'rgba(4,6,12,0.99)',borderLeft:`1px solid ${border2}`,zIndex:250,display:'flex',flexDirection:'column',transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',transition:'transform 0.4s'}}>
          {/* Tabs */}
          <div style={{display:'flex',borderBottom:`1px solid ${border2}`,flexShrink:0}}>
            {['ops','power','agents','world'].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)}
                style={{flex:1,padding:'11px 4px',fontFamily:ffMono,fontSize:8,letterSpacing:2,textTransform:'uppercase',color: activeTab===t ? gold2 : text2,cursor:'pointer',border:'none',background:'transparent',borderBottom: activeTab===t ? `2px solid ${gold}` : '2px solid transparent'}}>
                {t}
              </button>
            ))}
            <button onClick={()=>{}} style={{flex:0,padding:'11px 8px',fontFamily:ffMono,fontSize:10,color:text2,cursor:'pointer',border:'none',background:'transparent',borderBottom:'2px solid transparent'}}>📜</button>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:14}}>
            {activeTab === 'ops' && (
              <div>
                <div style={{fontFamily:ffMono,fontSize:8,letterSpacing:3,color:text2,textTransform:'uppercase',marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${border2}`}}>Global Operations</div>
                {[
                  {icon:'🌐',label:'Diplomatic Summit',cost:'-120 💰'},
                  {icon:'🚢',label:'Trade Route Control',cost:'-180 💰'},
                  {icon:'💻',label:'Cyber Offensive',cost:'-90 💰'},
                  {icon:'📰',label:'Disinformation Drop',cost:'-60 💰'},
                ].map(a=>(
                  <button key={a.label} style={{width:'100%',marginBottom:5,padding:'9px 12px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:9,color:'#c4beb0',fontFamily:ffBody,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left'}}>
                    <span style={{fontSize:13,width:16,textAlign:'center'}}>{a.icon}</span>
                    {a.label}
                    <span style={{marginLeft:'auto',fontFamily:ffMono,fontSize:8,color:text2}}>{a.cost}</span>
                  </button>
                ))}
                <button style={{width:'100%',marginTop:8,padding:'9px 12px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(231,76,60,0.25)',display:'flex',alignItems:'center',gap:9,color:'#e74c3c',fontFamily:ffBody,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left'}}>
                  <span>🗳</span>Confidence Vote
                </button>
              </div>
            )}
            {activeTab === 'power' && (
              <div>
                <div style={{fontFamily:ffMono,fontSize:8,letterSpacing:3,color:text2,textTransform:'uppercase',marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${border2}`}}>Power Vectors</div>
                {[['Military',45,'#e74c3c'],['Economic',62,'#27ae60'],['Narrative',28,'#2980b9'],['Espionage',17,gold],['Soft Power',24,'#9b59b6']].map(([l,v,c])=>(
                  <div key={l as string} style={{display:'grid',gridTemplateColumns:'70px 1fr 28px',alignItems:'center',gap:7,marginBottom:8}}>
                    <span style={{fontFamily:ffMono,fontSize:8,letterSpacing:1,color:text2}}>{l}</span>
                    <div style={{height:3,background:border2,overflow:'hidden'}}><div style={{height:'100%',background:c as string,width:`${v}%`}}/></div>
                    <span style={{fontFamily:ffMono,fontSize:8,color:text3,textAlign:'right'}}>{v}%</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'agents' && (
              <div>
                <div style={{fontFamily:ffMono,fontSize:8,letterSpacing:3,color:text2,textTransform:'uppercase',marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${border2}`}}>Cabinet</div>
                {['Viktor Hale','Lena Marsh','Dmitri Volkov','Chen Wei','Sofia Reyes'].map(n=>(
                  <div key={n} style={{padding:'9px 10px',background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.05)`,marginBottom:5,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#27ae60',flexShrink:0}}/>
                    <div style={{fontFamily:ffMono,fontSize:10,color:'#c4beb0'}}>{n}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'world' && (
              <div>
                <div style={{fontFamily:ffMono,fontSize:8,letterSpacing:3,color:text2,textTransform:'uppercase',marginBottom:10,paddingBottom:5,borderBottom:`1px solid ${border2}`}}>Live Players</div>
                {['StarikVlad · Russia','DragonWei · China','MacroGhost · France'].map(p=>(
                  <div key={p} style={{padding:'9px 10px',background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.05)`,marginBottom:5,fontFamily:ffMono,fontSize:10,color:'#c4beb0'}}>
                    🟢 {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlobeSettingsProvider>
  );
}
