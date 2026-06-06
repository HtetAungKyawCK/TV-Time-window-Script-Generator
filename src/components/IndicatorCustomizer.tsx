/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IndicatorSettings, TimeMark, LineStyle, LabelPosition } from '../types';
import { Plus, Trash2, RotateCcw, AlertTriangle, Eye, Calendar, Clock, Sparkles } from 'lucide-react';
import { formatTime12h } from '../utils/pineGenerator';

interface IndicatorCustomizerProps {
  settings: IndicatorSettings;
  onChange: (newSettings: IndicatorSettings) => void;
  onReset: () => void;
}

export const IndicatorCustomizer: React.FC<IndicatorCustomizerProps> = ({
  settings,
  onChange,
  onReset
}) => {
  const [newHour, setNewHour] = useState<number>(9);
  const [newMinute, setNewMinute] = useState<number>(30);
  const [newLabel, setNewLabel] = useState<string>('NY OPEN');

  // Handle setting updates
  const updateSetting = <K extends keyof IndicatorSettings>(key: K, value: IndicatorSettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  // Toggle state of a specific time mark
  const toggleTimeMark = (id: string) => {
    const updatedTimes = settings.times.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    updateSetting('times', updatedTimes);
  };

  // Update label text of a specific mark
  const updateMarkLabel = (id: string, text: string) => {
    const updatedTimes = settings.times.map(t => 
      t.id === id ? { ...t, label: text } : t
    );
    updateSetting('times', updatedTimes);
  };

  // Update specific color override of a mark
  const updateMarkColor = (id: string, color: string) => {
    const updatedTimes = settings.times.map(t => 
      t.id === id ? { ...t, colorOverride: color || undefined } : t
    );
    updateSetting('times', updatedTimes);
  };

  // Remove logical time index
  const removeTimeMark = (id: string) => {
    const updatedTimes = settings.times.filter(t => t.id !== id);
    updateSetting('times', updatedTimes);
  };

  // Add custom new time node mapping
  const addTimeMark = (e: React.FormEvent) => {
    e.preventDefault();
    const newMark: TimeMark = {
      id: `${newHour}-${newMinute}-${Date.now()}`,
      hour: newHour,
      minute: newMinute,
      label: newLabel.trim() || `${newHour}:${newMinute}`,
      enabled: true
    };
    
    // Sort array by hour & minute
    const sortedTimes = [...settings.times, newMark].sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    updateSetting('times', sortedTimes);
    // Reset inputs
    setNewLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Visual Settings Box */}
      <div className="bg-[#1e222d] p-5 rounded-xl border border-[#2a2e39] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2e39]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2962ff]" />
            ဆွဲမည့်မျဉ်းများ၏ ပုံစံသွင်ပြင်များ (Visual Styles)
          </h3>
          <button 
            onClick={onReset}
            className="text-[11px] font-bold text-[#2962ff] hover:text-[#1a52f0] flex items-center gap-1 transition"
            title="အစပုံစံသို့ ပြန်ပြောင်းရန်"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            မူလအတိုင်း ပြန်ထားရန်
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Indicator Name */}
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">
              အညွှန်းအမည် (Indicator Name)
            </label>
            <input 
              type="text" 
              value={settings.indicatorName}
              onChange={(e) => updateSetting('indicatorName', e.target.value)}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
            />
          </div>

          {/* Line Style Selection */}
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">
              ဒေါင်လိုက်မျဉ်းပုံစံ (Vertical Line Style) *
            </label>
            <select 
              value={settings.lineStyle}
              onChange={(e) => updateSetting('lineStyle', e.target.value as LineStyle)}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#2962ff] cursor-pointer"
            >
              <option value="dashed">Dotted-Dashed (Dot-dash / Dashed-line)</option>
              <option value="dotted">Dotted (ပြတ်တောင်းပြတ်တောင်း အဆက်လေးများ)</option>
              <option value="solid">Solid (မျဉ်းဖြောင့်အပိတ်)</option>
            </select>
          </div>

          {/* Line Width Numeric Slider */}
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1">
              မျဉ်းအထူ / အကျယ် (Line Width): <span className="font-mono text-[#2962ff] font-bold">{settings.lineWidth}px</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={settings.lineWidth}
              onChange={(e) => updateSetting('lineWidth', Number(e.target.value))}
              className="w-full h-1.5 bg-[#131722] rounded-lg appearance-none cursor-pointer accent-[#2962ff]"
            />
          </div>

          {/* Label Text Position */}
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">
              အချိန်စာတန်း ပြသမည့်နေရာ (Label Position)
            </label>
            <select 
              value={settings.labelPosition}
              onChange={(e) => updateSetting('labelPosition', e.target.value as LabelPosition)}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#2962ff] cursor-pointer"
            >
              <option value="abovebar">Above Bars (ဘားများ၏အပေါ်ဘက်)</option>
              <option value="belowbar">Below Bars (ဘားများ၏အောက်ဘက်)</option>
            </select>
          </div>

          {/* Default Line Color & Text Color */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#a3a6af] font-medium mb-1.5">
                အခြေခံမျဉ်းအရောင် (Line Color)
              </label>
              <div className="flex gap-1.5 items-center">
                <input 
                  type="color" 
                  value={settings.lineColor}
                  onChange={(e) => updateSetting('lineColor', e.target.value)}
                  className="h-8 w-10 border border-[#2a2e39] bg-[#131722] rounded p-0 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-[#787b86]">{settings.lineColor.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <label className="block text-[#a3a6af] font-medium mb-1.5">
                စာသားအရောင် (Text Color)
              </label>
              <div className="flex gap-1.5 items-center">
                <input 
                  type="color" 
                  value={settings.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="h-8 w-10 border border-[#2a2e39] bg-[#131722] rounded p-0 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-[#787b86]">{settings.textColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Background Highlight Box configuration */}
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">
              စာသား နောက်ခံအရောင် (Text Box Background)
            </label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                <input 
                  type="checkbox" 
                  checked={settings.useBgColor}
                  onChange={(e) => updateSetting('useBgColor', e.target.checked)}
                  className="rounded text-[#2962ff] focus:ring-[#2962ff] h-3.5 w-3.5 border-[#2a2e39] bg-[#131722] cursor-pointer"
                />
                <span className="text-[#d1d4dc]">Background သုံးမည်</span>
              </label>
              {settings.useBgColor && (
                <div className="flex gap-1.5 items-center">
                  <input 
                    type="color" 
                    value={settings.labelBgColor}
                    onChange={(e) => updateSetting('labelBgColor', e.target.value)}
                    className="h-7 w-8 border border-[#2a2e39] bg-[#131722] rounded p-0 cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-[#787b86]">{settings.labelBgColor.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3.5 bg-[#2962ff]/10 border border-[#2962ff]/20 p-3 rounded-lg text-[11px] text-white flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#2962ff] mt-0.5" />
          <div>
            <p className="font-bold text-[#2962ff]">နယူးယောက် စံတော်ချိန် (New York DST Adjustment)</p>
            <p className="mt-0.5 text-[#a3a6af] leading-relaxed">
              ဤအညွှန်း (Indicator) သည် Daylight Saving Time (DST) ကို Tradingview တွင် automatic ညှိနှိုင်းပေးပြီးသား ဖြစ်ပါသည်။ America/New_York session timing ကို တစ်သားတည်း ဖမ်းဆုပ်နိုင်ရန် TV Chart တွင်လည်း Timezone ကို (UTC-4 / UTC-5) New York သို့ ပြောင်းထားပေးရန် အကြံပြုအပ်ပါသည်။
            </p>
          </div>
        </div>
      </div>

      {/* Add Custom Time Mark Trigger Form */}
      <div className="bg-[#1e222d] p-5 rounded-xl border border-[#2a2e39] shadow-sm">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2e39]">
          <Clock className="h-4 w-4 text-[#26a69a]" />
          အချိန်သစ်တစ်ခု ထပ်ထည့်ရန် (Add New Time Trigger)
        </h3>

        <form onSubmit={addTimeMark} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">နာရီ (Hour 24-hr)</label>
            <select
              value={newHour}
              onChange={(e) => setNewHour(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, h) => {
                const isPM = h >= 12;
                const hh = h % 12 === 0 ? 12 : h % 12;
                return (
                  <option key={h} value={h} className="bg-[#1e222d]">
                    {h.toString().padStart(2, '0')} ({hh}:00 {isPM ? 'PM' : 'AM'})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">မိနစ် (Minute)</label>
            <select
              value={newMinute}
              onChange={(e) => setNewMinute(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, mIdx) => {
                const m = mIdx * 5;
                return (
                  <option key={m} value={m} className="bg-[#1e222d]">
                    {m.toString().padStart(2, '0')}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[#a3a6af] font-medium mb-1.5">အညွှန်းစာတန်း (Label Text)</label>
            <input 
              type="text"
              placeholder="ဥပမာ- NY AM OPEN"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#2962ff] text-white font-bold rounded-lg hover:bg-[#1a52f0] transition flex items-center justify-center gap-1.5 h-[34px] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            တိုးသွင်းရန်
          </button>
        </form>
      </div>

      {/* Grid of time windows */}
      <div className="bg-[#1e222d] p-5 rounded-xl border border-[#2a2e39] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2e39]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2962ff]" />
            သတ်မှတ်ထားသော အချိန်စက်ဝန်းများ ({settings.times.length} ခု)
          </h3>
          <span className="text-xs text-[#787b86]">အချိန်များကို ဖွင့်/ပိတ် လုပ်နိုင်သည်။</span>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {settings.times.map((t) => {
            const formatted = formatTime12h(t.hour, t.minute);
            return (
              <div 
                key={t.id}
                className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
                  t.enabled 
                    ? 'bg-[#2962ff]/10 border-[#2962ff]/30 text-white' 
                    : 'bg-[#131722]/40 border-[#2a2e39] text-[#787b86]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Toggle Switch */}
                  <input 
                    type="checkbox"
                    checked={t.enabled}
                    onChange={() => toggleTimeMark(t.id)}
                    className="rounded text-[#2962ff] focus:ring-[#2962ff] h-4 w-4 border-[#2a2e39] bg-[#131722] cursor-pointer"
                  />
                  <div>
                    {/* Time Indicator */}
                    <span className="font-mono font-bold text-[13px] text-white">
                      {formatted}
                    </span>
                    <span className="inline-block ml-2 text-[10px] bg-[#131722] text-[#787b86] px-1.5 py-0.5 rounded border border-[#2a2e39]">
                      (NY Timezone)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end flex-grow sm:flex-grow-0">
                  {/* Label tag updater */}
                  <input 
                    type="text"
                    value={t.label}
                    onChange={(e) => updateMarkLabel(t.id, e.target.value)}
                    disabled={!t.enabled}
                    placeholder="စာတန်းထည့်ရန်"
                    className="w-28 sm:w-36 px-2 py-1 bg-[#131722] border border-[#2a2e39] rounded text-[11px] disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-[#2962ff] text-white"
                  />

                  {/* Line color override override */}
                  <div className="relative group/color shrink-0">
                    <input 
                      type="color"
                      value={t.colorOverride || settings.lineColor}
                      onChange={(e) => updateMarkColor(t.id, e.target.value)}
                      disabled={!t.enabled}
                      className="w-6 h-6 border border-[#2a2e39] bg-[#131722] rounded cursor-pointer disabled:opacity-40 p-0"
                      title="ဤမျဉ်းတစ်ခုတည်းအတွက် အရောင်ရွေးရန်"
                    />
                  </div>

                  {/* Delete button */}
                  <button 
                    onClick={() => removeTimeMark(t.id)}
                    className="p-1 px-1.5 text-[#787b86] hover:text-red-500 rounded hover:bg-[#131722]/60 transition shrink-0"
                    title="ဖျက်ပစ်ရန်"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {settings.times.length === 0 && (
            <div className="text-center py-8 text-gray-400 italic">
              ညပြသရန် အချိန်ဇယားများ မရှိသေးပါ။ အပေါ်ရှိ Form မှတစ်ဆင့် အချိန်သစ်ထည့်သွင်းပေးပါ။
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
