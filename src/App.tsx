/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { IndicatorSettings, TimeMark } from './types';
import { ChartSimulator } from './components/ChartSimulator';
import { IndicatorCustomizer } from './components/IndicatorCustomizer';
import { PineCodePanel } from './components/PineCodePanel';
import { 
  SlidersHorizontal, 
  BarChart3, 
  Code, 
  BookOpen, 
  Settings2, 
  DollarSign, 
  CloudSun,
  Globe,
  TrendingUp,
  LineChart
} from 'lucide-react';

const DEFAULT_TIMES: TimeMark[] = [
  { id: 't1', hour: 19, minute: 0, label: 'Asia Session Start', enabled: true, colorOverride: '#833ab4' },
  { id: 't2', hour: 21, minute: 0, label: 'Asia Mid-Session', enabled: true, colorOverride: '#833ab4' },
  { id: 't3', hour: 2, minute: 0, label: 'London Pre-Open', enabled: true, colorOverride: '#fbc02d' },
  { id: 't4', hour: 3, minute: 30, label: 'London Open Macro', enabled: true, colorOverride: '#2962ff' },
  { id: 't5', hour: 5, minute: 0, label: 'London Session Mid', enabled: true, colorOverride: '#ef5350' },
  { id: 't6', hour: 7, minute: 0, label: 'NY Session Pre-Open', enabled: true, colorOverride: '#833ab4' },
  { id: 't7', hour: 8, minute: 30, label: 'NY High-Impact News', enabled: true, colorOverride: '#fbc02d' },
  { id: 't8', hour: 9, minute: 30, label: 'NY Equity Market Open', enabled: true, colorOverride: '#2962ff' },
  { id: 't9', hour: 10, minute: 0, label: 'NY AM Session Macro', enabled: true, colorOverride: '#2962ff' },
  { id: 't10', hour: 10, minute: 30, label: 'Silver Bullet Range', enabled: true, colorOverride: '#ef5350' },
  { id: 't11', hour: 11, minute: 30, label: 'London Close Macro', enabled: true, colorOverride: '#26a69a' },
  { id: 't12', hour: 12, minute: 30, label: 'NY Market Lunch Hour', enabled: true, colorOverride: '#ef5350' },
  { id: 't13', hour: 13, minute: 30, label: 'NY PM Pre-Market', enabled: true, colorOverride: '#833ab4' },
  { id: 't14', hour: 14, minute: 0, label: 'NY PM Macro Window', enabled: true, colorOverride: '#2962ff' },
  { id: 't15', hour: 15, minute: 30, label: 'Bond Market Settlement', enabled: true, colorOverride: '#fbc02d' },
  { id: 't16', hour: 16, minute: 0, label: 'NY Stock Market Close', enabled: true, colorOverride: '#26a69a' }
];

const INITIAL_SETTINGS: IndicatorSettings = {
  indicatorName: 'New York Session Lines (DST Adjusted)',
  lineStyle: 'dashed',
  lineWidth: 2,
  lineColor: '#2962ff', // TradingView Signature Blue
  textColor: '#FFFFFF', // High Contrast White
  showLabels: true,
  useBgColor: true,
  labelBgColor: '#1c2030', // Deep Space label background
  labelPosition: 'abovebar',
  fontSize: 'small',
  timezone: 'America/New_York',
  times: DEFAULT_TIMES,
  maxLines: 500,
  historyDays: 7
};

