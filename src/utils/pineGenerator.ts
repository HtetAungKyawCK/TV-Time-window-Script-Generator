/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndicatorSettings, TimeMark } from '../types';

/**
 * Utility to convert 24h hour to 12h representation for label text
 */
export function formatTime12h(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
}

/**
 * Generates the fully functional Pine Script (v5) code based on configuration settings.
 */
export function generatePineScript(settings: IndicatorSettings): string {
  const activeTimes = settings.times.filter(t => t.enabled);
  
  // Map our UI style to Pine script styles
  let pineStyle = 'line.style_dashed';
  if (settings.lineStyle === 'solid') pineStyle = 'line.style_solid';
  if (settings.lineStyle === 'dotted') pineStyle = 'line.style_dotted';

  // Map label position to Pine Script yloc or label styles
  let ylocStr = 'yloc.abovebar';
  let labelStyleStr = 'label.style_label_down';
  
  if (settings.labelPosition === 'abovebar') {
    ylocStr = 'yloc.abovebar';
    labelStyleStr = 'label.style_label_down';
  } else if (settings.labelPosition === 'belowbar') {
    ylocStr = 'yloc.belowbar';
    labelStyleStr = 'label.style_label_up';
  } else if (settings.labelPosition === 'price_top') {
    ylocStr = 'yloc.price'; // custom handling needed or we use high prices
    labelStyleStr = 'label.style_label_down';
  } else {
    ylocStr = 'yloc.price';
    labelStyleStr = 'label.style_label_up';
  }

  const linesCount = activeTimes.length;

  return `//@version=5
// This indicator was automatically generated and optimized by the TradingView NY Session Lines Generator.
// Designed with automatic New York (EST/EDT) DST handling.
indicator("${settings.indicatorName || 'NY Session Lines (DST Adjusted)'}", overlay=true)

// ==========================================
// 🛠️ INPUT SETTINGS (မြန်မာလို စိတ်ကြိုက်ပြင်ဆင်ရန် Input များ)
// ==========================================
grp_style = "🎨 Line & Label Appearance (ဗဟိုပုံစံပြင်ပရုပ်ပိုင်း)"
line_style_sel = input.string("${settings.lineStyle.toUpperCase()}", "Line Style", options=["SOLID", "DASHED", "DOTTED"], group=grp_style, tooltip="Dotted-Dashed vertical line style\\n(ဒေါင်လိုက်မျဉ်းပုံစံ)")
line_width_inp = input.int(${settings.lineWidth}, "Line Width (1-10)", minval=1, maxval=10, group=grp_style, tooltip="Line thickness (ဒေါင်လိုက်မျဉ်းအထူ)")
line_color_inp = input.color(${colorToPine(settings.lineColor)}, "Default Line Color", group=grp_style, tooltip="Default color for vertical marks (ဒေါင်လိုက်မျဉ်းအရောင်)")
text_color_inp = input.color(${colorToPine(settings.textColor)}, "Label Text Color", group=grp_style, tooltip="Text color for labels (စာသားအရောင်)")
label_pos_sel = input.string("${settings.labelPosition === 'abovebar' ? 'Above Bars' : 'Below Bars'}", "Label Position", options=["Above Bars", "Below Bars"], group=grp_style, tooltip="Where to place time labels (Labels ပြသမည့်နေရာ)")
font_size_sel = input.string("${settings.fontSize.toUpperCase()}", "Label Font Size", options=["SMALL", "NORMAL", "LARGE"], group=grp_style, tooltip="Size of label text")
show_labels_inp = input.bool(${settings.showLabels}, "Show Time Labels", group=grp_style, tooltip="Toggle labels on/off (အချိန်စာသားများ ဖော်ပြမလား)")
use_bg_inp = input.bool(${settings.useBgColor}, "Use Label Background Color", group=grp_style, tooltip="Toggle background box behind words")
bg_color_inp = input.color(${colorToPine(settings.labelBgColor)}, "Label Background Color", group=grp_style)

// ==========================================
// ⏰ TIME TRIGGER CONTROL (အချိန်တစ်ခုချင်းစီ အဖွင့်/အပိတ်)
// ==========================================
grp_times = "⏰ Active Time Windows (နယူးယောက် စံတော်ချိန်များ)"
${activeTimes.map((t, idx) => {
  const displayTime = formatTime12h(t.hour, t.minute);
  return `t_active_${idx} = input.bool(true, "${displayTime} Line Overlay", group=grp_times)`;
}).join('\n')}

// Convert Selected Style String to Pine Built-in Style Type
get_line_style(string user_style) => user_style == "SOLID" ? line.style_solid : (user_style == "DASHED" ? line.style_dashed : (user_style == "DOTTED" ? line.style_dotted : line.style_dashed))

// Convert Font Size String
get_font_size(string user_size) => user_size == "SMALL" ? size.small : (user_size == "NORMAL" ? size.normal : (user_size == "LARGE" ? size.large : size.small))

// ==========================================
// 🗽 NEW YORK TIME CONVERSION WITH AUTOMATIC DST
// ==========================================
// In TradingView Pine Script, the 'hour' and 'minute' functions combined
// with timezones automatic DST handling will keep values matching NY market clock.
ny_hour   = hour(time, "America/New_York")
ny_minute = minute(time, "America/New_York")

// Keep track of drawn bar indices. Initializing to -1 instead of na because 
// comparing bar_index with na yields na (which is falsy), preventing execution.
var int last_draw_bar = -1

// Helper function to check hour & minute match
is_time_match(int target_h, int target_m) =>
    ny_hour == target_h and ny_minute == target_m

// Drawing logic
draw_session_mark(string txt, color col) =>
    current_style = get_line_style(line_style_sel)
    current_size = get_font_size(font_size_sel)
    
    // Draw the vertical vertical line using low and high as the anchor prices to avoid 
    // TradingView auto-clipping off-screen coordinate optimizations when using 0 and 1.
    vline = line.new(
       x1=bar_index, y1=low, 
       x2=bar_index, y2=high, 
       xloc=xloc.bar_index, 
       extend=extend.both, 
       color=col, 
       style=current_style, 
       width=line_width_inp
     )
    
    // Draw the text label
    if show_labels_inp
        y_loc = label_pos_sel == "Above Bars" ? yloc.abovebar : yloc.belowbar
        lbl_style = label_pos_sel == "Above Bars" ? label.style_label_down : label.style_label_up
        
        label.new(
           x=bar_index, 
           y=close, 
           text=txt, 
           xloc=xloc.bar_index, 
           yloc=y_loc, 
           color=use_bg_inp ? bg_color_inp : color.new(color.white, 100), 
           style=lbl_style, 
           textcolor=text_color_inp, 
           size=current_size
         )

// ==========================================
// 🎯 TIME EVALUATION & VERTICAL LINES DISPATCHER
// ==========================================
// Verify if we have already drawn on the current bar
if bar_index != last_draw_bar and timeframe.isintraday
${activeTimes.map((t, idx) => {
  const labelText = t.label ? `${t.label} (${formatTime12h(t.hour, t.minute)})` : formatTime12h(t.hour, t.minute);
  const pineCol = t.colorOverride ? colorToPine(t.colorOverride) : 'line_color_inp';
  return `    if t_active_${idx} and is_time_match(${t.hour}, ${t.minute})
        draw_session_mark("${labelText}", ${pineCol})
        last_draw_bar := bar_index`;
}).join('\n\n')}
`;
}

/**
 * Converts a hex CSS color to a Pine color equivalent
 * e.g., "#3498db" -> "color.rgb(52, 152, 219)" or predefined colors
 */
export function colorToPine(hex: string): string {
  // strip hash
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `color.rgb(${r}, ${g}, ${b})`;
  }
  
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `color.rgb(${r}, ${g}, ${b})`;
  }
  
  // fallback for standard names
  return 'color.blue';
}
