/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IndicatorSettings, TimeMark } from '../types';
import { formatTime12h } from '../utils/pineGenerator';
import { Activity, ZoomIn, ZoomOut, Move, Settings, Eye, Info } from 'lucide-react';

function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#131722' : '#ffffff';
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#131722' : '#ffffff';
  }
  return '#ffffff';
}

interface ChartSimulatorProps {
  settings: IndicatorSettings;
}

interface MockCandle {
  time: Date; // Actual UTC time
  nyTimeString: string; // "HH:MM AM/PM"
  nyHour: number;
  nyMinute: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isMarked: boolean;
  markedLabels: string[];
  markedColors: string[];
}

export const ChartSimulator: React.FC<ChartSimulatorProps> = ({ settings }) => {
  const [zoom, setZoom] = useState<number>(1.2); // zoom scale
  const [scrollOffset, setScrollOffset] = useState<number>(50); // percentage value for scroll position
  const [hoveredCandle, setHoveredCandle] = useState<MockCandle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 420 });

  // Update dimensions based on container element size
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 700,
          height: 420
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Generate deterministic realistic candles for the simulator
  const candles = useMemo(() => {
    const list: MockCandle[] = [];
    const basePrice = 15000; // E-min Nasdaq-like price
    let currentPrice = basePrice;
    
    // Create 150 candles of 5m intervals
    const startTime = new Date(Date.UTC(2026, 5, 5, 12, 0, 0)); // June 5, 2026 12:00 UTC
    
    for (let i = 0; i < 160; i++) {
      const candleTime = new Date(startTime.getTime() + i * 5 * 60 * 1000);
      
      // Calculate America/New_York time (NY Time)
      // For general simulation, NY in June is EDT (UTC-4)
      const nyTime = new Date(candleTime.getTime() - 4 * 60 * 60 * 1000);
      const nyHour = nyTime.getUTCHours();
      const nyMinute = nyTime.getUTCMinutes();
      
      const ampm = nyHour >= 12 ? 'PM' : 'AM';
      const displayHour = nyHour % 12 === 0 ? 12 : nyHour % 12;
      const displayMinute = nyMinute.toString().padStart(2, '0');
      const nyTimeString = `${displayHour}:${displayMinute} ${ampm}`;

      // Deteministic random walk standard simulation (trending and session relative moves)
      let change = Math.sin(i / 10) * 12 + (Math.random() - 0.49) * 35;
      
      // Add heavy volume & spike during NY Open (9:30 AM NY time)
      if (nyHour === 9 && nyMinute >= 30 && nyHour <= 10) {
        change *= 2.2;
      }
      
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      
      currentPrice = close;

      // Find any triggers
      const matches: string[] = [];
      const colors: string[] = [];
      
      settings.times.forEach(t => {
        if (t.enabled && t.hour === nyHour && t.minute === nyMinute) {
          matches.push(t.label || formatTime12h(t.hour, t.minute));
          colors.push(t.colorOverride || settings.lineColor);
        }
      });

      list.push({
        time: candleTime,
        nyTimeString,
        nyHour,
        nyMinute,
        open,
        high,
        low,
        close,
        isMarked: matches.length > 0,
        markedLabels: matches,
        markedColors: colors
      });
    }
    return list;
  }, [settings.times, settings.lineColor]);

  // Dimensions of SVG area
  const padding = { top: 40, right: 70, bottom: 40, left: 20 };
  const chartHeight = dimensions.height - padding.top - padding.bottom;
  const chartWidth = dimensions.width - padding.left - padding.right;

  // Horizontal range of bars displayed based on Zoom & Scroll Offset
  const visibleBarsCount = Math.max(10, Math.floor(60 / zoom));
  const maxOffset = candles.length - visibleBarsCount;
  const startIndex = Math.min(
    maxOffset,
    Math.max(0, Math.floor((scrollOffset / 100) * maxOffset))
  );
  const visibleCandles = candles.slice(startIndex, startIndex + visibleBarsCount);

  // Price calculations
  const prices = visibleCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices) - 10;
  const maxPrice = Math.max(...prices) + 10;
  const priceRange = maxPrice - minPrice;

  // SVG Scalers
  const getX = (index: number) => {
    return padding.left + (index / (visibleBarsCount - 1 || 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / (priceRange || 1)) * chartHeight;
  };

  // Grid levels for pricing scale (y-axis)
  const gridLevels = useMemo(() => {
    const levels = [];
    const step = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      levels.push(minPrice + step * i);
    }
    return levels;
  }, [minPrice, maxPrice, priceRange]);

  return (
    <div className="bg-[#131722] border border-[#2a2e39] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full select-none">
      {/* Chart Toolbar */}
      <div className="bg-[#1c2030] px-4 py-3 border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#2962ff] animate-pulse" />
          <span className="font-semibold text-gray-100 tracking-wider">NASDAQ E-MINI SIMULATOR (NQ1!)</span>
          <span className="bg-[#2962ff]/10 text-[#2962ff] font-mono text-[10px] px-2 py-0.5 rounded border border-[#2962ff]/20 uppercase font-bold">
            EST/EDT Timezone Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#2a2e39]/50 rounded-lg p-0.5 border border-[#2a2e39]">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
              className="p-1 px-1.5 hover:bg-[#2a2e39] rounded transition text-gray-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-gray-400">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1 px-1.5 hover:bg-[#2a2e39] rounded transition text-gray-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Move className="h-3.5 w-3.5 text-gray-500" />
            <input 
              type="range"
              min="0"
              max="100"
              value={scrollOffset}
              onChange={(e) => setScrollOffset(Number(e.target.value))}
              className="w-24 accent-[#2962ff] h-1 bg-[#2a2e39] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* OHLC Bar Detail Info on Hover */}
      <div className="bg-[#151926] px-4 py-2 border-b border-[#232733] flex items-center gap-4 text-[11px] font-mono text-gray-400 h-9 shrink-0">
        {hoveredCandle ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full">
            <span className="text-gray-100 font-medium">NY TIME: <span className="text-amber-400">{hoveredCandle.nyTimeString}</span></span>
            <span>O: <span className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.open.toFixed(1)}</span></span>
            <span>H: <span className="text-gray-200">{hoveredCandle.high.toFixed(1)}</span></span>
            <span>L: <span className="text-gray-200">{hoveredCandle.low.toFixed(1)}</span></span>
            <span>C: <span className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.close.toFixed(1)}</span></span>
            {hoveredCandle.isMarked && (
              <span className="ml-auto bg-[#2962ff]/20 text-[#2962ff] text-[10px] px-1.5 py-0.5 rounded border border-[#2962ff]/30 font-bold">
                ⭐ Mark: {hoveredCandle.markedLabels.join(', ')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 italic">
            <Info className="h-3.5 w-3.5" />
            <span>ဘားတစ်ခုပေါ်သို့ Hover ထောက်၍ New York စံတော်ချိန်နှင့် OHLC ဈေးနှုန်းများကို ကြည့်ရှုနိုင်ပါသည်။</span>
          </div>
        )}
      </div>

      {/* Main SVG Chart Area */}
      <div ref={containerRef} className="flex-1 relative bg-[#131722]">
        <svg 
          width={dimensions.width} 
          height={dimensions.height} 
          className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden"
        >
          {/* Background Grid Lines (Horizontal) */}
          {gridLevels.map((val, idx) => (
            <g key={`ygrid-${idx}`}>
              <line 
                x1={padding.left} 
                y1={getY(val)} 
                x2={padding.left + chartWidth} 
                y2={getY(val)} 
                stroke="#1f222e" 
                strokeWidth="1" 
                strokeDasharray="4 2"
              />
              {/* Y-axis values on the right */}
              <text 
                x={padding.left + chartWidth + 8} 
                y={getY(val) + 4} 
                className="fill-gray-500 font-mono text-[9px]"
              >
                {val.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Time axis Grid lines (Vertical) */}
          {visibleCandles.map((candle, idx) => {
            // Draw lighter grid marks on hours
            const showTimeGrid = candle.nyMinute === 0 || candle.nyMinute === 30;
            const x = getX(idx);
            
            return (
              <g key={`timegrid-${idx}`}>
                {showTimeGrid && (
                  <line 
                    x1={x} 
                    y1={padding.top} 
                    x2={x} 
                    y2={padding.top + chartHeight} 
                    stroke="#181c27" 
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* DRAW CUSTOM INDICATOR SESSION MARK LINES */}
          {visibleCandles.map((candle, idx) => {
            if (!candle.isMarked) return null;
            const x = getX(idx);

            // Determine custom line style dash array
            let strokeDash = '5 3'; // default dashed
            if (settings.lineStyle === 'dotted') strokeDash = '1.5 2.5';
            if (settings.lineStyle === 'solid') strokeDash = '0'; // no dashes

            const lineColor = candle.markedColors[0] || settings.lineColor;
            
            return (
              <g key={`markline-${idx}`} className="group/line">
                {/* Vertical Mark Line from top to bottom of the chart */}
                <line 
                  x1={x} 
                  y1={padding.top - 10} 
                  x2={x} 
                  y2={padding.top + chartHeight + 10} 
                  stroke={lineColor} 
                  strokeWidth={settings.lineWidth} 
                  strokeDasharray={strokeDash}
                  className="transition-all duration-300"
                />

                {/* Vertical Line Hover Glow Effect */}
                <line 
                  x1={x} 
                  y1={padding.top} 
                  x2={x} 
                  y2={padding.top + chartHeight} 
                  stroke={lineColor} 
                  strokeWidth={settings.lineWidth + 4} 
                  strokeOpacity="0.12"
                  className="opacity-0 group-hover/line:opacity-100 transition-opacity duration-200"
                />

                {/* Horizontal Label Box (with customizable alignment & background) */}
                {settings.showLabels && candle.markedLabels.map((label, labelIdx) => {
                  const isAbove = settings.labelPosition === 'abovebar';
                  const labelY = isAbove 
                    ? padding.top + 15 + (labelIdx * 20) 
                    : padding.top + chartHeight - 20 - (labelIdx * 20);

                  const textStr = label;
                  // Dynamic Font sizing
                  const fs = settings.fontSize === 'small' ? '8px' : settings.fontSize === 'large' ? '12px' : '10px';
                  const bgFill = settings.useBgColor ? lineColor : 'transparent';
                  const textColor = settings.useBgColor ? getContrastTextColor(lineColor) : settings.textColor;

                  return (
                    <g key={`lbl-${idx}-${labelIdx}`} className="pointer-events-none">
                      {settings.useBgColor && (
                        <rect 
                          x={x - 65} 
                          y={labelY - 11} 
                          width="130" 
                          height="16" 
                          rx="3" 
                          fill={bgFill}
                          stroke={lineColor}
                          strokeWidth="1.5"
                          strokeOpacity="0.9"
                        />
                      )}
                      
                      <text 
                        x={x} 
                        y={labelY + 1} 
                        textAnchor="middle" 
                        fill={textColor} 
                        className="font-mono font-bold tracking-wide text-center"
                        style={{ fontSize: fs }}
                      >
                        {textStr}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* CANDLESTICKS */}
          {visibleCandles.map((candle, idx) => {
            const x = getX(idx);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            
            const isGreen = candle.close >= candle.open;
            const barWidth = Math.max(3, Math.min(22, 6 * zoom));
            
            return (
              <g 
                key={`candle-${idx}`} 
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredCandle(candle)}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                {/* Wick */}
                <line 
                  x1={x} 
                  y1={highY} 
                  x2={x} 
                  y2={lowY} 
                  stroke={isGreen ? '#089981' : '#f23645'} 
                  strokeWidth="1.5"
                />
                
                {/* Solid Body */}
                <rect 
                  x={x - barWidth / 2} 
                  y={Math.min(openY, closeY)} 
                  width={barWidth} 
                  height={Math.max(1.5, Math.abs(openY - closeY))} 
                  fill={isGreen ? '#26a69a' : '#ef5350'} 
                  stroke={isGreen ? '#089981' : '#f23645'} 
                  strokeWidth="1"
                  rx="1"
                />
                
                {/* Active hover vertical cursor rule */}
                <rect 
                  x={x - 1} 
                  y={padding.top} 
                  width="2" 
                  height={chartHeight} 
                  fill="white" 
                  fillOpacity="0.06" 
                  className="opacity-0 group-hover:opacity-100 pointer-events-none"
                />
              </g>
            );
          })}

          {/* XAXIS Labels (New York Time stamps) */}
          {visibleCandles.map((candle, idx) => {
            const isHourMark = candle.nyMinute === 0;
            const isHalfHourMark = candle.nyMinute === 30;
            const x = getX(idx);

            // Stagger labels so they don't overlap when zoomed out
            const shouldLabel = zoom > 1.2 
              ? (isHourMark || isHalfHourMark) 
              : isHourMark && candle.nyHour % 2 === 0;

            if (!shouldLabel) return null;

            return (
              <g key={`xlab-${idx}`}>
                <line 
                  x1={x} 
                  y1={padding.top + chartHeight} 
                  x2={x} 
                  y2={padding.top + chartHeight + 6} 
                  stroke="#2a2e39" 
                  strokeWidth="1"
                />
                <text 
                  x={x} 
                  y={padding.top + chartHeight + 18} 
                  textAnchor="middle" 
                  className="fill-gray-400 font-mono"
                  style={{ fontSize: '9px' }}
                >
                  {candle.nyTimeString.replace(':00', '')}
                </text>
              </g>
            );
          })}

          {/* Border outlines */}
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={chartWidth} 
            height={chartHeight} 
            fill="none" 
            stroke="#1c2030" 
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Simulator Stats Footer */}
      <div className="bg-[#1c2030] px-4 py-2 border-t border-[#2a2e39] flex justify-between items-center text-[10px] font-mono text-gray-400">
        <div>
          <span>Candles: {candles.length} | Visible: {visibleCandles.length}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ef5350]"></span> Bearish
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#26a69a]"></span> Bullish
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-3 bg-amber-400 border-dashed"></span> TV Session Vertical Lines
          </span>
        </div>
      </div>
    </div>
  );
};
