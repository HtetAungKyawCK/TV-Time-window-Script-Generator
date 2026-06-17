/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IndicatorSettings } from '../types';
import { generatePineScript } from '../utils/pineGenerator';
import { Clipboard, Check, Download, ExternalLink, HelpCircle, FileCode, CheckCircle, Terminal } from 'lucide-react';

interface PineCodePanelProps {
  settings: IndicatorSettings;
}

export const PineCodePanel: React.FC<PineCodePanelProps> = ({ settings }) => {
  const [copied, setCopied] = useState(false);
  const code = generatePineScript(settings).trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${settings.indicatorName.replace(/\s+/g, '_') || 'NY_Session_Lines'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Code Display Area */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <div className="bg-[#1c2030] rounded-t-xl border-t border-x border-[#2a2e39] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-[#2962ff]" />
            <span className="text-xs font-mono font-bold text-white">Pine Script (v5) Code</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all text-white cursor-pointer ${
                copied ? 'bg-[#26a69a]' : 'bg-[#2962ff] hover:bg-[#1a52f0]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied! (ကူးယူပြီး)
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5 text-white" />
                  Copy Code (ကုဒ်ယူရန်)
                </>
              )}
            </button>

            {/* Download script btn */}
            <button
              onClick={handleDownload}
              className="p-1.5 bg-[#2a2e39] hover:bg-[#363a45] rounded text-gray-300 hover:text-white transition cursor-pointer"
              title="ကုဒ်ဖိုင် ဒေါင်းလုဒ်လုပ်ရန်"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="bg-[#131722] border border-[#2a2e39] p-4 font-mono text-xs text-[#d1d4dc] overflow-auto h-[480px] rounded-b-xl shadow-inner scrollbar-thin">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">{code}</pre>
        </div>

        {/* ERROR WARNING CALLED OUT */}
        <div className="mt-4 p-4 bg-[#f23645]/10 border border-[#f23645]/30 rounded-xl text-xs space-y-2">
          <h4 className="font-bold text-[#f23645] flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-[#f23645]" />
            ⚠️ IMPORTANT TRADINGVIEW ERROR FIX (အမှားဖြေရှင်းနည်း)
          </h4>
          <div className="text-[#a3a6af] leading-relaxed text-[11px] space-y-2.5">
            <p>
              အကယ်၍ TradingView Pine Editor တွင် <strong className="text-[#f23645] font-bold">"The 'indicator' function does not have an argument with the name 'max_lines_limit'"</strong> ဟု error တက်ပါက ၎င်းသည် အောက်ပါအချက်ကြောင့် ဖြစ်ပါသည် -
            </p>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>
                <strong className="text-white">အဓိကအကြောင်းအရင်း -</strong> ကုဒ်၏ ပထမဆုံးစာကြောင်းဖြစ်သော <code className="bg-[#2a2e39] px-1.5 py-0.5 rounded text-[#ff9800] font-mono">//@version=5</code> ၏ ရှေ့တွင် Space (ကွက်လပ်) သို့မဟုတ် Tab များ ခြားသော်လည်းကောင်း၊ ပါဝင်နေခြင်းကြောင့် ဖြစ်သည်။
              </li>
              <li>
                <strong className="text-white">ကျော်လွှားရန် နည်းလမ်း -</strong> Pine Editor ထဲတွင် ရှိသော Line 1 ရဲ့ <code className="bg-[#2a2e39] px-1.5 py-0.5 rounded text-white font-mono">//@version=5</code> စာသား၏ ဘယ်ဘက်ဘေးတွင် (အစအဆုံး) Space (ကွက်လပ်) မရှိအောင် Backspace ဖြင့် ဖျက်ပြီး <strong className="text-white">ဘယ်ဘက်ဘောင်အစွန်းဆုံးသို့ ကပ်ပေးလိုက်ပါ။</strong>
              </li>
              <li>
                <strong className="text-[#26a69a] font-bold">ဘာကြောင့်လဲ -</strong> Pine Script စည်းကမ်းချက်အရ Version Compiler ညွှန်ကြားချက် <code className="bg-[#2a2e39] px-1.5 py-0.5 rounded text-white font-mono">//@version=5</code> သည် စာကြောင်း၏ ပထမဆုံး အက္ခရာအစွန်းတွင် ရှိနေရမည်ဖြစ်ပြီး Space များ ပါဝင်နေပါက Pine compiler သည် Version 5 ကို ignore လုပ်ကာ Version 4 သို့မဟုတ် 3 အနေဖြင့်သာ တွက်ချက်ပြီး max_lines_limit မရှိပါဟူ၍ အမှားများ ပြသနေမည် ဖြစ်သည်။
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Guide & Instructions Panel */}
      <div className="lg:col-span-5 space-y-5">
        {/* Step-by-step Setup Guide */}
        <div className="bg-[#1e222d] p-5 rounded-xl border border-[#2a2e39] shadow-sm">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2e39]">
            <HelpCircle className="h-4 w-4 text-[#2962ff]" />
            TradingView တွင် ကုဒ်ထည့်သွင်းနည်း (Setup Guide)
          </h3>

          <div className="relative border-l-2 border-[#2a2e39] ml-2.5 pl-4 space-y-5">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-[#2962ff] text-white font-bold text-[9px] flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-white">ကုဒ်ကူးယူပါ</h4>
              <p className="text-[11px] text-[#a3a6af] mt-1 leading-relaxed">
                အပေါ်ရှိ <strong className="text-[#2962ff] font-bold">"Copy Code"</strong> ခလုတ်ကို နှိပ်ပြီး ထုတ်လုပ်ထားသော Pine Script တစ်ခုလုံးကို ကလစ်ဘုတ်တွင် သိမ်းဆည်းပါ။
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-[#2962ff] text-white font-bold text-[9px] flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-white">TradingView Chart ကိုဖွင့်ပါ</h4>
              <p className="text-[11px] text-[#a3a6af] mt-1 leading-relaxed">
                <a 
                  href="https://www.tradingview.com/chart/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#2962ff] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  TradingView Chart <ExternalLink className="h-3 w-3" />
                </a> ကို ဖွင့်ပြီး သင်ကြည့်ရှုလိုသော ဥပမာ EURUSD သို့မဟုတ် NASDAQ Chart သို့ သွားပါ။
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-[#2962ff] text-white font-bold text-[9px] flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-white">Pine Editor ကို ဖွင့်ပါ</h4>
              <p className="text-[11px] text-[#a3a6af] mt-1 leading-relaxed">
                Chart မျက်နှာပြင်၏ အောက်ခြေရှိ <strong className="text-white font-semibold">"Pine Editor"</strong> Tabs ကို နှိပ်ပြီး ဖွင့်ပါ။ (အကယ်၍ ကုဒ်အဟောင်းများ ရှိနေပါက စာရွက်လွတ်ရရန် 'New' ကို နှိပ်နိုင်သည်)။
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-[#2962ff] text-white font-bold text-[9px] flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-white">Paste လုပ်၍ Add target လုပ်ပါ</h4>
              <p className="text-[11px] text-[#a3a6af] mt-1 leading-relaxed">
                Pine Editor ရှိ ကုဒ်နဂိုစာသားများကို ဖျက်ပြီး မိမိကူးလာသော สစ္ဆေကို Paste လုပ်ပါ။ ထို့နောက် ညာဘက်အပေါ်ရှိ <strong className="text-[#26a69a] font-semibold text-xs">"Add to chart"</strong> ခလုတ်ကို နှိပ်ပါ။
              </p>
            </div>

            {/* Step 5 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-[#26a69a] text-white font-bold text-[9px] flex items-center justify-center">✓</span>
              <h4 className="text-xs font-bold text-[#26a69a]">NY Timezone သေချာပါစေ</h4>
              <p className="text-[11px] text-[#a3a6af] mt-1 leading-relaxed">
                TradingView ၏ ညာဘက်အောက်ထောင့်တွင် ရှိသော Timezone အား <strong className="text-white font-semibold">"UTC-4" သို့မဟုတ် "UTC-5" (America/New_York)</strong> အဖြစ် ပြောင်းပေးရန် မမေ့ပါနှင့်။ ၎င်းသည် DST အလိုက် မျဉ်းများ ကွက်တိကျစေမည် ဖြစ်သည်။
              </p>
            </div>
          </div>
        </div>

        {/* Feature Summary Detail */}
        <div className="bg-[#26a69a]/10 border border-[#26a69a]/20 p-5 rounded-xl text-xs space-y-3">
          <h4 className="font-bold text-[#26a69a] flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-[#26a69a]" />
            ထည့်သွင်းထားသော စွမ်းဆောင်ရည်များ
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-[#a3a6af] leading-relaxed text-[11px]">
            <li>နယူးယောက်ရဲ့ standard (EST) နဲ့ နေ့အလင်းရောင်သုံးစွဲချိန် (EDT) DST တွေကို ရာသီအလိုက် automatic ကွက်တိတွက်ချက်ပေးပါတယ်။</li>
            <li>ဒေါင်လိုက်မျဉ်းကို အစက်/မျဉ်းတို (dot-dash / dashed) ပုံစံဖြင့် စနစ်တကျ ပြသပေးပါသည်။</li>
            <li>မျဉ်း၏ အထူ (Width) ကိုလည်း Tradingview chart input settings မှဖြစ်စေ၊ ဤနေရာမှဖြစ်စေ လိုသလောက် ပြင်ဆင်နိုင်သည်။</li>
            <li>မျဉ်းတစ်ခုချင်းစီ၏ သက်ဆိုင်ရာ NY အချိန် (ဥပမာ- <span className="font-mono text-[#2962ff] font-bold">9:30 AM</span>) စာလုံးကပ်ကတ်ပြားများကို ထည့်သွင်းပေးထားပြီး စာလုံးအရောင်၊ Label နေရာများကို overlay setting ကစားနိုင်ပါသည်။</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
