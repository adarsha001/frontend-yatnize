// import React from 'react'
// import KnowledgeHero from './components/KnowledgeHero'

// const App = () => {
//   return (
//     <div className='bg-red-300'>
//  <KnowledgeHero/>
//     </div>
//   )
// }

// export default App

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import TopoLeaf from './components/hero/TopoLeaf'; 
import YatnizeSystem from './components/YatnizeNavbar';
import Certificate from './components/hero/certifcate.jsx'
// import AskChatGPT from './components/video/ChatGPTConnector.jsx';
import VideoAnalyzer from './components/VideoAnalyzer.jsx';

export default function App() {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      // Adds a soft, premium radial glow behind the canvas

    }}>
 <YatnizeSystem/>
 <Certificate/>
 {/* <AskChatGPT/> */}
 <VideoAnalyzer/>
    </div>
  );
}