export default function App() {
  const [settings, setSettings] = useState<IndicatorSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'pinescript'>('sandbox');

  const handleReset = () => {
    if (window.confirm('ချိန်ညှိချက်အားလုံးကို မူလသတ်မှတ်ထားသောအခြေအနေသို့ ပြန်ပြောင်းလိုသလားခင်ဗျာ။')) {
      setSettings(INITIAL_SETTINGS);
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] font-sans antialiased pb-12">
      {/* High Density TradingView-inspired Header */}
      <header className="sticky top-0 z-50 bg-[#1e222d] border-b border-[#2a2e39] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2962ff] rounded flex items-center justify-center font-bold text-white text-base shadow-lg shadow-[#2962ff]/20">
              TV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  TradingView NY Session Lines Generator
                </h1>
                <span className="text-[10px] bg-[#2962ff]/20 text-[#2962ff] px-1.5 py-0.5 rounded border border-[#2962ff]/30 font-semibold font-mono">
                  PINE v5
                </span>
              </div>
              <p className="text-xs text-[#787b86] mt-0.5 font-medium">
                နယူးယောက် အချိန်ဇုန် (DST Auto-adjusted) မားကတ် အချိန်မျဉ်းများ တောက်စနစ်
              </p>
            </div>
          </div>

          {/* Quick Informational Stats */}
          <div className="flex items-center gap-2 md:gap-4 text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-2 bg-[#2a2e39] rounded px-2.5 py-1.5 border border-[#363a45]">
              <Globe className="h-3.5 w-3.5 text-[#2962ff]" />
              <span className="text-[#898d9a]">NY Timezone (DST):</span>
              <span className="text-white font-bold">America/New_York</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[#2a2e39] rounded px-2.5 py-1.5 border border-[#363a45]">
              <CloudSun className="h-3.5 w-3.5 text-[#26a69a]" />
              <div className="w-2 h-2 rounded-full bg-[#26a69a] animate-pulse"></div>
              <span className="text-[#26a69a] font-bold">AUTO DST ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-6 mt-6">
        {/* Navigation Tab rail */}
        <div className="flex items-center border-b border-[#2a2e39] mb-6 gap-2">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'border-[#2962ff] text-white bg-[#2962ff]/10'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            ၁။ Interactive Chart Simulator (မျဉ်းဆွဲစမ်းသပ်ခန်း)
          </button>
          
          <button
            onClick={() => setActiveTab('pinescript')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pinescript'
                ? 'border-[#2962ff] text-white bg-[#2962ff]/10'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <Code className="h-4 w-4" />
            ၂။ Generated Pine Script v5 Code (TV အညွှန်း ကုဒ်များ)
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'sandbox' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side settings editor panel (5 columns) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#787b86] uppercase tracking-wider">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#2962ff]" />
                <h2>လိုင်းနှင့် အချိန်သတ်မှတ်ချက်များ ပြင်ဆင်ရန်</h2>
              </div>
              <IndicatorCustomizer 
                settings={settings}
                onChange={setSettings}
                onReset={handleReset}
              />
            </div>

            {/* Right side live rendering simulator (7 columns) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6 xl:sticky xl:top-[98px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#787b86] uppercase tracking-wider">
                  <LineChart className="h-3.5 w-3.5 text-[#2962ff]" />
                  <h2>TradingView Live Preview Simulator</h2>
                </div>
                <span className="text-[11px] text-[#787b86] italic">နမူနာ ဈေးနှုန်း တက်ကျနှင့်အတူ ဒေါင်လိုက်မျဉ်းများကို ပြသခြင်း</span>
              </div>
              
              <div className="h-[490px]">
                <ChartSimulator settings={settings} />
              </div>

              {/* Informational helpful tips */}
              <div className="bg-[#1e222d] border border-[#2a2e39] p-4 rounded-xl text-xs space-y-2.5">
                <span className="font-semibold text-[#2962ff] flex items-center gap-1.5">
                  <Settings2 className="h-4 w-4" />
                  TradingView Optimizer Tips
                </span>
                <p className="text-[#a3a6af] leading-relaxed text-[11px]">
                  အပေါ်ဘက်ရှိ Settings Panel တွင် အရောင်၊ ဒေါင်လိုက်မျဉ်းအထူ၊ အဆက်စက်ပုံစံများကို ပြောင်းလဲလိုက်သည်နှင့် ညာဘက်ရှိ Simulator နှင့် Pine Script Code သည် တစ်ပြိုင်နက်တည်း (Instantly) ပြောင်းလဲသွားပါမည်။ စိတ်ကြိုက်ပြင်ဆင်ပြီးပါက ဒုတိယမြောက် tab ဖြစ်သော <strong className="text-[#2962ff] font-medium">"Generated Pine Script v5 Code"</strong> သို့ သွားရောက်၍ ကုဒ်တစ်ခုလုံးအား Tradingview သို့ တစ်ချက်တည်း ကူးယူထည့်သွင်းလိုက်ရုံပင်ဖြစ်ပါသည်။
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#787b86] uppercase tracking-wider">
              <Code className="h-3.5 w-3.5 text-[#2962ff]" />
              <h2>အလိုအလျောက် ထုတ်လုပ်ထားသော အညွှန်း ကုဒ်များနှင့် တပ်ဆင်နည်းလမ်းညွှန်</h2>
            </div>
            <PineCodePanel settings={settings} />
          </div>
        )}
      </main>
    </div>
  );
}
