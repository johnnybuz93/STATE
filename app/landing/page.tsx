'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlobeSettingsProvider, useGlobeSettings } from '@/contexts/GlobeSettingsContext';

const GlobeCanvas = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{background:'#04060c'}} />,
});

function GlobeBg() {
  const settings = useGlobeSettings();
  return (
    <div style={{position:'fixed',inset:0,zIndex:0,opacity:0.55,pointerEvents:'none',filter:'saturate(0.8)'}}>
      <GlobeCanvas {...settings} />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('digital_state_username');
    if (saved) setUsername(saved);
  }, []);

  function doLogin() {
    const val = username.trim();
    if (!val) { setError('Callsign required.'); return; }
    if (val.length < 3) { setError('Minimum 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(val)) { setError('Letters, numbers, _ and - only.'); return; }
    setError('');
    localStorage.setItem('digital_state_username', val);
    localStorage.setItem('digital_state_last_login', Date.now().toString());
    router.push('/game');
  }

  return (
    <GlobeSettingsProvider>
      <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:'#04060c',color:'#c8c2b4',fontFamily:"'Rajdhani',sans-serif",position:'relative'}}>

        {/* Globe background */}
        <GlobeBg />

        {/* Grid overlay */}
        <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(184,150,62,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(184,150,62,0.035) 1px,transparent 1px)',
          backgroundSize:'72px 72px',
          maskImage:'radial-gradient(ellipse 90% 90% at 50% 50%,black 0%,transparent 75%)'
        }}/>

        {/* Scanlines */}
        <div style={{position:'fixed',inset:0,zIndex:2,pointerEvents:'none',
          background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)'
        }}/>

        {/* Version */}
        <div style={{position:'fixed',top:20,right:24,zIndex:10,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:2,color:'#5e5a52',opacity:0.4}}>
          BUILD 0.1.0 · ALPHA
        </div>

        {/* Main content */}
        <div style={{position:'relative',zIndex:5,width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>

          {/* Badge */}
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:4,color:'#b8963e',border:'1px solid rgba(184,150,62,0.09)',padding:'5px 16px',marginBottom:28}}>
            2047 · MULTIPLAYER WORLD DOMINATION
          </div>

          {/* Title */}
          <div style={{textAlign:'center',marginBottom:12}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(48px,9vw,104px)',fontWeight:900,letterSpacing:6,textTransform:'uppercase',color:'#fff',lineHeight:1}}>
              Digital <span style={{color:'transparent',WebkitTextStroke:'1px rgba(184,150,62,0.7)'}}>State</span>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,letterSpacing:3,color:'#5e5a52',marginTop:16,textTransform:'uppercase',lineHeight:1.8}}>
              Every empire begins with a single <span style={{color:'#b8963e'}}>decision.</span><br/>
              Make yours count — the world is watching.
            </div>
          </div>

          {/* Divider */}
          <div style={{width:1,height:40,background:'linear-gradient(180deg,transparent,rgba(184,150,62,0.22),transparent)',margin:'24px auto'}}/>

          {/* Login box */}
          <div style={{width:'100%',maxWidth:360}}>
            <label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:3,color:'#5e5a52',textTransform:'uppercase',marginBottom:8,display:'block'}}>
              Commander Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              placeholder="enter your callsign"
              maxLength={24}
              style={{width:'100%',padding:'13px 16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(184,150,62,0.09)',color:'#c8c2b4',fontFamily:"'Share Tech Mono',monospace",fontSize:14,letterSpacing:2,outline:'none',marginBottom:8}}
            />
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'#c0392b',marginBottom:8,minHeight:16}}>{error}</div>
            <button
              onClick={doLogin}
              style={{width:'100%',padding:14,background:'transparent',border:'1px solid #b8963e',color:'#f0cc80',fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,letterSpacing:4,textTransform:'uppercase',cursor:'pointer'}}
            >
              Enter the State
            </button>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:1,color:'#5e5a52',textAlign:'center',marginTop:10}}>
              No account needed — <span style={{color:'#b8963e',cursor:'pointer'}} onClick={doLogin}>your callsign is your identity</span>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div style={{position:'fixed',bottom:28,left:0,right:0,zIndex:10,display:'flex',gap:12,alignItems:'center',justifyContent:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'11px 24px',width:220,background:'rgba(4,6,12,0.7)',border:'1px solid rgba(184,150,62,0.09)',fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:1,color:'#5e5a52'}}>
            <span style={{fontSize:8,letterSpacing:2,padding:'2px 6px',background:'rgba(184,150,62,0.1)',border:'1px solid rgba(184,150,62,0.09)',color:'#b8963e'}}>CA</span>
            <span>Contract: Coming Soon</span>
          </div>
          <a href="https://x.com/DigitalStateGame" target="_blank" rel="noreferrer"
            style={{display:'flex',alignItems:'center',gap:8,padding:'11px 24px',width:220,background:'rgba(4,6,12,0.7)',border:'1px solid rgba(184,150,62,0.09)',fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'#5e5a52',textDecoration:'none'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Follow @DigitalStateGame
          </a>
        </div>
      </div>
    </GlobeSettingsProvider>
  );
}
